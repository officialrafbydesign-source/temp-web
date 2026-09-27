import "server-only";

import {
  createHmac,
} from "node:crypto";
import { prisma } from "@/lib/prisma";

type ConsumeAuthRateLimitArgs = {
  action: string;
  identifier: string;
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
};

export type AuthRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function getRateLimitSecret() {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set"
    );
  }

  return `${secret}:raf-auth-rate-limit`;
}

function createRateLimitKey(
  action: string,
  identifier: string
) {
  return createHmac(
    "sha256",
    getRateLimitSecret()
  )
    .update(
      `${action.trim().toLowerCase()}:${identifier
        .trim()
        .toLowerCase()}`
    )
    .digest("hex");
}

function isUniqueConstraintError(
  error: unknown
) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  );
}

function getRetryAfterSeconds(
  futureDate: Date,
  now: Date
) {
  return Math.max(
    1,
    Math.ceil(
      (
        futureDate.getTime() -
        now.getTime()
      ) / 1000
    )
  );
}

export function getRequestIp(
  req: Request
) {
  const cloudflareIp =
    req.headers.get(
      "cf-connecting-ip"
    );

  if (cloudflareIp) {
    return cloudflareIp.trim();
  }

  const forwardedFor =
    req.headers.get(
      "x-forwarded-for"
    );

  if (forwardedFor) {
    const firstIp =
      forwardedFor
        .split(",")[0]
        ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp =
    req.headers.get(
      "x-real-ip"
    );

  if (realIp) {
    return realIp.trim();
  }

  return process.env.NODE_ENV ===
    "development"
    ? "local-development"
    : "unknown-client";
}

export async function consumeAuthRateLimit({
  action,
  identifier,
  maxAttempts,
  windowMs,
  blockMs,
}: ConsumeAuthRateLimitArgs): Promise<AuthRateLimitResult> {
  if (
    maxAttempts < 1 ||
    windowMs < 1 ||
    blockMs < 1
  ) {
    throw new Error(
      "Invalid authentication rate-limit configuration"
    );
  }

  const key =
    createRateLimitKey(
      action,
      identifier
    );

  for (
    let attempt = 0;
    attempt < 2;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const now =
            new Date();

          const existing =
            await transaction.authRateLimit.findUnique({
              where: {
                key,
              },
            });

          if (!existing) {
            await transaction.authRateLimit.create({
              data: {
                key,
                attempts: 1,
                windowStartedAt:
                  now,
              },
            });

            return {
              allowed: true,
              retryAfterSeconds:
                0,
            };
          }

          if (
            existing.blockedUntil &&
            existing.blockedUntil >
              now
          ) {
            return {
              allowed: false,
              retryAfterSeconds:
                getRetryAfterSeconds(
                  existing.blockedUntil,
                  now
                ),
            };
          }

          const windowExpired =
            now.getTime() -
              existing.windowStartedAt.getTime() >=
            windowMs;

          const previousBlockExpired =
            Boolean(
              existing.blockedUntil &&
                existing.blockedUntil <=
                  now
            );

          if (
            windowExpired ||
            previousBlockExpired
          ) {
            await transaction.authRateLimit.update({
              where: {
                key,
              },
              data: {
                attempts: 1,
                windowStartedAt:
                  now,
                blockedUntil:
                  null,
              },
            });

            return {
              allowed: true,
              retryAfterSeconds:
                0,
            };
          }

          const updated =
            await transaction.authRateLimit.update({
              where: {
                key,
              },
              data: {
                attempts: {
                  increment: 1,
                },
              },
            });

          if (
            updated.attempts >
            maxAttempts
          ) {
            const blockedUntil =
              new Date(
                now.getTime() +
                  blockMs
              );

            await transaction.authRateLimit.update({
              where: {
                key,
              },
              data: {
                blockedUntil,
              },
            });

            return {
              allowed: false,
              retryAfterSeconds:
                getRetryAfterSeconds(
                  blockedUntil,
                  now
                ),
            };
          }

          return {
            allowed: true,
            retryAfterSeconds:
              0,
          };
        }
      );
    } catch (error) {
      if (
        attempt === 0 &&
        isUniqueConstraintError(
          error
        )
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to apply authentication rate limit"
  );
}

export async function clearAuthRateLimit(
  action: string,
  identifier: string
) {
  const key =
    createRateLimitKey(
      action,
      identifier
    );

  await prisma.authRateLimit
    .delete({
      where: {
        key,
      },
    })
    .catch((error) => {
      if (
        error &&
        typeof error ===
          "object" &&
        "code" in error &&
        error.code ===
          "P2025"
      ) {
        return;
      }

      throw error;
    });
}
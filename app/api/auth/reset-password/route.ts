import {
  NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";

import {
  prisma,
} from "@/lib/prisma";

import {
  deleteSession,
  passwordResetTokenMatchesPassword,
  verifyPasswordResetToken,
} from "@/lib/auth";

import {
  clearAuthRateLimit,
  consumeAuthRateLimit,
  getRequestIp,
} from "@/lib/authRateLimit";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const RESET_WINDOW_MS =
  15 * 60 * 1000;

const RESET_BLOCK_MS =
  15 * 60 * 1000;

const MAX_IP_ATTEMPTS =
  10;

const MAX_TOKEN_ATTEMPTS =
  5;

function errorResponse(
  message: string,
  status: number,
  code?: string,
  retryAfterSeconds?: number
) {
  const response =
    NextResponse.json(
      {
        error: message,
        ...(code
          ? {
              code,
            }
          : {}),
      },
      {
        status,
      }
    );

  response.headers.set(
    "Cache-Control",
    "private, no-store"
  );

  if (
    retryAfterSeconds
  ) {
    response.headers.set(
      "Retry-After",
      String(
        retryAfterSeconds
      )
    );
  }

  return response;
}

export async function POST(
  req: Request
) {
  try {
    const clientIp =
      getRequestIp(req);

    const ipRateLimit =
      await consumeAuthRateLimit({
        action:
          "reset-password-ip",
        identifier:
          clientIp,
        maxAttempts:
          MAX_IP_ATTEMPTS,
        windowMs:
          RESET_WINDOW_MS,
        blockMs:
          RESET_BLOCK_MS,
      });

    if (
      !ipRateLimit.allowed
    ) {
      return errorResponse(
        "Too many password reset attempts. Please wait before trying again.",
        429,
        "RATE_LIMITED",
        ipRateLimit.retryAfterSeconds
      );
    }

    const body =
      await req.json();

    const token =
      typeof body?.token ===
      "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body?.password ===
      "string"
        ? body.password
        : "";

    const confirmPassword =
      typeof body?.confirmPassword ===
      "string"
        ? body.confirmPassword
        : "";

    if (
      !token ||
      token.length > 4096
    ) {
      return errorResponse(
        "This password reset link is invalid or has expired.",
        400
      );
    }

    const tokenRateLimit =
      await consumeAuthRateLimit({
        action:
          "reset-password-token",
        identifier:
          token,
        maxAttempts:
          MAX_TOKEN_ATTEMPTS,
        windowMs:
          RESET_WINDOW_MS,
        blockMs:
          RESET_BLOCK_MS,
      });

    if (
      !tokenRateLimit.allowed
    ) {
      return errorResponse(
        "Too many attempts were made with this reset link. Request a new password reset email.",
        429,
        "RATE_LIMITED",
        tokenRateLimit.retryAfterSeconds
      );
    }

    if (
      password.length < 8
    ) {
      return errorResponse(
        "Your new password must contain at least 8 characters.",
        400
      );
    }

    if (
      password.length > 128
    ) {
      return errorResponse(
        "Your new password is too long.",
        400
      );
    }

    if (
      password !==
      confirmPassword
    ) {
      return errorResponse(
        "The passwords do not match.",
        400
      );
    }

    const tokenData =
      await verifyPasswordResetToken(
        token
      );

    if (!tokenData) {
      return errorResponse(
        "This password reset link is invalid or has expired.",
        400
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            tokenData.userId,
        },

        select: {
          id: true,
          password: true,
          emailVerifiedAt:
            true,
        },
      });

    if (
      !user?.password ||
      !passwordResetTokenMatchesPassword(
        user.password,
        tokenData.passwordFingerprint
      )
    ) {
      return errorResponse(
        "This password reset link is invalid or has already been used.",
        400
      );
    }

    const newPasswordHash =
      await bcrypt.hash(
        password,
        12
      );

    /**
     * Including the old password hash prevents two simultaneous
     * requests from successfully using the same reset token.
     *
     * Incrementing sessionVersion invalidates every existing
     * login session belonging to this customer.
     *
     * Completing an emailed password reset also proves control
     * of the account email address.
     */
    const updateResult =
      await prisma.user.updateMany({
        where: {
          id:
            user.id,

          password:
            user.password,
        },

        data: {
          password:
            newPasswordHash,

          sessionVersion: {
            increment: 1,
          },

          emailVerifiedAt:
            user.emailVerifiedAt ||
            new Date(),
        },
      });

    if (
      updateResult.count !==
      1
    ) {
      return errorResponse(
        "This password reset link is invalid or has already been used.",
        400
      );
    }

    await Promise.all([
      clearAuthRateLimit(
        "reset-password-ip",
        clientIp
      ),

      clearAuthRateLimit(
        "reset-password-token",
        token
      ),
    ]);

    // Clear the session held by the browser completing the reset.
    await deleteSession();

    const response =
      NextResponse.json({
        success: true,

        message:
          "Your password has been reset. All previous login sessions have been signed out.",
      });

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/reset-password error:",
      error
    );

    return errorResponse(
      "Your password could not be reset. Please request a new reset link.",
      500
    );
  }
}
import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  createPasswordResetToken,
} from "@/lib/auth";

import {
  sendPasswordResetEmail,
} from "@/lib/email";

import {
  consumeAuthRateLimit,
  getRequestIp,
} from "@/lib/authRateLimit";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS =
  60 * 60 * 1000;

const RATE_LIMIT_BLOCK_MS =
  60 * 60 * 1000;

const MAX_IP_ATTEMPTS =
  10;

const MAX_EMAIL_ATTEMPTS =
  3;

const GENERIC_MESSAGE =
  "If an account exists for that email address, a password reset link has been sent.";

function getSiteUrl() {
  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    process.env
      .NEXT_PUBLIC_DOMAIN ||
    "http://localhost:3000";

  return siteUrl.replace(
    /\/+$/,
    ""
  );
}

function successResponse() {
  const response =
    NextResponse.json({
      success: true,
      message:
        GENERIC_MESSAGE,
    });

  response.headers.set(
    "Cache-Control",
    "private, no-store"
  );

  return response;
}

function rateLimitResponse(
  retryAfterSeconds: number
) {
  const response =
    NextResponse.json(
      {
        error:
          "Too many password reset requests. Please try again later.",
        code:
          "RATE_LIMITED",
      },
      {
        status: 429,
      }
    );

  response.headers.set(
    "Cache-Control",
    "private, no-store"
  );

  response.headers.set(
    "Retry-After",
    String(
      retryAfterSeconds
    )
  );

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
          "forgot-password-ip",
        identifier:
          clientIp,
        maxAttempts:
          MAX_IP_ATTEMPTS,
        windowMs:
          RATE_LIMIT_WINDOW_MS,
        blockMs:
          RATE_LIMIT_BLOCK_MS,
      });

    if (
      !ipRateLimit.allowed
    ) {
      return rateLimitResponse(
        ipRateLimit.retryAfterSeconds
      );
    }

    const body =
      await req.json();

    const email =
      typeof body?.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    if (
      !email ||
      email.length > 254 ||
      !EMAIL_PATTERN.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const emailRateLimit =
      await consumeAuthRateLimit({
        action:
          "forgot-password-email",
        identifier:
          email,
        maxAttempts:
          MAX_EMAIL_ATTEMPTS,
        windowMs:
          RATE_LIMIT_WINDOW_MS,
        blockMs:
          RATE_LIMIT_BLOCK_MS,
      });

    if (
      !emailRateLimit.allowed
    ) {
      return rateLimitResponse(
        emailRateLimit.retryAfterSeconds
      );
    }

    const user =
      await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode:
              "insensitive",
          },
        },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

    if (
      !user ||
      !user.password
    ) {
      return successResponse();
    }

    const resetToken =
      await createPasswordResetToken(
        user.id,
        user.password
      );

    const resetUrl =
      `${getSiteUrl()}/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

    try {
      const emailResult =
        await sendPasswordResetEmail({
          toEmail:
            user.email,
          resetUrl,
        });

      if (
        emailResult.error ||
        !emailResult.data?.id
      ) {
        console.error(
          "Password reset email error:",
          emailResult.error
        );
      } else {
        console.log(
          "Password reset email sent:",
          emailResult.data.id
        );
      }
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );
    }

    return successResponse();
  } catch (error) {
    console.error(
      "POST /api/auth/forgot-password error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process the password reset request.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  }
}
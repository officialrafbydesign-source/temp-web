import {
  NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationToken,
} from "@/lib/auth";
import {
  sendEmailVerificationEmail,
} from "@/lib/email";
import {
  consumeAuthRateLimit,
  getRequestIp,
} from "@/lib/authRateLimit";

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
  "If an unverified account exists for that email address, a new verification link has been sent.";

function getSafeReturnTo(
  value: unknown
) {
  if (
    typeof value !==
      "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/account/orders";
  }

  return value;
}

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
  return NextResponse.json(
    {
      success: true,
      message:
        GENERIC_MESSAGE,
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

function rateLimitResponse(
  retryAfterSeconds: number
) {
  return NextResponse.json(
    {
      error:
        "Too many verification email requests. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control":
          "private, no-store",

        "Retry-After":
          String(
            retryAfterSeconds
          ),
      },
    }
  );
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
          "resend-verification-ip",
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
      typeof body.email ===
        "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const returnTo =
      getSafeReturnTo(
        body.returnTo
      );

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
          "resend-verification-email",
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
          name: true,
          emailVerifiedAt:
            true,
        },
      });

    if (
      !user ||
      user.emailVerifiedAt
    ) {
      return successResponse();
    }

    const verificationToken =
      await createEmailVerificationToken(
        user.id,
        user.email
      );

    const verificationUrl =
      `${getSiteUrl()}/verify-email?token=${encodeURIComponent(
        verificationToken
      )}&returnTo=${encodeURIComponent(
        returnTo
      )}`;

    try {
      const emailResult =
        await sendEmailVerificationEmail({
          toEmail:
            user.email,
          verificationUrl,
          customerName:
            user.name,
        });

      if (
        emailResult.error ||
        !emailResult.data?.id
      ) {
        console.error(
          "Resend verification email error:",
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error(
        "Resend verification email error:",
        emailError
      );
    }

    return successResponse();
  } catch (error) {
    console.error(
      "POST /api/auth/resend-verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process the verification email request.",
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
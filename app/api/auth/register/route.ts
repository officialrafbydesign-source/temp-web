import {
  NextResponse,
} from "next/server";
import bcrypt from "bcryptjs";
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

const REGISTRATION_WINDOW_MS =
  60 * 60 * 1000;

const REGISTRATION_BLOCK_MS =
  60 * 60 * 1000;

const MAX_REGISTRATIONS_PER_WINDOW =
  10;

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

function rateLimitResponse(
  retryAfterSeconds: number
) {
  return NextResponse.json(
    {
      error:
        "Too many registration attempts. Please try again later.",
      code:
        "RATE_LIMITED",
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

    const rateLimit =
      await consumeAuthRateLimit({
        action:
          "register-ip",
        identifier:
          clientIp,
        maxAttempts:
          MAX_REGISTRATIONS_PER_WINDOW,
        windowMs:
          REGISTRATION_WINDOW_MS,
        blockMs:
          REGISTRATION_BLOCK_MS,
      });

    if (!rateLimit.allowed) {
      return rateLimitResponse(
        rateLimit.retryAfterSeconds
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

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const name =
      typeof body.name ===
        "string" &&
      body.name.trim()
        ? body.name.trim()
        : null;

    const returnTo =
      getSafeReturnTo(
        body.returnTo
      );

    if (
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Email and password are required",
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

    if (
      email.length > 254 ||
      !EMAIL_PATTERN.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email address",
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

    if (
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters",
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

    if (
      password.length > 128
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be no more than 128 characters",
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

    if (
      name &&
      name.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Name must be no more than 100 characters",
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

    const existingUser =
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
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Email already registered",
        },
        {
          status: 409,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await prisma.user.create({
        data: {
          email,
          password:
            hashedPassword,
          name,
          emailVerifiedAt:
            null,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

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
          "Registration verification email error:",
          emailResult.error
        );

        return NextResponse.json(
          {
            error:
              "Your account was created, but the verification email could not be sent. Use the resend verification option.",
            accountCreated:
              true,
            verificationRequired:
              true,
          },
          {
            status: 502,
            headers: {
              "Cache-Control":
                "private, no-store",
            },
          }
        );
      }
    } catch (emailError) {
      console.error(
        "Registration verification email error:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "Your account was created, but the verification email could not be sent. Use the resend verification option.",
          accountCreated:
            true,
          verificationRequired:
            true,
        },
        {
          status: 502,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        verificationRequired:
          true,
        message:
          "Account created. Check your email to verify your account.",
        user: {
          id: user.id,
          email:
            user.email,
          name: user.name,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "POST /api/auth/register error:",
      error
    );

    if (
      error &&
      typeof error ===
        "object" &&
      "code" in error &&
      error.code ===
        "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Email already registered",
        },
        {
          status: 409,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to register user",
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
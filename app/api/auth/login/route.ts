import {
  NextResponse,
} from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSession,
} from "@/lib/auth";
import {
  clearAuthRateLimit,
  consumeAuthRateLimit,
  getRequestIp,
} from "@/lib/authRateLimit";

const LOGIN_WINDOW_MS =
  15 * 60 * 1000;

const LOGIN_BLOCK_MS =
  15 * 60 * 1000;

const MAX_IP_ATTEMPTS =
  15;

const MAX_EMAIL_ATTEMPTS =
  5;

function rateLimitResponse(
  retryAfterSeconds: number
) {
  return NextResponse.json(
    {
      error:
        "Too many login attempts. Please wait before trying again.",
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

function invalidCredentialsResponse() {
  return NextResponse.json(
    {
      error:
        "Invalid email or password",
    },
    {
      status: 401,
      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

export async function POST(
  req: Request
) {
  try {
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
      password.length > 128
    ) {
      return invalidCredentialsResponse();
    }

    const clientIp =
      getRequestIp(req);

    const ipRateLimit =
      await consumeAuthRateLimit({
        action:
          "login-ip",
        identifier:
          clientIp,
        maxAttempts:
          MAX_IP_ATTEMPTS,
        windowMs:
          LOGIN_WINDOW_MS,
        blockMs:
          LOGIN_BLOCK_MS,
      });

    if (
      !ipRateLimit.allowed
    ) {
      return rateLimitResponse(
        ipRateLimit.retryAfterSeconds
      );
    }

    const emailRateLimit =
      await consumeAuthRateLimit({
        action:
          "login-email",
        identifier:
          email,
        maxAttempts:
          MAX_EMAIL_ATTEMPTS,
        windowMs:
          LOGIN_WINDOW_MS,
        blockMs:
          LOGIN_BLOCK_MS,
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
          password: true,
          emailVerifiedAt:
            true,
        },
      });

    if (!user?.password) {
      return invalidCredentialsResponse();
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return invalidCredentialsResponse();
    }

    await Promise.all([
      clearAuthRateLimit(
        "login-ip",
        clientIp
      ),

      clearAuthRateLimit(
        "login-email",
        email
      ),
    ]);

    if (
      !user.emailVerifiedAt
    ) {
      return NextResponse.json(
        {
          error:
            "Verify your email address before signing in.",
          code:
            "EMAIL_NOT_VERIFIED",
          email:
            user.email,
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    await createSession(
      user.id
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email:
            user.email,
          name: user.name,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "POST /api/auth/login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to log in",
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
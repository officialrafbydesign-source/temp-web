import {
  NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  emailVerificationTokenMatchesEmail,
  verifyEmailVerificationToken,
} from "@/lib/auth";
import {
  consumeAuthRateLimit,
  getRequestIp,
} from "@/lib/authRateLimit";

const VERIFICATION_WINDOW_MS =
  60 * 60 * 1000;

const VERIFICATION_BLOCK_MS =
  60 * 60 * 1000;

const MAX_VERIFICATION_ATTEMPTS =
  20;

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return NextResponse.json(
    body,
    {
      status,
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
    const clientIp =
      getRequestIp(req);

    const rateLimit =
      await consumeAuthRateLimit({
        action:
          "verify-email-ip",
        identifier:
          clientIp,
        maxAttempts:
          MAX_VERIFICATION_ATTEMPTS,
        windowMs:
          VERIFICATION_WINDOW_MS,
        blockMs:
          VERIFICATION_BLOCK_MS,
      });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many verification attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Cache-Control":
              "private, no-store",

            "Retry-After":
              String(
                rateLimit.retryAfterSeconds
              ),
          },
        }
      );
    }

    const body =
      await req.json();

    const token =
      typeof body.token ===
        "string"
        ? body.token.trim()
        : "";

    if (
      !token ||
      token.length > 4096
    ) {
      return jsonResponse(
        {
          error:
            "This verification link is invalid or has expired.",
        },
        400
      );
    }

    const tokenData =
      await verifyEmailVerificationToken(
        token
      );

    if (!tokenData) {
      return jsonResponse(
        {
          error:
            "This verification link is invalid or has expired.",
        },
        400
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: tokenData.userId,
        },
        select: {
          id: true,
          email: true,
          emailVerifiedAt:
            true,
        },
      });

    if (!user) {
      return jsonResponse(
        {
          error:
            "This verification link is invalid or has expired.",
        },
        400
      );
    }

    const emailMatches =
      emailVerificationTokenMatchesEmail(
        user.email,
        tokenData.emailFingerprint
      );

    if (!emailMatches) {
      return jsonResponse(
        {
          error:
            "This verification link is invalid or has expired.",
        },
        400
      );
    }

    if (
      user.emailVerifiedAt
    ) {
      return jsonResponse(
        {
          success: true,
          alreadyVerified:
            true,
          signedIn: false,
          message:
            "This email address has already been verified. Sign in to continue.",
        },
        200
      );
    }

    const verificationResult =
      await prisma.user.updateMany({
        where: {
          id: user.id,
          emailVerifiedAt:
            null,
        },
        data: {
          emailVerifiedAt:
            new Date(),
        },
      });

    if (
      verificationResult.count !==
      1
    ) {
      return jsonResponse(
        {
          success: true,
          alreadyVerified:
            true,
          signedIn: false,
          message:
            "This email address has already been verified. Sign in to continue.",
        },
        200
      );
    }

    await createSession(
      user.id
    );

    return jsonResponse(
      {
        success: true,
        alreadyVerified:
          false,
        signedIn: true,
        message:
          "Your email address has been verified.",
      },
      200
    );
  } catch (error) {
    console.error(
      "POST /api/auth/verify-email error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Unable to verify this email address.",
      },
      500
    );
  }
}
import "server-only";

import {
  createHash,
  timingSafeEqual,
} from "node:crypto";
import {
  SignJWT,
  jwtVerify,
} from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type {
  UserRole,
} from "@prisma/client";

const SESSION_COOKIE_NAME =
  "raf_session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 24 * 7;

const PASSWORD_RESET_DURATION =
  "30m";

const EMAIL_VERIFICATION_DURATION =
  "24h";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerifiedAt: Date | null;
  role: UserRole;
};

type SessionTokenData = {
  userId: string;
  sessionVersion: number;
};

export type PasswordResetTokenData = {
  userId: string;
  passwordFingerprint: string;
};

export type EmailVerificationTokenData = {
  userId: string;
  emailFingerprint: string;
};

export type AdminAuthorizationResult =
  | {
      authorized: true;
      user: SessionUser;
    }
  | {
      authorized: false;
      status: 401 | 403;
      error: string;
    };

function getAuthSecretValue() {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set"
    );
  }

  return secret;
}

function getSessionSecret() {
  return new TextEncoder().encode(
    getAuthSecretValue()
  );
}

function getPasswordResetSecret() {
  return new TextEncoder().encode(
    `${getAuthSecretValue()}:raf-password-reset`
  );
}

function getEmailVerificationSecret() {
  return new TextEncoder().encode(
    `${getAuthSecretValue()}:raf-email-verification`
  );
}

function normalizeEmail(
  email: string
) {
  return email
    .trim()
    .toLowerCase();
}

function getPasswordFingerprint(
  passwordHash: string
) {
  return createHash("sha256")
    .update(passwordHash)
    .digest("hex");
}

function getEmailFingerprint(
  email: string
) {
  return createHash("sha256")
    .update(
      normalizeEmail(email)
    )
    .digest("hex");
}

function safeFingerprintMatch(
  currentFingerprint: string,
  tokenFingerprint: string
) {
  const currentBuffer =
    Buffer.from(
      currentFingerprint,
      "utf8"
    );

  const tokenBuffer =
    Buffer.from(
      tokenFingerprint,
      "utf8"
    );

  if (
    currentBuffer.length !==
    tokenBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    currentBuffer,
    tokenBuffer
  );
}

async function getSessionTokenData():
  Promise<SessionTokenData | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        getSessionSecret(),
        {
          algorithms: [
            "HS256",
          ],
        }
      );

    if (
      typeof payload.sub !==
        "string" ||
      typeof payload.sessionVersion !==
        "number" ||
      !Number.isInteger(
        payload.sessionVersion
      )
    ) {
      return null;
    }

    return {
      userId:
        payload.sub,

      sessionVersion:
        payload.sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        sessionVersion:
          true,
      },
    });

  if (!user) {
    throw new Error(
      "Cannot create a session for an unknown user"
    );
  }

  const token =
    await new SignJWT({
      sessionVersion:
        user.sessionVersion,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(
        `${SESSION_DURATION_SECONDS}s`
      )
      .sign(
        getSessionSecret()
      );

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        SESSION_DURATION_SECONDS,
    }
  );
}

export async function deleteSession() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge: 0,
    }
  );
}

export async function getSessionUserId() {
  const session =
    await getSessionTokenData();

  if (!session) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        sessionVersion:
          true,
      },
    });

  if (
    !user ||
    user.sessionVersion !==
      session.sessionVersion
  ) {
    return null;
  }

  return session.userId;
}

export async function getCurrentUser():
  Promise<SessionUser | null> {
  const session =
    await getSessionTokenData();

  if (!session) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          session.userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt:
          true,
        sessionVersion:
          true,
        role: true,
      },
    });

  if (
    !user ||
    user.sessionVersion !==
      session.sessionVersion
  ) {
    return null;
  }

  return {
    id:
      user.id,

    email:
      user.email,

    name:
      user.name,

    emailVerifiedAt:
      user.emailVerifiedAt,

    role:
      user.role,
  };
}

export async function requireAdmin():
  Promise<AdminAuthorizationResult> {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error:
        "Authentication required",
    };
  }

  if (
    !user.emailVerifiedAt ||
    user.role !==
      "admin"
  ) {
    return {
      authorized: false,
      status: 403,
      error:
        "Administrator access required",
    };
  }

  return {
    authorized: true,
    user,
  };
}

export async function createPasswordResetToken(
  userId: string,
  passwordHash: string
) {
  const passwordFingerprint =
    getPasswordFingerprint(
      passwordHash
    );

  return new SignJWT({
    purpose:
      "password-reset",

    passwordFingerprint,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(
      PASSWORD_RESET_DURATION
    )
    .sign(
      getPasswordResetSecret()
    );
}

export async function verifyPasswordResetToken(
  token: string
): Promise<PasswordResetTokenData | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getPasswordResetSecret(),
        {
          algorithms: [
            "HS256",
          ],
        }
      );

    if (
      payload.purpose !==
        "password-reset" ||
      typeof payload.sub !==
        "string" ||
      typeof payload.passwordFingerprint !==
        "string"
    ) {
      return null;
    }

    return {
      userId:
        payload.sub,

      passwordFingerprint:
        payload.passwordFingerprint,
    };
  } catch {
    return null;
  }
}

export function passwordResetTokenMatchesPassword(
  passwordHash: string,
  tokenFingerprint: string
) {
  const currentFingerprint =
    getPasswordFingerprint(
      passwordHash
    );

  return safeFingerprintMatch(
    currentFingerprint,
    tokenFingerprint
  );
}

export async function createEmailVerificationToken(
  userId: string,
  email: string
) {
  const emailFingerprint =
    getEmailFingerprint(
      email
    );

  return new SignJWT({
    purpose:
      "email-verification",

    emailFingerprint,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(
      EMAIL_VERIFICATION_DURATION
    )
    .sign(
      getEmailVerificationSecret()
    );
}

export async function verifyEmailVerificationToken(
  token: string
): Promise<EmailVerificationTokenData | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getEmailVerificationSecret(),
        {
          algorithms: [
            "HS256",
          ],
        }
      );

    if (
      payload.purpose !==
        "email-verification" ||
      typeof payload.sub !==
        "string" ||
      typeof payload.emailFingerprint !==
        "string"
    ) {
      return null;
    }

    return {
      userId:
        payload.sub,

      emailFingerprint:
        payload.emailFingerprint,
    };
  } catch {
    return null;
  }
}

export function emailVerificationTokenMatchesEmail(
  email: string,
  tokenFingerprint: string
) {
  const currentFingerprint =
    getEmailFingerprint(
      email
    );

  return safeFingerprintMatch(
    currentFingerprint,
    tokenFingerprint
  );
}
"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  useSearchParams,
} from "next/navigation";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

type VerificationStatus =
  | "verifying"
  | "verified"
  | "already-verified"
  | "error";

function getSafeReturnTo(
  value: string | null
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/account/orders";
  }

  return value;
}

function VerifyEmailContent() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get(
      "token"
    );

  const returnTo =
    getSafeReturnTo(
      searchParams.get(
        "returnTo"
      )
    );

  const verificationStarted =
    useRef(false);

  const [
    status,
    setStatus,
  ] =
    useState<VerificationStatus>(
      "verifying"
    );

  const [
    message,
    setMessage,
  ] = useState(
    "Checking your verification link..."
  );

  useEffect(() => {
    if (
      verificationStarted.current
    ) {
      return;
    }

    verificationStarted.current =
      true;

    if (!token) {
      setStatus(
        "error"
      );

      setMessage(
        "The verification token is missing."
      );

      return;
    }

    async function verifyEmail() {
      try {
        const response =
          await fetch(
            "/api/auth/verify-email",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body:
                JSON.stringify({
                  token,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to verify this email address."
          );
        }

        if (
          data.alreadyVerified ===
          true
        ) {
          setStatus(
            "already-verified"
          );

          setMessage(
            data.message ||
              "This email address has already been verified."
          );

          return;
        }

        if (
          data.signedIn === true
        ) {
          setStatus(
            "verified"
          );

          setMessage(
            data.message ||
              "Your email address has been verified."
          );

          return;
        }

        setStatus(
          "already-verified"
        );

        setMessage(
          "Your email address is verified. Sign in to continue."
        );
      } catch (error) {
        setStatus(
          "error"
        );

        setMessage(
          error instanceof
            Error
            ? error.message
            : "Unable to verify this email address."
        );
      }
    }

    void verifyEmail();
  }, [token]);

  const loginUrl =
    `/login?returnTo=${encodeURIComponent(
      returnTo
    )}`;

  const resendUrl =
    `/resend-verification?returnTo=${encodeURIComponent(
      returnTo
    )}`;

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {status ===
            "verifying" && (
            <>
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-zinc-300 border-t-red-600" />

              <h1 className="font-raf mt-6 text-4xl sm:text-5xl uppercase">
                Verifying Email
              </h1>

              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-base sm:text-lg text-zinc-700"
              >
                {message}
              </p>
            </>
          )}

          {status ===
            "verified" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-green-600 text-3xl font-black text-white">
                ✓
              </div>

              <h1 className="font-raf mt-6 text-4xl sm:text-5xl uppercase">
                Email Verified
              </h1>

              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-base sm:text-lg text-zinc-700"
              >
                {message}
              </p>

              <p className="mt-2 text-sm sm:text-base text-zinc-600">
                You are now signed in.
              </p>

              <Link
                href={returnTo}
                className="mt-7 flex w-full items-center justify-center rounded-lg border-2 border-black bg-red-600 px-6 py-3 text-base sm:text-lg font-black text-white transition hover:bg-red-700"
              >
                {returnTo ===
                "/checkout"
                  ? "Continue to Checkout"
                  : "View My Account"}
              </Link>
            </>
          )}

          {status ===
            "already-verified" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-blue-600 text-3xl font-black text-white">
                ✓
              </div>

              <h1 className="font-raf mt-6 text-4xl sm:text-5xl uppercase">
                Already Verified
              </h1>

              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-base sm:text-lg text-zinc-700"
              >
                {message}
              </p>

              <Link
                href={loginUrl}
                className="mt-7 flex w-full items-center justify-center rounded-lg border-2 border-black bg-red-600 px-6 py-3 text-base sm:text-lg font-black text-white transition hover:bg-red-700"
              >
                Sign In
              </Link>
            </>
          )}

          {status ===
            "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-red-600 text-3xl font-black text-white">
                !
              </div>

              <h1 className="font-raf mt-6 text-4xl sm:text-5xl uppercase">
                Verification Failed
              </h1>

              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-lg border-2 border-red-700 bg-red-50 px-4 py-4 font-bold text-red-700"
              >
                {message}
              </div>

              <Link
                href={resendUrl}
                className="mt-7 flex w-full items-center justify-center rounded-lg border-2 border-black bg-red-600 px-6 py-3 text-base sm:text-lg font-black text-white transition hover:bg-red-700"
              >
                Request a New Link
              </Link>

              <Link
                href={loginUrl}
                className="mt-3 flex w-full items-center justify-center rounded-lg border-2 border-black bg-white px-6 py-3 text-base sm:text-lg font-black text-black transition hover:bg-zinc-100"
              >
                Return to Login
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white [font-family:Arial,Helvetica,sans-serif]">
          Verifying email...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
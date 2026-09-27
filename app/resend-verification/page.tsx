"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import Link from "next/link";
import {
  useSearchParams,
} from "next/navigation";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

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

function ResendVerificationContent() {
  const searchParams =
    useSearchParams();

  const returnTo =
    getSafeReturnTo(
      searchParams.get(
        "returnTo"
      )
    );

  const initialEmail =
    searchParams.get(
      "email"
    ) || "";

  const [email, setEmail] =
    useState(
      initialEmail
    );

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setIsSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            "/api/auth/resend-verification",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email,
                  returnTo,
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
              "Unable to request a new verification email."
          );
        }

        setMessage(
          data.message ||
            "If an unverified account exists for that email address, a new verification link has been sent."
        );
      } catch (error) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to request a new verification email."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const loginUrl =
    `/login?returnTo=${encodeURIComponent(
      returnTo
    )}`;

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-raf text-4xl sm:text-5xl uppercase text-center">
            Verify Your Email
          </h1>

          <p className="mt-3 text-center text-base sm:text-lg text-zinc-700">
            Enter your account email address to request a new verification link.
          </p>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-lg border-2 border-green-800 bg-green-50 px-4 py-4 text-green-950"
            >
              <p className="font-black">
                Request received
              </p>

              <p className="mt-2 text-sm sm:text-base">
                {message}
              </p>

              <p className="mt-2 text-sm sm:text-base">
                Check your spam or junk folder if it does not appear.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 rounded-lg border-2 border-red-700 bg-red-50 px-4 py-3 font-bold text-red-700"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold uppercase tracking-wide"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target
                      .value
                  )
                }
                className="mt-2 w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-red-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="w-full rounded-lg border-2 border-black bg-red-600 px-6 py-3 text-base sm:text-lg font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Sending..."
                : "Send Verification Email"}
            </button>
          </form>

          <Link
            href={loginUrl}
            className="mt-4 flex w-full items-center justify-center rounded-lg border-2 border-black bg-white px-6 py-3 text-base sm:text-lg font-black text-black transition hover:bg-zinc-100"
          >
            Return to Login
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white [font-family:Arial,Helvetica,sans-serif]">
          Loading verification form...
        </div>
      }
    >
      <ResendVerificationContent />
    </Suspense>
  );
}
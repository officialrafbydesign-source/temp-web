"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
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

function LoginContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const returnTo =
    getSafeReturnTo(
      searchParams.get(
        "returnTo"
      )
    );

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    unverifiedEmail,
    setUnverifiedEmail,
  ] = useState("");

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
      setUnverifiedEmail(
        ""
      );

      setIsSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            "/api/auth/login",
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
                  email,
                  password,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          if (
            data?.code ===
            "EMAIL_NOT_VERIFIED"
          ) {
            setUnverifiedEmail(
              typeof data.email ===
                "string"
                ? data.email
                : email
                    .trim()
                    .toLowerCase()
            );

            setError(
              data.error ||
                "Verify your email address before signing in."
            );

            return;
          }

          throw new Error(
            data?.error ||
              "Unable to log in"
          );
        }

        router.replace(
          returnTo
        );

        router.refresh();
      } catch (error) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to log in"
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const registerUrl =
    `/register?returnTo=${encodeURIComponent(
      returnTo
    )}`;

  const generalResendUrl =
    `/resend-verification?returnTo=${encodeURIComponent(
      returnTo
    )}`;

  const accountResendUrl =
    `/resend-verification?email=${encodeURIComponent(
      unverifiedEmail
    )}&returnTo=${encodeURIComponent(
      returnTo
    )}`;

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-raf text-4xl sm:text-5xl uppercase text-center">
            Customer Login
          </h1>

          <p className="mt-3 text-center text-base sm:text-lg text-zinc-700">
            Sign in to view your orders and digital purchases.
          </p>

          {returnTo ===
            "/checkout" && (
            <p className="mt-2 text-center text-sm font-bold text-red-700">
              You will return to checkout after signing in.
            </p>
          )}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 rounded-lg border-2 border-red-700 bg-red-50 px-4 py-3 font-bold text-red-700"
            >
              <p>
                {error}
              </p>

              {unverifiedEmail && (
                <Link
                  href={
                    accountResendUrl
                  }
                  className="mt-3 inline-flex font-black text-red-800 underline underline-offset-4 hover:text-red-600"
                >
                  Resend verification email
                </Link>
              )}
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
                ) => {
                  setEmail(
                    event.target
                      .value
                  );

                  setUnverifiedEmail(
                    ""
                  );
                }}
                className="mt-2 w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-red-500/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold uppercase tracking-wide"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-black text-red-700 underline underline-offset-4 hover:text-red-600"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
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
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm sm:text-base text-zinc-700">
            <p>
              New customer?{" "}
              <Link
                href={
                  registerUrl
                }
                className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
              >
                Create an account
              </Link>
            </p>

            <p>
              Account not verified?{" "}
              <Link
                href={
                  generalResendUrl
                }
                className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
              >
                Request a new verification email
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white [font-family:Arial,Helvetica,sans-serif]">
          Loading login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
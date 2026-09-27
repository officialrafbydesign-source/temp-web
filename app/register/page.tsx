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

function RegisterContent() {
  const searchParams =
    useSearchParams();

  const returnTo =
    getSafeReturnTo(
      searchParams.get(
        "returnTo"
      )
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    registrationComplete,
    setRegistrationComplete,
  ] = useState(false);

  const [
    registeredEmail,
    setRegisteredEmail,
  ] = useState("");

  const [
    emailDeliveryFailed,
    setEmailDeliveryFailed,
  ] = useState(false);

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");
      setEmailDeliveryFailed(
        false
      );

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match"
        );

        return;
      }

      if (
        password.length < 8
      ) {
        setError(
          "Password must be at least 8 characters"
        );

        return;
      }

      if (
        password.length > 128
      ) {
        setError(
          "Password is too long"
        );

        return;
      }

      setIsSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            "/api/auth/register",
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
                  name,
                  email,
                  password,
                  returnTo,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok &&
          data.accountCreated ===
            true
        ) {
          setRegisteredEmail(
            email
              .trim()
              .toLowerCase()
          );

          setEmailDeliveryFailed(
            true
          );

          setRegistrationComplete(
            true
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to create account"
          );
        }

        setRegisteredEmail(
          email
            .trim()
            .toLowerCase()
        );

        setRegistrationComplete(
          true
        );
      } catch (error) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to create account"
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

  const resendUrl =
    `/resend-verification?email=${encodeURIComponent(
      registeredEmail
    )}&returnTo=${encodeURIComponent(
      returnTo
    )}`;

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {registrationComplete ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-red-600 text-3xl font-black text-white">
                ✓
              </div>

              <h1 className="font-raf mt-6 text-4xl sm:text-5xl uppercase text-center">
                Check Your Email
              </h1>

              {emailDeliveryFailed ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mt-6 rounded-lg border-2 border-amber-700 bg-amber-50 px-4 py-4 text-amber-900"
                >
                  <p className="font-black">
                    Your account was created, but the verification email could not be sent.
                  </p>

                  <p className="mt-2 text-sm sm:text-base">
                    Use the resend option below to request another verification email.
                  </p>
                </div>
              ) : (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-6 rounded-lg border-2 border-green-800 bg-green-50 px-4 py-4 text-green-950"
                >
                  <p className="font-black">
                    Your account has been created.
                  </p>

                  <p className="mt-2 text-sm sm:text-base">
                    We sent a verification link to:
                  </p>

                  <p className="mt-2 break-words font-black">
                    {registeredEmail}
                  </p>
                </div>
              )}

              <p className="mt-6 text-center text-sm sm:text-base text-zinc-700">
                Open the verification link before signing in. The link expires after 24 hours.
              </p>

              <p className="mt-2 text-center text-sm sm:text-base text-zinc-700">
                Check your spam or junk folder if the email does not appear.
              </p>

              <Link
                href={resendUrl}
                className="mt-7 flex w-full items-center justify-center rounded-lg border-2 border-black bg-red-600 px-6 py-3 text-base sm:text-lg font-black text-white transition hover:bg-red-700"
              >
                Resend Verification Email
              </Link>

              <Link
                href={loginUrl}
                className="mt-3 flex w-full items-center justify-center rounded-lg border-2 border-black bg-white px-6 py-3 text-base sm:text-lg font-black text-black transition hover:bg-zinc-100"
              >
                Return to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-raf text-4xl sm:text-5xl uppercase text-center">
                Create Account
              </h1>

              <p className="mt-3 text-center text-base sm:text-lg text-zinc-700">
                Create an account to access your orders and digital purchases.
              </p>

              {returnTo ===
                "/checkout" && (
                <p className="mt-2 text-center text-sm font-bold text-red-700">
                  After verifying your email and signing in, you can return to checkout.
                </p>
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
                    htmlFor="name"
                    className="block text-sm font-bold uppercase tracking-wide"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(
                      event
                    ) =>
                      setName(
                        event.target
                          .value
                      )
                    }
                    className="mt-2 w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-red-500/30"
                  />
                </div>

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

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold uppercase tracking-wide"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
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

                  <p className="mt-2 text-sm text-zinc-600">
                    Use at least 8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold uppercase tracking-wide"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
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
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm sm:text-base text-zinc-700">
                Already registered?{" "}
                <Link
                  href={
                    loginUrl
                  }
                  className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white [font-family:Arial,Helvetica,sans-serif]">
          Loading registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
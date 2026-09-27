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

function ResetPasswordContent() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get(
      "token"
    ) || "";

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
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
      setSuccessMessage("");

      if (!token) {
        setError(
          "This password reset link is invalid."
        );

        return;
      }

      if (
        password.length < 8
      ) {
        setError(
          "Your new password must contain at least 8 characters."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "The passwords do not match."
        );

        return;
      }

      setIsSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            "/api/auth/reset-password",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  token,
                  password,
                  confirmPassword,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Your password could not be reset."
          );
        }

        setSuccessMessage(
          data.message ||
            "Your password has been reset. You can now sign in."
        );

        setPassword("");
        setConfirmPassword("");

        // Remove the reset token from the visible browser URL
        // after it has been successfully used.
        window.history.replaceState(
          {},
          "",
          "/reset-password"
        );
      } catch (error) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Your password could not be reset."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const hasToken =
    Boolean(token);

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-raf text-4xl sm:text-5xl uppercase text-center">
            Reset Password
          </h1>

          <p className="mt-3 text-center text-base sm:text-lg text-zinc-700">
            Choose a new password
            for your RAF By Design
            customer account.
          </p>

          {!hasToken && (
            <div
              role="alert"
              className="mt-6 rounded-lg border-2 border-red-700 bg-red-50 px-4 py-3 font-bold text-red-700"
            >
              This password reset
              link is missing or
              invalid.
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

          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-lg border-2 border-green-800 bg-green-50 px-4 py-3 font-bold text-green-800"
            >
              {
                successMessage
              }
            </div>
          )}

          {hasToken &&
            !successMessage && (
              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold uppercase tracking-wide"
                  >
                    New password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event
                          .target
                          .value
                      )
                    }
                    className="mt-2 w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-red-500/30"
                  />

                  <p className="mt-2 text-sm text-zinc-600">
                    Use at least
                    8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold uppercase tracking-wide"
                  >
                    Confirm new
                    password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event
                          .target
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
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>
              </form>
            )}

          <div className="mt-6 text-center text-sm sm:text-base">
            {successMessage ? (
              <Link
                href="/login"
                className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
              >
                Continue to login
              </Link>
            ) : (
              <Link
                href="/forgot-password"
                className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
              >
                Request a new
                reset link
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white [font-family:Arial,Helvetica,sans-serif]">
          Loading password
          reset...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import RafAboutBackground from "@/components/raf/RafAboutBackground";

export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
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
      setIsSubmitting(
        true
      );

      try {
        const response =
          await fetch(
            "/api/auth/forgot-password",
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
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to request a password reset."
          );
        }

        setSuccessMessage(
          data.message ||
            "If an account exists for that email address, a password reset link has been sent."
        );

        setEmail("");
      } catch (error) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to request a password reset."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <section className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-raf text-4xl sm:text-5xl uppercase text-center">
            Forgot Password
          </h1>

          <p className="mt-3 text-center text-base sm:text-lg text-zinc-700">
            Enter the email
            address connected
            to your customer
            account.
          </p>

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
                ? "Sending Reset Link..."
                : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm sm:text-base text-zinc-700">
            Remembered your
            password?{" "}
            <Link
              href="/login"
              className="font-black text-red-700 underline underline-offset-4 hover:text-red-600"
            >
              Return to login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to log out");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to log out"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2 [font-family:Arial,Helvetica,sans-serif]">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="rounded-lg border-2 border-black bg-black px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing Out..." : "Sign Out"}
      </button>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
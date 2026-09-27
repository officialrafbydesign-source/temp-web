"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.error ||
            "Unable to log out"
        );
      }

      router.replace(
        "/login?returnTo=/admin"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to log out"
      );

      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded bg-gray-700 px-3 py-1 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut
        ? "Logging Out..."
        : "Logout"}
    </button>
  );
}
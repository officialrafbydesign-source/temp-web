"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterSignup({ variant = "popup", onSubscribed }: {
  variant?: "popup" | "footer";
  onSubscribed?: (status: "subscribed" | "pending") => void;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const compact = variant === "footer";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success !== true || !["pending", "subscribed"].includes(data.status) || typeof data.message !== "string") {
        throw new Error(data?.error || "We couldn’t subscribe you. Please try again.");
      }
      try {
        if (data.status === "subscribed") localStorage.setItem("raf_subscribed", "true");
        else sessionStorage.setItem("raf_subscription_requested", "true");
      } catch { /* Signup remains successful if browser storage is unavailable. */ }
      setMessage(data.message);
      setStatus("success");
      onSubscribed?.(data.status);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We couldn’t subscribe you. Please try again.");
    }
  }

  if (status === "success") {
    return <p role="status" className={compact ? "max-w-xs text-sm text-green-300" : "border-4 border-black bg-green-500 p-3 text-center text-xs font-bold"}>{message}</p>;
  }
  return (
    <form onSubmit={handleSubmit} className={compact ? "w-full max-w-sm space-y-2" : "space-y-3"} aria-label="Subscribe to RAF">
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>Website<input name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className={compact ? "flex min-w-0 gap-2" : "space-y-3"}>
        <input type="email" name="email" aria-label="Email address for RAF updates" placeholder={compact ? "Enter your email" : "EMAIL ADDRESS"} value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" disabled={status === "loading"}
          className={compact ? "min-w-0 flex-1 rounded-md border border-red-800 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-red-500" : "w-full border-4 border-black bg-zinc-100 p-3 text-xs font-bold text-black placeholder-zinc-400 focus:outline-none"} />
        <button type="submit" disabled={status === "loading"}
          className={compact ? "shrink-0 rounded-md bg-red-800 px-4 py-2 text-xs text-white transition hover:bg-red-700 disabled:opacity-60" : "w-full border-4 border-black bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:bg-red-500 disabled:opacity-60"}>
          {status === "loading" ? "Subscribing…" : compact ? "Join" : "Subscribe"}
        </button>
      </div>
      {status === "error" && <p role="alert" className={compact ? "max-w-xs text-xs text-red-300" : "text-center text-xs font-bold text-red-700"}>{message}</p>}
    </form>
  );
}

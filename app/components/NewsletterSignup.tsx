"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("YOU ARE IN THE MATRIX. INBOX VERIFIED.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "FAILED TO JOIN MATRIX.");
      }
    } catch {
      setStatus("error");
      setMessage("CONNECTION ERROR.");
    }
  };

  return (
    <div className="rounded-2xl border-4 border-black bg-black/90 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono max-w-xl mx-auto">
      <div className="space-y-2 mb-4">
        <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">// VIP TRANSMISSIONS</p>
        <h3 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">Join The Matrix List</h3>
        <p className="text-xs text-zinc-400 uppercase">Get early access to beat drops, clothing releases, and studio discounts.</p>
      </div>

      {status === "success" ? (
        <div className="p-4 border-2 border-black bg-yellow-500 text-black font-black text-xs uppercase tracking-wider text-center rounded">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL..."
              required
              className="flex-1 bg-zinc-950 border-2 border-black p-3 text-xs uppercase text-white font-mono focus:outline-none focus:border-yellow-500 rounded"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded border-4 border-black bg-yellow-500 hover:bg-yellow-400 px-6 py-3 font-mono font-black text-xs uppercase text-black tracking-wider transition shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              {status === "loading" ? "SUBMITTING..." : "JOIN NOW"}
            </button>
          </div>
          {status === "error" && <p className="text-xs text-red-500 font-bold uppercase">{message}</p>}
        </form>
      )}
    </div>
  );
}
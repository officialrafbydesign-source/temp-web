"use client";

import { useEffect, useState } from "react";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const hasSubscribed = localStorage.getItem("raf_subscribed");
    if (!hasSubscribed) {
      const timer = setTimeout(() => setIsOpen(true), 5000); // Trigger pop up after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        localStorage.setItem("raf_subscribed", "true");
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white text-black border-8 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-sm font-mono font-black hover:text-red-600 transition"
        >
          [CLOSE]
        </button>

        <h3 className="font-mono text-xl font-black tracking-wider uppercase border-b-4 border-black pb-2 mb-4">
          KEEP UP WITH RAF BY DESIGN
        </h3>
        <p className="text-xs font-mono uppercase font-bold text-zinc-600 tracking-wide mb-4">
          Subscribe for new beats, music releases, HipHop100 drops, design updates and RAF news.
        </p>

        {status === "success" ? (
          <div className="bg-green-500 border-4 border-black font-mono font-black text-xs p-3 text-center uppercase tracking-widest">
            Thanks for subscribing. You're on the RAF By Design mailing list.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-100 border-4 border-black p-3 text-xs font-mono text-black placeholder-zinc-400 font-bold focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-red-600 hover:bg-red-500 text-black border-4 border-black font-mono text-xs font-black tracking-widest py-3 uppercase transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {status === "loading" ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>
            {status === "error" && (
              <p className="text-[10px] font-mono text-red-600 uppercase font-black text-center">
                COULD NOT SUBSCRIBE. PLEASE TRY AGAIN.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

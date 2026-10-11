"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import NewsletterSignup from "@/components/forms/NewsletterSignup";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const alreadyRequested = () => {
      try {
        return localStorage.getItem("raf_subscribed") === "true" || sessionStorage.getItem("raf_subscription_requested") === "true";
      } catch { return false; }
    };
    if (!alreadyRequested()) {
      const timer = setTimeout(() => { if (!alreadyRequested()) setIsOpen(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="raf-subscribe-heading" className="relative w-full max-w-md rounded-2xl border-8 border-black bg-white p-6 pt-12 text-black shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <button type="button" onClick={() => setIsOpen(false)} className="absolute right-3 top-3 text-sm font-black transition hover:text-red-600" aria-label="Close subscription popup">[CLOSE]</button>
        <h3 id="raf-subscribe-heading" className="mb-4 border-b-4 border-black pb-2 font-raf text-2xl font-normal uppercase tracking-wider">SUBSCRIBE TO RAF</h3>
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-zinc-600">Subscribe for new beats, music releases, HipHop100 drops, design updates and RAF news.</p>
        <NewsletterSignup />
      </div>
    </div>,
    document.body,
  );
}

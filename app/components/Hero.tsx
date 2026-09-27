"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[500px] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-black/60 to-black/20">
      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Elevate Your Music & Design
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-2xl text-white/80 max-w-xl mb-8">
        Explore beats, digital art, clothing, and more — all designed by RAF By Design.
      </p>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/music"
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition"
        >
          Browse Music
        </Link>
        <Link
          href="/designs"
          className="px-6 py-3 border border-white text-white rounded hover:bg-white hover:text-black transition"
        >
          View Designs
        </Link>
      </div>

      {/* Optional background pattern overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-repeat opacity-20 -z-10"
      />
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

// SAFE IMAGE COMPONENT
function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-2 text-center border-b-2 border-black">
        <span className="text-red-500 text-[10px] font-mono uppercase tracking-widest font-black">
          RAF MEDIA PENDING
        </span>
        <p className="text-[9px] text-zinc-500 line-clamp-1 italic font-mono">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      className={`${props.className || ""} object-cover w-full h-full`}
      loading="lazy"
    />
  );
}

export default function AudioExamplesPage() {
  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-24 pt-24 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* ========================================================
          HEADER HERO SECTION
         ======================================================== */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.45em] text-red-500 font-mono font-black mb-2">
            RAF BY DESIGN • AUDIO EXAMPLES
          </p>
          <h1
            className="font-raf text-3xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
            style={{
              WebkitTextStroke: "2px #000",
              paintOrder: "stroke fill",
            }}
          >
            AUDIO EXAMPLES & WORK
          </h1>
          <p className="mt-3 text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-mono font-bold max-w-2xl mx-auto">
            Explore real project comparisons demonstrating our mixdown, editing, custom beat alterations, and production capabilities.
          </p>
        </div>
      </header>

      {/* ========================================================
          MARQUEE TICKER BANNER
         ======================================================== */}
      <div className="w-full bg-red-600 border-b-4 border-black text-black font-mono text-xs uppercase font-black tracking-widest py-2.5 overflow-hidden whitespace-nowrap select-none relative z-10 shadow-md">
        <div className="inline-block animate-[marquee_25s_linear_infinite] will-change-transform">
          ⚡ RECORDING • MIXDOWN • TRACK EDITING • VOCAL PROCESSING • CUSTOM BEAT ALTERATIONS • MASTERING READY • ⚡ RECORDING • MIXDOWN • TRACK EDITING • VOCAL PROCESSING • CUSTOM BEAT ALTERATIONS • MASTERING READY •
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT CONTAINER (ALL SECTIONS IN ONE RECTANGLE)
         ======================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 relative z-10">
        <FadeIn>
          <div className="w-full rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-16">

            {/* SECTION 1: EXAMPLE MIXDOWN (HEADING 2) */}
            <div className="space-y-8">
              <div className="border-b-2 border-zinc-800 pb-6">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
                  [DEMO SHOWCASE]
                </span>
                <h2 className="font-raf text-3xl sm:text-5xl uppercase tracking-wide text-white mt-1">
                  EXAMPLE MIXDOWN
                </h2>
                <h3 className="font-mono text-sm text-zinc-300 font-bold uppercase tracking-wider mt-1">
                  Fend x K. Simmz — A To B
                </h3>
                <p className="mt-3 font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
                  Take a listen to a comparison and see the process from recorded to mixed vocals ready for mastering.
                  Below is a before and after of Simmz's vocal with and without any mix applied.
                </p>
              </div>

              {/* 4-VIDEO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Video 1: Before */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-white">Before</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      A to B Simmz before.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20B%20Simmz%20before.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Video 2: Before — Mix View */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-white">Before — Mix View</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      A to B Simmz before mix.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20B%20Simmz%20before%20mix.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Video 3: After */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-red-500">After</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      A to B Simmz after.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20B%20Simmz%20after.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Video 4: After — Mix View */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-red-500">After — Mix View</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      A to B Simmz after mix.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20B%20Simmz%20after%20mix.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: MIXDOWN STAGES */}
            <div className="space-y-8 pt-8 border-t-2 border-zinc-800">
              <div className="border-b-2 border-zinc-800 pb-6">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
                  [PROCESS BREAKDOWN]
                </span>
                <h2 className="font-raf text-3xl sm:text-4xl uppercase tracking-wide text-white mt-1">
                  MIXDOWN STAGES
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stage 1 */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <div className="pb-3 mb-3 border-b border-zinc-800">
                      <span className="font-raf text-xl uppercase tracking-wide text-white">1. Levels</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 mb-4">
                      <video
                        src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20Fend%20level.mp4"
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                      We start by adding channel effects to each track, cleaning/fixing any mistakes or errors and bringing all vocals up to a consistent level ready to proceed.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <div className="pb-3 mb-3 border-b border-zinc-800">
                      <span className="font-raf text-xl uppercase tracking-wide text-white">2. Bus Channels</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 mb-4">
                      <video
                        src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20B%20fend%20Bus.mp4"
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                      Once we have done all tracks we then start to group tracks into bus channels and add effects to create a unified mix.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <div className="pb-3 mb-3 border-b border-zinc-800">
                      <span className="font-raf text-xl uppercase tracking-wide text-white">3. Final Channels</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 mb-4">
                      <video
                        src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/A%20to%20Fend%20channels.mp4"
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                      The bus channels of different track groups (verse, chorus) have effects added to them. Additional bus effects, beat editing/automation, vocal or general pitch shifting, and other specific effects will be added at this point with a limiter on the master ready for full mastering.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: BEAT ALTERATION EXAMPLES */}
            <div className="space-y-8 pt-8 border-t-2 border-zinc-800">
              <div className="border-b-2 border-zinc-800 pb-6">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500">
                  [CUSTOM ALTERATIONS]
                </span>
                <h2 className="font-raf text-3xl sm:text-4xl uppercase tracking-wide text-white mt-1">
                  BEAT ALTERATION EXAMPLES
                </h2>
                <p className="mt-2 font-mono text-xs sm:text-sm text-zinc-300">
                  A comparison of adjustments and structural changes we can make to your beats.
                </p>
                <h3 className="font-raf text-lg uppercase text-red-500 mt-4">
                  Test Beat — Block Stories
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Example A */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-white">Drum Sound Change</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      beat change drum sound.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/beat%20change%20drum%20sound.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Example B */}
                <div className="rounded-xl border-2 border-black bg-zinc-950 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-raf text-lg uppercase tracking-wide text-white">Tempo Change</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-black px-2 py-0.5 rounded">
                      beat change tempo.mp4
                    </span>
                  </div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    <video
                      src="https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/videos/examples/beat%20change%20tempo.mp4"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: IMAGE CARDS (BEAT SERVICES & HOW IT WORKS) */}
            <div className="pt-8 border-t-2 border-zinc-800 space-y-6">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-red-500 block">
                [EXPLORE MORE OPTIONS]
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Beat Services */}
                <Link
                  href="/beats/services"
                  className="group block overflow-hidden rounded-xl border-2 border-black bg-zinc-950 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,0,.3)]"
                >
                  <div className="relative aspect-[6/1] w-full rounded-lg overflow-hidden border border-black">
                    <SafeImage
                      src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068278/Beat_Services_Image_gqmjiu.jpg"
                      alt="Beat Services"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-3 px-2 pb-1 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-black text-red-500 uppercase tracking-widest">
                        PACKAGES & PRICING
                      </span>
                      <h4 className="font-raf text-lg text-white">BEAT SERVICES ↗</h4>
                    </div>
                  </div>
                </Link>

                {/* Card 2: How It Works */}
                <Link
                  href="/how-it-works"
                  className="group block overflow-hidden rounded-xl border-2 border-black bg-zinc-950 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,0,.3)]"
                >
                  <div className="relative aspect-[6/1] w-full rounded-lg overflow-hidden border border-black">
                    <SafeImage
                      src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068289/How_It_Works_Image_fmqnsd.jpg"
                      alt="How It Works"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-3 px-2 pb-1 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-black text-red-500 uppercase tracking-widest">
                        PROCESS GUIDANCE
                      </span>
                      <h4 className="font-raf text-lg text-white">HOW IT WORKS ↗</h4>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </FadeIn>
      </section>
    </main>
  );
}
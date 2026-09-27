"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

// ========================================================
// SAFE IMAGE COMPONENT
// ========================================================
function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-2 text-center border-b-2 border-black">
        <span className="text-red-500 text-[8px] font-mono uppercase tracking-widest mb-0.5 font-black">
          RAF MEDIA PENDING
        </span>
        <p className="text-[8px] text-zinc-500 line-clamp-2 px-1 italic font-mono">{alt}</p>
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

const featuredServices = [
  {
    title: "Recording + Mixdown",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068361/WEBSITE_BUTTON_TRACK_RECORDING_MIXDOWN_tfoim3.png",
    requestLink: "/beats/services/book",
    eyebrow: "Studio recording support",
    description:
      "Recording and mixdown sessions for artists needing vocal tracking, engineering, and mix preparation.",
    bullets: [
      "£30 per hour (Minimum 2 hours)",
      "track mixing include levelling, channel effects, beat editing, vocal effects, automation.",
      "Suitable for vocal & studio sessions",
    ],
  },
  {
    title: "Track Mixdown / Edit",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068345/WEBSITE_BUTTON_TRACK_MIXDOWN_m64x8g.png",
    requestLink: "/beats/services/book",
    eyebrow: "External track mixing",
    description:
      "Mixdown and edit service for tracks recorded externally and mixed within the RAF By Design home studio setup.",
    bullets: [
      "£20 per track",
      "track mixing include levelling, channel effects, beat editing, vocal effects, automation.",
      "Externally recorded sessions accepted",
    ],
  },
  {
    title: "Other Audio Editing",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068303/WEBSITE_BUTTON_OTHER_AUDIO_EDITING_tbdu6r.png",
    requestLink: "/beats/services/book",
    eyebrow: "Voice and media editing",
    description:
      "Editing services for podcasts, voiceovers, spoken audio, cleanup work, and other vocal/audio projects.",
    bullets: [
      "From £20 per track",
      "Podcast & voiceover editing",
      "Audio cleanup and repair",
    ],
  },
  {
    title: "Custom Beat Production",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068279/Custom_uonhsx.png",
    requestLink: "/beats/services/book",
    eyebrow: "From idea to full beat",
    description:
      "Built around your sound, reference tracks, artist direction, and release goals.",
    bullets: [
      "Pricing: Custom quote",
      "Turnaround: 3–7 days",
      "Original production & arrangement guidance",
    ],
  },
  {
    title: "Full Production Deal",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068287/Full_Production_Deal_c86qju.png",
    requestLink: "/beats/services/book",
    eyebrow: "Full track support",
    description:
      "A complete production package for artists needing support from recording through to final mastered delivery.",
    bullets: [
      "Complete end-to-end production package",
      "Recording, mixdown, editing, and delivery support",
    ],
  },
];

export default function BeatServicesPage() {
  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-20 pt-24 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.80)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h1 className="font-raf text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            MUSIC SERVICES
          </h1>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 space-y-6 pt-6 relative z-10">

        {/* SECTION TITLE PANEL */}
        <FadeIn>
          <div className="w-full rounded-xl bg-black/85 backdrop-blur-md border-4 border-black p-4 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-raf text-xl sm:text-2xl uppercase tracking-wide text-white">
              Custom Beat Production, Studio Recording, Mixdown & Audio Editing
            </h2>
          </div>
        </FadeIn>

        {/* INCLUDED DELIVERABLES TEXT BOX BEFORE SERVICES */}
        <FadeIn>
          <div className="w-full rounded-xl border-4 border-black bg-zinc-950/90 backdrop-blur-md p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-l-8 border-l-red-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-sm text-white">
              <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-red-500 font-bold text-sm">›</span>
                <span>Full Mixdown of your session on Pro Tools</span>
              </div>
              <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-red-500 font-bold text-sm">›</span>
                <span>ZIP Folder of Track with WAV Files sent to your email or Cloud Storage</span>
              </div>
              <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-red-500 font-bold text-sm">›</span>
                <span>Up to 2 Revisions</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* SERVICES GRID */}
        <section id="services" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredServices.map((service, index) => (
            <FadeIn key={service.title}>
              <FeaturedServiceCard {...service} index={index} />
            </FadeIn>
          ))}
        </section>

        {/* BEAT STORE BANNER LINK */}
        <FadeIn>
          <Link
            href="/beats/store"
            className="group block overflow-hidden rounded-xl border-4 border-black bg-black/75 backdrop-blur-md p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,0,0,.35)]"
          >
            <div className="relative aspect-[21/6] rounded-lg overflow-hidden border-2 border-black">
              <SafeImage
                src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068277/Beat_Store_Banner_rawdke.png"
                alt="Beat Store Banner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-center">
                <h3 className="font-raf text-lg sm:text-2xl text-white">
                  BROWSE READY-MADE BEATS
                </h3>
              </div>
            </div>
          </Link>
        </FadeIn>

        {/* NEED MORE INFO CTA BLOCK */}
        <FadeIn>
          <section className="w-full rounded-xl bg-black/75 backdrop-blur-md border-4 border-black p-5 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-raf text-xl sm:text-2xl uppercase tracking-wide text-white">
              Need More Info?
            </h2>
            <p className="mt-2 max-w-lg mx-auto text-white font-mono text-sm leading-6">
              View audio examples or learn how the music production pipeline works before selecting your option.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/beats/services/examples"
                className="w-full sm:w-auto rounded-lg border-2 border-black bg-zinc-900 px-5 py-2 font-mono text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition-all hover:-translate-y-0.5"
              >
                View Examples
              </Link>

              <Link
                href="/how-it-works"
                className="w-full sm:w-auto rounded-lg border-2 border-black bg-red-600 px-5 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 transition-all hover:-translate-y-0.5"
              >
                How It Works
              </Link>
            </div>
          </section>
        </FadeIn>

      </section>
    </main>
  );
}

function FeaturedServiceCard({
  title,
  image,
  requestLink,
  eyebrow,
  description,
  bullets,
  index,
}: {
  title: string;
  image: string;
  requestLink: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  index: number;
}) {
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border-4 border-black bg-black/80 backdrop-blur-md p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-600">
      <div>
        {/* COMPACT CARD MEDIA CONTAINER */}
        <Link
          href={requestLink}
          className="block relative h-20 w-full overflow-hidden rounded-lg border-2 border-black bg-zinc-950 mb-3 group-hover:border-red-600 transition-colors flex items-center justify-center p-1"
        >
          <SafeImage
            src={image}
            alt={title}
            className="w-full h-full max-w-[94%] max-h-[94%] sm:max-w-full sm:max-h-full !object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* CARD CONTENT */}
        <h3 className="font-raf text-lg uppercase tracking-wide text-white">
          {title}
        </h3>

        <p className="mt-2 font-mono text-sm text-zinc-200 leading-6 border-b border-zinc-800/80 pb-3">
          {description}
        </p>

        {/* BULLETS / SPECIFICATIONS */}
        <ul className="mt-3 space-y-2 font-mono text-sm text-white">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-1.5 leading-snug">
              <span className="text-red-500 font-bold flex-shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTON */}
      <div className="mt-5 pt-3 border-t-2 border-black">
        <Link
          href={requestLink}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-red-600 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 transition-all hover:-translate-y-0.5"
        >
          <span>BOOK SESSION / REQUEST</span>
          <span>↗</span>
        </Link>
      </div>
    </article>
  );
}
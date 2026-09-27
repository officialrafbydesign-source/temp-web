"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Eye, ArrowLeft } from "lucide-react";

const sections = [
  {
    number: "01",
    title: "Overview",
    image: "/images/How It Works Design Image.jpg",
    text: "Start here for a general overview of how RAF By Design design services work. This explains the available design services, booking process, project requirements, revisions, and what to expect when submitting a design request.",
  },
  {
    number: "02",
    title: "Service List",
    image: "/images/Design Services Image.jpg",
    text: "This card shows the current design service list and available options. Use it as a quick reference when deciding which design service best matches your project.",
  },
  {
    number: "03",
    title: "Booking Requests",
    image: "/images/RAF- WEBSITE CARDS- Booking Requests Design.png",
    text: "Submit a booking request for your chosen design service. Provide your project details, requirements, deadline, reference material, and payment preference so the project can be reviewed and processed.",
  },
];

export default function DesignHowItWorksPage() {
  return (
    <main
      className="w-full min-h-screen text-white relative pb-24 pt-24 overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('/images/WEBSITE BACKGROUND BLUE.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      <style>
        {`
          @font-face {
            font-family: "RAF Font Demo";
            src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }

          .raf-heading {
            font-family: "RAF Font Demo", sans-serif;
          }
        `}
      </style>

      {/* HEADER */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h1 className="raf-heading text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            HOW SERVICES WORK
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-12 relative z-10">
        {/* BACK LINK */}
        <div>
          <Link
            href="/design/services"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border-2 border-black px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-white hover:bg-zinc-800 hover:border-blue-500 transition"
          >
            <ArrowLeft className="w-4 h-4 text-blue-500" />
            Back to Design Services
          </Link>
        </div>

        {/* SHORT USEFUL INTRO */}
        <section className="w-full rounded-2xl border-4 border-black bg-black/80 backdrop-blur-md p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="mx-auto max-w-3xl font-mono text-sm sm:text-base leading-7 text-white">
            Review the RAF By Design design workflow, available services,
            booking process and project requirements.
          </p>
        </section>

        {/* GUIDES */}
        <section className="space-y-8">
          <div className="border-b-2 border-zinc-800/80 pb-3 text-center">
            <h2 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
              Service Workflow Breakdown
            </h2>
          </div>

          <div className="grid gap-8">
            {sections.map((section) => (
              <GuideCard key={section.title} {...section} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function GuideCard({
  number,
  title,
  image,
  text,
}: {
  number: string;
  title: string;
  image: string;
  text: string;
}) {
  const [error, setError] = useState(false);

  return (
    <article className="rounded-3xl border-4 border-black bg-zinc-950/85 backdrop-blur-md p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:border-zinc-800 transition">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-center">
        <div className="space-y-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-md bg-blue-600 border-2 border-black text-black font-mono font-black text-sm">
              STEP {number}
            </span>
          </div>

          <h3 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
            {title}
          </h3>

          <a
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:hidden block group overflow-hidden rounded-xl border-2 border-black bg-black transition aspect-[16/10] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative"
          >
            {error ? (
              <div className="w-full h-full flex items-center justify-center p-4 text-center bg-zinc-900">
                <p className="text-sm text-zinc-300 font-mono">{title}</p>
              </div>
            ) : (
              <img
                src={image}
                alt={title}
                onError={() => setError(true)}
                className="w-full h-full object-contain bg-black group-hover:scale-[1.02] transition duration-300"
                loading="lazy"
              />
            )}
          </a>

          <p className="text-white font-mono text-sm sm:text-base leading-7 border-t border-zinc-900 pt-4">
            {text}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={image}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 border-2 border-black px-5 py-3 text-center font-mono text-sm font-black text-white hover:bg-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Screen
            </a>

            <a
              href={image}
              download
              className="rounded-lg bg-zinc-900 border-2 border-black px-5 py-3 text-center font-mono text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Card Copy
            </a>
          </div>
        </div>

        <a
          href={image}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:block group overflow-hidden rounded-2xl border-4 border-black bg-black transition aspect-[16/10] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative"
        >
          {error ? (
            <div className="w-full h-full flex items-center justify-center p-4 text-center bg-zinc-900">
              <p className="text-sm text-zinc-300 font-mono">{title}</p>
            </div>
          ) : (
            <img
              src={image}
              alt={title}
              onError={() => setError(true)}
              className="w-full h-full object-contain bg-black group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
          )}
        </a>
      </div>
    </article>
  );
}

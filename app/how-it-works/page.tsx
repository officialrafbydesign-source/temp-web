"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";

const sections = [
  {
    number: "01",
    title: "Overview",
    image: "/images/RAF- WEBSITE CARDS- HOW SERVICES WORK-MUSIC OVERVIEW.png",
    text: "An overview of how RAF By Design services operate, from booking requests through to delivery and project completion.",
  },
  {
    number: "02",
    title: "Music Booking Requests",
    image: "/images/RAF- WEBSITE CARDS- Booking Requests Music.png",
    text: "Learn how music production, recording, mixdown, editing, and beat service requests are submitted, reviewed, and scheduled.",
  },
  {
    number: "03",
    title: "Design Booking Requests",
    image: "/images/RAF- WEBSITE CARDS- Booking Requests Design.png",
    text: "Learn how design projects are submitted, approved, revised, and prepared before work begins.",
  },
  {
    number: "04",
    title: "Payments",
    image: "/images/RAF- WEBSITE CARDS- Payment.png",
    text: "Information about deposits and payment schedules.",
  },
  {
    number: "05",
    title: "Revisions",
    image: "/images/RAF- WEBSITE CARDS- Revisions.png",
    text: "Understand revisions and how additional changes are handled.",
  },
  {
    number: "06",
    title: "File Formats & Delivery",
    image: "/images/RAF- WEBSITE CARDS- File Format.png",
    text: "See the available delivery formats for audio, design files and delivery options.",
  },
  {
    number: "07",
    title: "Copyright & Leasing",
    image: "/images/RAF- WEBSITE CARDS- Copyrights Leasing.png",
    text: "Understand ownership, licensing, usage rights, commercial use and obligations.",
  },
];

export default function HowItWorksPage() {
  return (
    <main
      className="how-it-works-page w-full min-h-screen text-black relative pb-24 pt-24 overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.7)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068289/hero-bg_i9wczh.jpg')",
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "900px auto",
        backgroundAttachment: "fixed",
      }}
    >
      <style jsx global>{`
        @font-face {
          font-family: "RAF Font Demo";
          src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .how-it-works-page {
          font-family: Arial, Helvetica, sans-serif;
        }

        .how-it-works-page .font-raf,
        .how-it-works-page .raf-heading {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <header className="w-full bg-white/95 backdrop-blur-sm border-y-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.12)]">
        <div className="w-full px-6 py-10 text-center">
          <h1 className="raf-heading text-4xl sm:text-6xl lg:text-7xl tracking-wide uppercase text-black">
            HOW SERVICES WORK
          </h1>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10 pt-8 space-y-12 relative z-10">
        <section className="w-full rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="mx-auto max-w-4xl text-base sm:text-lg leading-8 text-zinc-700">
            Use this guide to understand booking requests, payments, revisions,
            file formats, delivery, and usage rights across both music and
            design services.
          </p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <a
              href="/beats/services/how-it-works"
              className="rounded-xl border-2 border-black bg-red-600 px-7 py-4 text-center text-base font-black uppercase text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5"
            >
              Music Services
            </a>

            <a
              href="/design/services/how-it-works"
              className="rounded-xl border-2 border-black bg-blue-600 px-7 py-4 text-center text-base font-black uppercase text-white hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5"
            >
              Design Services
            </a>
          </div>
        </section>

        <section className="space-y-8">
          <div className="border-b-4 border-black pb-4 text-center">
            <h2 className="raf-heading text-3xl sm:text-4xl uppercase tracking-wide text-black">
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
    <article className="rounded-3xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:bg-zinc-50">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-center">
        <div className="space-y-4">
          <div>
            <span className="inline-block rounded-md border-2 border-black bg-black px-3 py-1 text-sm font-black uppercase text-white">
              STEP {number}
            </span>
          </div>

          <h3 className="raf-heading text-3xl sm:text-4xl uppercase tracking-wide text-black">
            {title}
          </h3>

          <p className="border-t-2 border-zinc-200 pt-4 text-base sm:text-lg leading-8 text-zinc-700">
            {text}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={image}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-black bg-black px-5 py-3 text-center text-sm sm:text-base font-black uppercase text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Screen
            </a>

            <a
              href={image}
              download
              className="rounded-lg border-2 border-black bg-white px-5 py-3 text-center text-sm sm:text-base font-bold uppercase text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center gap-2"
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
          className="group block overflow-hidden rounded-2xl border-4 border-black bg-zinc-100 transition aspect-[16/10] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative"
        >
          {error ? (
            <div className="w-full h-full flex items-center justify-center p-4 text-center bg-zinc-100">
              <p className="text-base text-zinc-700">{title}</p>
            </div>
          ) : (
            <img
              src={image}
              alt={title}
              onError={() => setError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
          )}
        </a>
      </div>
    </article>
  );
}

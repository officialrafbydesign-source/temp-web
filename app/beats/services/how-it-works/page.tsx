"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";

const LEASING_CONTRACT_DOCX =
  "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Lease_26_jmadfr.docx";

const EXCLUSIVE_CONTRACT_DOCX =
  "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Exclu_26_jeufuz.docx";

const getOfficeViewerUrl = (url: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

const sections = [
  {
    number: "01",
    title: "Overview",
    image: "/images/RAF- WEBSITE CARDS- HOW SERVICES WORK-MUSIC OVERVIEW.png",
    text: "Start here for a general overview of how RAF By Design music services work. This explains the difference between instant beat purchases, custom production, recording support, mixdown services, and full production deals.",
  },
  {
    number: "02",
    title: "Service List",
    image: "/images/RAF-_MUSIC SERVICE LIST.png",
    text: "This card shows the current music service list, including beats, production, recording services, mixdown, editing, and starting prices. Use it as a quick reference before choosing a service.",
  },
  {
    number: "03",
    title: "Recording Services",
    image:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068296/RAF-_WEBSITE_CARDS-_Music_Services_Recording_Card_mhtksg.png",
    text: "This card details recording, mixdown, vocal tuning, editing, and audio support options, including studio session booking protocols and remote track delivery requirements.",
  },
  {
    number: "04",
    title: "Production Services",
    image:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068295/RAF-_WEBSITE_CARDS-_Music_Services_Porduction_Card_cdvawj.png",
    text: "Comprehensive guide to beat leasing options, custom beat creation, exclusive rights acquisitions, and full track production deals tailored for artists.",
  },
];

export default function BeatsHowItWorksPage() {
  return (
    <main
      className="w-full min-h-screen text-white relative pb-24 pt-24 overflow-x-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h1 className="font-raf text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            HOW SERVICES WORK
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-12 relative z-10">
        {/* KEEP THIS LINK */}
        <div>
          <Link
            href="/beats/services"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 border-2 border-black px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-white hover:bg-zinc-800 hover:border-red-500 transition"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            Back to Beat Services
          </Link>
        </div>

        {/* SHORT USEFUL INTRO */}
        <section className="w-full rounded-2xl border-4 border-black bg-black/80 backdrop-blur-md p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="mx-auto max-w-3xl font-mono text-sm sm:text-base leading-7 text-white">
            Review the RAF By Design music workflow, service options, booking
            process and current beat licensing agreements.
          </p>
        </section>

        {/* GUIDES */}
        <section className="space-y-8">
          <div className="border-b-2 border-zinc-800/80 pb-3 text-center">
            <h2 className="font-raf text-2xl sm:text-3xl uppercase tracking-wide text-white">
              Service Workflow Breakdown
            </h2>
          </div>

          <div className="grid gap-8">
            {sections.map((section) => (
              <GuideCard key={section.title} {...section} />
            ))}
          </div>
        </section>

        {/* CONTRACT AGREEMENTS */}
        <section className="w-full rounded-3xl border-4 border-black bg-zinc-950/90 backdrop-blur-xl p-8 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="mb-8 border-b-2 border-zinc-800 pb-4 text-center">
            <h2 className="font-raf text-3xl sm:text-4xl uppercase tracking-wide text-white">
              Contract Agreements
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-white font-mono text-sm leading-6">
              View or download the current RAF By Design beat licensing agreements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border-2 border-zinc-800 bg-black/80 hover:border-red-600/50 transition-all flex flex-col justify-between gap-6 group">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-red-600/10 border-2 border-red-600/30 rounded-xl text-red-500 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-black text-red-500 uppercase tracking-wider bg-red-950/60 border border-red-900/50 px-2 py-0.5 rounded">
                    Non-Exclusive
                  </span>

                  <h3 className="font-raf text-xl text-white uppercase tracking-wide pt-1">
                    Leasing Rights Contract
                  </h3>

                  <p className="text-sm font-mono text-zinc-200 leading-6">
                    Standard beat leasing agreement terms, distribution limits,
                    performance rights, and streaming caps.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-900">
                <a
                  href={getOfficeViewerUrl(LEASING_CONTRACT_DOCX)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex-1 py-3 bg-zinc-900 border-2 border-black hover:bg-zinc-800 text-zinc-100 text-sm font-mono font-black uppercase rounded-lg shadow-md flex items-center justify-center gap-2 transition active:translate-y-0.5"
                >
                  <Eye className="w-4 h-4 text-red-500" />
                  View Online
                </a>

                <a
                  href={LEASING_CONTRACT_DOCX}
                  download
                  className="w-full flex-1 py-3 bg-red-600 border-2 border-black hover:bg-red-500 text-white text-sm font-mono font-black uppercase rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition active:translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download (.DOCX)
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl border-2 border-zinc-800 bg-black/80 hover:border-red-600/50 transition-all flex flex-col justify-between gap-6 group">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-red-600/10 border-2 border-red-600/30 rounded-xl text-red-500 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-black text-red-500 uppercase tracking-wider bg-red-950/60 border border-red-900/50 px-2 py-0.5 rounded">
                    Full Rights Transfer
                  </span>

                  <h3 className="font-raf text-xl text-white uppercase tracking-wide pt-1">
                    Exclusive Rights Contract
                  </h3>

                  <p className="text-sm font-mono text-zinc-200 leading-6">
                    Full ownership transfer agreement, unlimited commercial
                    distribution, stem delivery, and copyright terms.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-900">
                <a
                  href={getOfficeViewerUrl(EXCLUSIVE_CONTRACT_DOCX)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex-1 py-3 bg-zinc-900 border-2 border-black hover:bg-zinc-800 text-zinc-100 text-sm font-mono font-black uppercase rounded-lg shadow-md flex items-center justify-center gap-2 transition active:translate-y-0.5"
                >
                  <Eye className="w-4 h-4 text-red-500" />
                  View Online
                </a>

                <a
                  href={EXCLUSIVE_CONTRACT_DOCX}
                  download
                  className="w-full flex-1 py-3 bg-red-600 border-2 border-black hover:bg-red-500 text-white text-sm font-mono font-black uppercase rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition active:translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download (.DOCX)
                </a>
              </div>
            </div>
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
            <span className="inline-block px-3 py-1 rounded-md bg-red-600 border-2 border-black text-black font-mono font-black text-sm">
              STEP {number}
            </span>
          </div>

          <h3 className="font-raf text-2xl sm:text-3xl uppercase tracking-wide text-white">
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
              className="rounded-lg bg-red-600 border-2 border-black px-5 py-3 text-center font-mono text-sm font-black text-white hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5 flex items-center justify-center gap-2"
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

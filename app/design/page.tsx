"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

type Section = {
  title: string;
  description: string;
  href: string;
  image: string;
};

const sections: Section[] = [
  {
    title: "Services",
    description: "Explore all design services available.",
    href: "/design/services",
    image: "/images/Design Services Image.jpg",
  },
  {
    title: "How It Works",
    description: "Understand the process from idea to delivery.",
    href: "/design/services/how-it-works",
    image: "/images/How It Works Design Image.jpg",
  },
  {
    title: "Gallery",
    description: "View previous and current design work.",
    href: "/design/gallery",
    image: "/images/Gallery.jpg",
  },
  {
    title: "Booking",
    description: "Start your project and submit a request.",
    href: "/design/book",
    image: "/images/Booking Design.png",
  },
];

function SafeSectionImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center p-4 text-center">
        <p className="text-sm text-zinc-300 font-mono">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
    />
  );
}

export default function DesignPage() {
  return (
    <main className="min-h-screen relative text-white bg-transparent pb-24">
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

      <div className="relative z-10 pt-24 pb-20 space-y-12">
        {/* TRUE FULL-WIDTH HEADER */}
        <div className="w-full">
          <header className="relative left-1/2 w-screen max-w-none -translate-x-1/2 bg-black/60 backdrop-blur-sm border-b-4 border-black">
            <div className="w-full px-6 py-10 text-center">
              <h1 className="raf-heading text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
                Design Studio
              </h1>
              <p className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-bold">
                Explore RAF By Design graphic design services, portfolio work, booking and how the design process works.
              </p>
            </div>
          </header>
        </div>

        {/* DESIGN SECTION GRID */}
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="grid gap-8 md:grid-cols-2">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="overflow-hidden rounded-2xl border-4 border-black bg-black/75 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between group hover:border-blue-500 transition-all duration-300"
                >
                  <Link
                    href={section.href}
                    className="block relative w-full aspect-[16/9] overflow-hidden border-b-4 border-black bg-zinc-950"
                  >
                    <SafeSectionImage src={section.image} alt={section.title} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
                  </Link>

                  <div className="p-6">
                    <div className="w-full text-center">
                      <h2 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white group-hover:text-blue-400 transition-colors">
                        {section.title}
                      </h2>

                    </div>

                  </div>
                </article>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}

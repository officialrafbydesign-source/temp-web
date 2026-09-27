"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const legalPages = [
  {
    title: "Privacy & Cookies",
    href: "/all-about-raf/legal/privacy",
    text: "How RAF By Design collects, uses, stores and protects personal information, including website cookies and consent choices.",
  },
  {
    title: "Terms & Conditions",
    href: "/all-about-raf/legal/terms",
    text: "General terms covering website use, service requests, customer responsibilities, payments, project work and legal rights.",
  },
  {
    title: "Returns, Cancellations & Refunds",
    href: "/all-about-raf/legal/returns-refunds",
    text: "Rules for physical products, digital purchases, service cancellations, deposits and exceptional store credit.",
  },
];

export default function LegalPage() {
  return (
    <main className="legal-page min-h-screen relative text-black">
      <style jsx global>{`
        .legal-page {
          font-family: Arial, Helvetica, sans-serif;
        }
        .legal-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-20">
        <header className="w-full bg-black border-y-4 border-black">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl uppercase text-white">
              General & Legal
            </h1>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10 pt-8 space-y-8">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="mx-auto max-w-4xl text-base sm:text-lg leading-8 text-zinc-700">
              RAF By Design keeps its general legal information concise. Use the
              three sections below for privacy information, website and service
              terms, and returns, cancellation and refund rules.
            </p>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {legalPages.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1"
              >
                <div className="bg-black px-6 py-5">
                  <h2 className="font-raf text-2xl sm:text-3xl uppercase text-white">
                    {item.title}
                  </h2>
                </div>

                <div className="p-6">
                  <p className="text-base sm:text-lg leading-7 text-zinc-700">
                    {item.text}
                  </p>

                  <p className="mt-5 text-sm font-black uppercase tracking-widest text-red-600">
                    Open Section →
                  </p>
                </div>
              </Link>
            ))}
          </section>

          <div className="text-center">
            <Link
              href="/all-about-raf"
              className="inline-flex rounded-xl border-2 border-black bg-black px-6 py-3 text-base font-black uppercase text-white transition hover:bg-zinc-800"
            >
              ← Back To All About RAF
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

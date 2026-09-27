"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

type SectionCard = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  imageUrl?: string;
  lightCard?: boolean;
  containImage?: boolean;
};

const sections: SectionCard[] = [
  {
    title: "ABOUT US",
    eyebrow: "WHO WE ARE",
    description:
      "Learn more about RAF By Design, the ideas behind the business and the creative work that connects everything we do.",
    href: "/about",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788097967/vlcsnap-2026-08-30-14h35m12s220_n82nwo.png",
  },
  {
    title: "WHAT WE OFFER",
    eyebrow: "SERVICES & PRODUCTS",
    description:
      "Explore the creative services, music, clothing and other work available through RAF By Design.",
    href: "/what-we-offer",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098120/vlcsnap-2026-08-29-18h04m37s333_wvg00t.png",
  },
  {
    title: "SHOWCASE",
    eyebrow: "SELECTED WORK",
    description:
      "View selected RAF projects across music, production, design, clothing, media and business collaborations.",
    href: "/showcase",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098194/vlcsnap-2026-08-29-18h11m21s511_aecqik.png",
  },
  {
    title: "HOW IT WORKS",
    eyebrow: "WORKING WITH RAF",
    description:
      "Find out how enquiries, bookings, approvals, revisions, payments and project delivery work.",
    href: "/how-it-works",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022020/About_Us_oyekxq.png",
  },
  {
    title: "CONTACT RAF",
    eyebrow: "GET IN TOUCH",
    description:
      "Contact RAF By Design for general enquiries, project questions, bookings or collaboration opportunities.",
    href: "/contact",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1782422135/mascotmonoblack_bjqvxs.png",
    lightCard: true,
    containImage: true,
  },
];

function SectionCard({ item }: { item: SectionCard }) {
  const lightCard = item.lightCard === true;

  return (
    <Link
      href={item.href}
      className={`group relative min-h-[290px] sm:min-h-[340px] overflow-hidden rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] transition hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] ${
        lightCard ? "bg-white" : "bg-black"
      }`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className={`absolute inset-0 h-full w-full transition duration-300 group-hover:scale-[1.02] ${
            item.containImage
              ? "object-contain p-8 sm:p-12 opacity-100"
              : "object-cover opacity-45 group-hover:opacity-55"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black opacity-95" />
      )}

      {!lightCard && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
      )}

      {lightCard && (
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-white via-white/95 to-transparent" />
      )}

      <div className="relative z-10 flex h-full min-h-[290px] sm:min-h-[340px] flex-col justify-end p-6 sm:p-8">
        <p
          className={`font-mono text-sm sm:text-base font-black uppercase tracking-[0.22em] ${
            lightCard ? "text-red-600" : "text-red-500"
          }`}
        >
          {item.eyebrow}
        </p>

        <h2
          className={`font-raf mt-2 text-4xl sm:text-5xl uppercase ${
            lightCard ? "text-red-600" : "text-white"
          }`}
        >
          {item.title}
        </h2>

        <p
          className={`mt-4 max-w-xl font-clarity text-sm sm:text-base leading-7 ${
            lightCard ? "text-zinc-700" : "text-white/80"
          }`}
        >
          {item.description}
        </p>

        <div className="mt-6">
          <span
            className={`inline-flex items-center rounded-lg border-2 px-4 py-2 font-mono text-xs font-black uppercase transition ${
              lightCard
                ? "border-black bg-black text-white group-hover:bg-red-600"
                : "border-white bg-black/70 text-white group-hover:bg-white group-hover:text-black"
            }`}
          >
            OPEN SECTION →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AllAboutRafPage() {
  return (
    <main className="min-h-screen relative overflow-hidden text-black pt-24 pb-24">
      <RafAboutBackground />

      <div className="relative z-10">
        <section className="w-full border-y-2 border-black/20 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 text-center">
            <p className="font-mono text-sm sm:text-base font-black uppercase tracking-[0.3em] text-red-600">
              RAF BY DESIGN
            </p>

            <h1 className="font-raf mt-3 text-5xl sm:text-7xl lg:text-8xl uppercase text-black">
              ALL ABOUT RAF
            </h1>

            <p className="font-clarity mt-5 max-w-3xl mx-auto text-base sm:text-lg leading-8 text-zinc-700">
              Explore the story, services, selected work, working process and
              contact information behind RAF By Design.
            </p>
          </div>
        </section>

        <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {[
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788097967/vlcsnap-2026-08-30-14h35m12s220_n82nwo.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098120/vlcsnap-2026-08-29-18h04m37s333_wvg00t.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098194/vlcsnap-2026-08-29-18h11m21s511_aecqik.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098063/vlcsnap-2026-08-29-17h57m53s599_telanc.png",
              ].map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[2/1] overflow-hidden rounded-xl border-2 border-white/10 bg-black"
                >
                  <img
                    src={imageUrl}
                    alt={`RAF By Design ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 space-y-12">
          <section>
            <div className="text-center mb-7">
              <p className="font-mono text-sm sm:text-base font-black uppercase tracking-[0.25em] text-red-600">
                EXPLORE RAF
              </p>
              <h2 className="font-raf mt-2 text-4xl sm:text-5xl uppercase">
                CHOOSE A SECTION
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sections.map((item) => (
                <SectionCard key={item.href} item={item} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-black bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)]">
            <div className="text-center">
              <p className="font-mono text-sm sm:text-base font-black uppercase tracking-[0.25em] text-red-600">
                INFORMATION
              </p>

              <h2 className="font-raf mt-2 text-3xl sm:text-4xl uppercase text-black">
                GENERAL & LEGAL
              </h2>

              <p className="font-clarity mt-4 max-w-3xl mx-auto text-sm sm:text-base leading-7 text-zinc-700">
                Privacy information, website terms and the RAF By Design
                returns, cancellation and refund policy.
              </p>

              <Link
                href="/all-about-raf/legal"
                className="inline-flex mt-6 rounded-lg border-2 border-black bg-black px-5 py-3 font-mono text-xs font-black uppercase text-white transition hover:bg-red-600"
              >
                OPEN GENERAL & LEGAL →
              </Link>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <Link
                href="/all-about-raf/legal/privacy"
                className="rounded-xl border-2 border-black bg-white px-4 py-5 text-center transition hover:bg-zinc-100"
              >
                <p className="font-mono text-sm font-black uppercase text-black">
                  PRIVACY & COOKIES
                </p>
              </Link>

              <Link
                href="/all-about-raf/legal/terms"
                className="rounded-xl border-2 border-black bg-white px-4 py-5 text-center transition hover:bg-zinc-100"
              >
                <p className="font-mono text-sm font-black uppercase text-black">
                  TERMS & CONDITIONS
                </p>
              </Link>

              <Link
                href="/all-about-raf/legal/returns-refunds"
                className="rounded-xl border-2 border-black bg-white px-4 py-5 text-center transition hover:bg-zinc-100"
              >
                <p className="font-mono text-sm font-black uppercase text-black">
                  RETURNS, CANCELLATIONS & REFUNDS
                </p>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border-2 border-black bg-black p-6 sm:p-10 text-white text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)]">
            <p className="font-mono text-sm sm:text-base font-black uppercase tracking-[0.25em] text-red-500">
              NEED SOMETHING ELSE?
            </p>

            <h2 className="font-raf mt-2 text-4xl sm:text-5xl uppercase">
              CONTACT RAF BY DESIGN
            </h2>

            <p className="font-clarity mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-white/75">
              For general questions, project enquiries or anything that does not
              fit one of the main sections, contact RAF directly.
            </p>

            <Link
              href="/contact"
              className="inline-flex mt-6 rounded-lg border-2 border-white bg-white px-5 py-3 font-mono text-xs font-black uppercase text-black transition hover:bg-red-600 hover:text-white"
            >
              CONTACT RAF →
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

type FinderOption = {
  id: string;
  label: string;
  prompt: string;
  recommendations: {
    title: string;
    price: string;
    text: string;
    href: string;
    button: string;
  }[];
};

type ServiceLine = {
  name: string;
  price: string;
};

const finderOptions: FinderOption[] = [
  {
    id: "complete-release",
    label: "I WANT TO MAKE / RELEASE A SONG",
    prompt:
      "For an artist who wants several parts of a release handled together.",
    recommendations: [
      {
        title: "Song Release Package",
        price: "From £220",
        text: "Best starting point when you need several release services together instead of booking each part separately.",
        href: "/contact",
        button: "ASK ABOUT PACKAGE",
      },
      {
        title: "Full Production Deal",
        price: "From £200",
        text: "For a track that needs production support from recording through to final delivery.",
        href: "/beats/services/book",
        button: "REQUEST PRODUCTION",
      },
      {
        title: "Custom Beat Add-on",
        price: "+£100",
        text: "Add original beat production when your release needs a new instrumental.",
        href: "/beats/services/book",
        button: "REQUEST CUSTOM BEAT",
      },
    ],
  },
  {
    id: "beat",
    label: "I NEED A BEAT",
    prompt:
      "Choose an existing beat licence or request something made specifically for you.",
    recommendations: [
      {
        title: "Beat Store — Leasing Licence",
        price: "£60",
        text: "Non-exclusive beat licence for artists working to a smaller budget.",
        href: "/beats/store",
        button: "BROWSE BEATS",
      },
      {
        title: "Beat Store — Exclusive Licence",
        price: "£100",
        text: "Exclusive beat purchase with the wider delivery package attached to that licence.",
        href: "/beats/store",
        button: "BROWSE EXCLUSIVES",
      },
      {
        title: "Custom Made Beat",
        price: "From £120",
        text: "Original production built around your sound, references and project direction.",
        href: "/beats/services/book",
        button: "REQUEST CUSTOM BEAT",
      },
    ],
  },
  {
    id: "record-mix",
    label: "I NEED RECORDING / MIXING / AUDIO EDITING",
    prompt:
      "For vocals, externally recorded music, podcasts, voiceovers and other audio work.",
    recommendations: [
      {
        title: "Recording + Mixdown",
        price: "£30 / hour",
        text: "Studio recording and mix support. Minimum booking is 2 hours.",
        href: "/beats/services/book",
        button: "BOOK MUSIC SERVICE",
      },
      {
        title: "Track Mixdown / Edit",
        price: "£20 / track",
        text: "For tracks recorded elsewhere that need mixdown and editing.",
        href: "/beats/services/book",
        button: "REQUEST MIXDOWN",
      },
      {
        title: "Other Audio Editing",
        price: "From £20",
        text: "Podcast, voiceover, spoken audio, cleanup and other editing work.",
        href: "/beats/services/book",
        button: "REQUEST AUDIO EDIT",
      },
    ],
  },
  {
    id: "artwork",
    label: "I NEED ARTWORK / GRAPHIC DESIGN",
    prompt:
      "For branding, music artwork, print design, promotional graphics and custom visual work.",
    recommendations: [
      {
        title: "Design Services",
        price: "From £30",
        text: "Browse the complete design catalogue, including logos, covers, flyers, posters, characters, business material and digital content.",
        href: "/design/services",
        button: "VIEW DESIGN SERVICES",
      },
      {
        title: "Design Request",
        price: "Project based",
        text: "Already know what you need? Go directly to the design request form.",
        href: "/design/book",
        button: "START DESIGN REQUEST",
      },
      {
        title: "Design Gallery",
        price: "View work",
        text: "See previous design work before deciding which service fits your project.",
        href: "/design/gallery",
        button: "VIEW GALLERY",
      },
    ],
  },
  {
    id: "brand-launch",
    label: "I AM LAUNCHING A BRAND / BUSINESS",
    prompt:
      "For new brands or businesses that need a coordinated starting point.",
    recommendations: [
      {
        title: "Brand Launch Package",
        price: "From £80",
        text: "A starting package for clients who need more than one visual element for a new brand or business.",
        href: "/contact",
        button: "ASK ABOUT PACKAGE",
      },
      {
        title: "Logo Design",
        price: "£50–£60",
        text: "A standalone logo option if your brand only needs its core identity first.",
        href: "/design/book",
        button: "REQUEST LOGO",
      },
      {
        title: "Business Design Services",
        price: "From £55",
        text: "Business cards, brochures, menus, promotional graphics and other business-facing design work.",
        href: "/design/services",
        button: "VIEW BUSINESS DESIGN",
      },
    ],
  },
  {
    id: "social",
    label: "I NEED SOCIAL / PROMOTIONAL CONTENT",
    prompt:
      "For campaigns, social media, launch material, short video and promotional assets.",
    recommendations: [
      {
        title: "Social Content Package",
        price: "From £150",
        text: "For clients who need a group of social or promotional assets rather than a single item.",
        href: "/contact",
        button: "ASK ABOUT PACKAGE",
      },
      {
        title: "Social Media Content",
        price: "From £60",
        text: "Standalone social content and short-form promotional video work.",
        href: "/design/book",
        button: "REQUEST SOCIAL CONTENT",
      },
      {
        title: "Advert Photos",
        price: "£60 / image",
        text: "Promotional image design for products, campaigns and advertising.",
        href: "/design/book",
        button: "REQUEST ADVERT DESIGN",
      },
    ],
  },
  {
    id: "clothing",
    label: "I WANT CLOTHING / HIPHOP100",
    prompt:
      "For RAF By Design's HipHop100 streetwear, collections and media/lifestyle brand.",
    recommendations: [
      {
        title: "HipHop100",
        price: "Shop current products",
        text: "Explore the HipHop100 brand, current ranges, campaigns and media.",
        href: "/clothing/hiphop100",
        button: "OPEN HIPHOP100",
      },
      {
        title: "Clothing Shop",
        price: "Current product prices",
        text: "Go directly to the clothing catalogue and available products.",
        href: "/clothing",
        button: "SHOP CLOTHING",
      },
    ],
  },
];

const musicServices: ServiceLine[] = [
  { name: "Leasing Beat Licence", price: "£60" },
  { name: "Exclusive Beat Licence", price: "£100" },
  { name: "Custom Made Beat", price: "From £120" },
  { name: "Full Production Deal", price: "From £200" },
  { name: "Recording + Mixdown", price: "£30 / hour — 2 hour minimum" },
  { name: "Track Mixdown / Edit", price: "£20 / track" },
  { name: "Other Audio Editing", price: "From £20" },
];

const coreDesignServices: ServiceLine[] = [
  { name: "Logo Design", price: "B&W £50 / Colour £60" },
  {
    name: "2D Character / Mascot",
    price: "£45–£100 / Extra character £30",
  },
  { name: "Leaflets / Flyers", price: "1 side £50 / 2 sides £60" },
  { name: "Posters", price: "A4 £50 / A3 £60 / A2 £70" },
  {
    name: "Brochures / Menus",
    price: "2 sides £60 / 4 sides £80 / +£10 extra side",
  },
  {
    name: "Music Cover Design",
    price: "Simple £50 / Advanced £80 / Add-ons available",
  },
  { name: "Banner Design", price: "£60" },
  { name: "Custom Font / Symbol", price: "£60" },
  { name: "Pattern Design", price: "From £60" },
];

const businessDigitalServices: ServiceLine[] = [
  { name: "Business Card", price: "1 side £55 / 2 sides £60" },
  { name: "Advert Photos", price: "£60 / image" },
  { name: "Social Media Content", price: "From £60" },
  { name: "GIF Design", price: "Enquire" },
  { name: "Lyric Video", price: "Custom pricing" },
  { name: "Photo Editing", price: "Retouch £30 / Extras £10–£20+" },
];

const packages = [
  {
    name: "SONG RELEASE PACKAGE",
    price: "FROM £220",
    text: "For artists who need several release services brought together around one song.",
    extra: "Custom beat add-on: +£100",
    goal: "Artist / Song Release",
  },
  {
    name: "BRAND LAUNCH PACKAGE",
    price: "FROM £80",
    text: "A starting bundle for a new brand or business that needs coordinated visual work.",
    extra: "Final quote depends on selected items",
    goal: "Brand / Business",
  },
  {
    name: "SOCIAL CONTENT PACKAGE",
    price: "FROM £150",
    text: "For clients who need a group of social or promotional assets rather than a single design.",
    extra: "Final quote depends on selected content",
    goal: "Social / Promotion",
  },
];

const upcomingDesign = [
  "Sticker Design",
  "Background Design",
  "Mockup Design",
  "Packaging Design",
  "Watermark Design",
];

export default function WhatWeOfferPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [serviceView, setServiceView] = useState<"finder" | "chart">("finder");

  const activeFinder = finderOptions.find((item) => item.id === selectedGoal);

  return (
    <main className="what-we-offer-page min-h-screen relative text-black">
      <style jsx global>{`
        .what-we-offer-page {
          font-family: Arial, Helvetica, sans-serif;
        }

        .what-we-offer-page .font-mono,
        .what-we-offer-page .font-clarity {
          font-family: Arial, Helvetica, sans-serif !important;
        }

        .what-we-offer-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-20 space-y-12">
        {/* HEADER - ALL ABOUT RAF STANDARD */}
        <section className="w-screen relative left-1/2 -translate-x-1/2 bg-black border-y-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.35)]">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl text-white uppercase">
              What We Offer
            </h1>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/all-about-raf"
                className="rounded-xl border-2 border-white bg-black px-7 py-3 text-center font-mono text-base font-black text-white hover:bg-zinc-900 transition active:translate-y-0.5"
              >
                All About RAF
              </Link>

              <a
                href="#service-finder"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center font-mono text-base font-black text-black hover:bg-zinc-200 transition active:translate-y-0.5"
              >
                Find What You Need
              </a>
            </div>
          </div>
        </section>

        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10 space-y-10">
          {/* INTERACTIVE SERVICE FINDER / ALTERNATIVE ROUTE CHART */}
          <section
            id="service-finder"
            className="scroll-mt-32 overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="bg-black px-5 py-5 text-center sm:px-8 sm:py-6">
              <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
                What Are You Looking For?
              </h2>
              <p className="mx-auto mt-3 max-w-3xl font-mono text-base sm:text-lg leading-7 text-zinc-300">
                Choose how you want to find the right RAF service.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setServiceView("finder")}
                  className={`rounded-xl border-2 border-black px-5 py-4 text-center font-mono text-base font-black uppercase transition ${
                    serviceView === "finder"
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-black hover:bg-zinc-200"
                  }`}
                >
                  Use Service Finder
                </button>

                <a
                  href="#basic-services"
                  className="rounded-xl border-2 border-black bg-red-600 px-5 py-4 text-center font-mono text-base font-black uppercase text-white transition hover:bg-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  View All Services
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setServiceView("chart");
                    setSelectedGoal(null);
                  }}
                  className={`rounded-xl border-2 border-black px-5 py-4 text-center font-mono text-base font-black uppercase transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    serviceView === "chart"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  Use Quick Route Chart
                </button>
              </div>

              {serviceView === "finder" ? (
                <>
            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {finderOptions.map((option) => {
                const active = selectedGoal === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedGoal(option.id)}
                    className={`min-h-[110px] w-full rounded-xl border-2 border-black px-6 py-6 text-left font-mono text-base sm:text-lg font-black uppercase leading-7 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      active
                        ? "bg-red-600 text-white"
                        : "bg-zinc-100 text-black hover:bg-zinc-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

                {activeFinder ? (
              <div className="mt-7 rounded-2xl border-4 border-black bg-zinc-950 p-5 sm:p-7 text-white">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-white/15 pb-5">
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-widest text-red-500">
                      RECOMMENDED ROUTES
                    </p>
                    <h3 className="font-raf mt-1 text-2xl sm:text-3xl uppercase">
                      {activeFinder.label}
                    </h3>
                    <p className="mt-3 font-mono text-base leading-7 text-zinc-400 max-w-3xl">
                      {activeFinder.prompt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGoal(null)}
                    className="shrink-0 rounded border-2 border-white/20 px-4 py-2 font-mono text-sm font-black uppercase text-zinc-300 hover:bg-white hover:text-black transition"
                  >
                    RESET
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {activeFinder.recommendations.map((item) => (
                    <article
                      key={item.title}
                      className="flex w-full flex-col rounded-xl border-2 border-black bg-white p-6 sm:p-8 text-black shadow-[5px_5px_0px_0px_rgba(239,68,68,1)]"
                    >
                      <p className="font-mono text-xs font-black uppercase text-red-600">
                        {item.price}
                      </p>
                      <h4 className="font-raf mt-2 text-2xl uppercase">
                        {item.title}
                      </h4>
                      <p className="mt-3 flex-1 font-mono text-base leading-7 text-zinc-700">
                        {item.text}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-5 rounded border-2 border-black bg-black px-4 py-3 text-center font-mono text-sm font-black uppercase text-white hover:bg-red-600 transition"
                      >
                        {item.button} →
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                <p className="font-mono text-xs font-black uppercase text-zinc-500">
                  SELECT A GOAL ABOVE TO VIEW RECOMMENDATIONS
                </p>
              </div>
            )}

                </>
              ) : (
                <div className="mt-7">
                  <div className="mx-auto max-w-sm rounded-xl border-4 border-black bg-black px-6 py-5 text-center text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                    <p className="font-raf text-2xl uppercase">
                      What Do You Need?
                    </p>
                  </div>

                  <div className="py-3 text-center font-mono text-3xl font-black">↓</div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FlowColumn
                      title="MUSIC"
                      items={[
                        "Need a beat → Beat Store / Custom Beat",
                        "Need recording → Recording + Mixdown",
                        "Need a mix → Track Mixdown / Edit",
                        "Need everything → Full Production / Song Release Package",
                      ]}
                      href="/beats"
                    />

                    <FlowColumn
                      title="DESIGN"
                      items={[
                        "Brand identity → Logo / Character",
                        "Music artwork → Cover Design",
                        "Promotion → Flyer / Poster / Banner",
                        "Print & business → Cards / Menus / Brochures",
                      ]}
                      href="/design/services"
                    />

                    <FlowColumn
                      title="BUSINESS / CONTENT"
                      items={[
                        "Starting a brand → Brand Launch Package",
                        "Need social assets → Social Content Package",
                        "Single promo → Advert Photo",
                        "Short video / digital → Social Media Content",
                      ]}
                      href="/design/services"
                    />

                    <FlowColumn
                      title="CLOTHING"
                      items={[
                        "Browse all clothing → Clothing Shop",
                        "Explore the brand → HipHop100",
                        "View ranges → HipHop100 Ranges",
                        "Media & lifestyle → HipHop100 Media",
                      ]}
                      href="/clothing/hiphop100"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* PACKAGES */}
          <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black px-5 py-5 text-center sm:px-8 sm:py-6">
              <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
                Packages
              </h2>
              <p className="mx-auto mt-3 max-w-3xl font-mono text-base sm:text-lg leading-7 text-zinc-300">
                Packages are for clients who need several connected pieces of
                work instead of one standalone service.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {packages.map((item) => (
                <article
                  key={item.name}
                  className="w-full rounded-xl border-4 border-black bg-zinc-50 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <p className="font-mono text-sm font-black uppercase tracking-widest text-zinc-500">
                    {item.goal}
                  </p>
                  <h3 className="font-raf mt-2 text-2xl uppercase">
                    {item.name}
                  </h3>
                  <p className="mt-3 font-mono text-sm font-black text-red-600">
                    {item.price}
                  </p>
                  <p className="mt-4 font-mono text-base leading-7 text-zinc-700">
                    {item.text}
                  </p>
                  <p className="mt-4 border-t border-zinc-200 pt-4 font-mono text-sm font-bold uppercase text-zinc-500">
                    {item.extra}
                  </p>
                </article>
              ))}
              </div>
            </div>
          </section>

          {/* BASIC SERVICE LIST */}
          <section
            id="basic-services"
            className="scroll-mt-32 overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="bg-black px-5 py-5 text-center sm:px-8 sm:py-6">
              <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
                Basic Service List
              </h2>
              <p className="mx-auto mt-3 max-w-3xl font-mono text-base sm:text-lg leading-7 text-zinc-300">
                A simple reference for the main RAF services and current starting rates.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <ServiceListCard
                title="Music & Audio"
                services={musicServices}
                href="/beats/services"
                button="View Music Services"
              />

              <ServiceListCard
                title="Core Design"
                services={coreDesignServices}
                href="/design/services"
                button="View Design Services"
              />

              <ServiceListCard
                title="Business / Digital"
                services={businessDigitalServices}
                href="/design/services"
                button="View Digital Services"
              />
              </div>

              <div className="mt-6 rounded-xl border-2 border-black bg-zinc-100 p-5">
              <p className="font-mono text-xs font-black uppercase tracking-widest text-zinc-500">
                DESIGN SERVICES IN DEVELOPMENT
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {upcomingDesign.map((service) => (
                  <span
                    key={service}
                    className="rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-sm font-bold uppercase text-zinc-600"
                  >
                    {service}
                  </span>
                ))}
              </div>
              </div>
            </div>
          </section>

          {/* PRODUCTS / SHOPS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ShopCard
              eyebrow="MUSIC PRODUCT"
              title="BEAT STORE"
              text="Purchase current beat licences directly from the RAF Beat Store."
              href="/beats/store"
            />
            <ShopCard
              eyebrow="MUSIC PRODUCT"
              title="MUSIC SHOP"
              text="Browse RAF music releases and available digital or physical music products."
              href="/music"
            />
            <ShopCard
              eyebrow="CLOTHING"
              title="HIPHOP100"
              text="Explore HipHop100 clothing, ranges, campaigns and media."
              href="/clothing/hiphop100"
            />
          </section>

          {/* NEXT STEP */}
          <section className="rounded-2xl border-4 border-black bg-black p-6 sm:p-8 text-white shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-red-500">
                  NOT SURE YET?
                </p>
                <h2 className="font-raf mt-2 text-3xl sm:text-4xl uppercase">
                  TALK TO RAF
                </h2>
                <p className="mt-3 max-w-2xl font-mono text-base sm:text-lg leading-7 text-zinc-400">
                  If your project crosses several areas or does not fit one
                  service exactly, send a general enquiry and explain what you
                  are trying to create.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href="/contact"
                  className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center font-mono text-xs font-black uppercase text-black hover:bg-red-600 hover:text-white transition"
                >
                  Contact RAF →
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-xl border-2 border-white/30 bg-zinc-900 px-7 py-3 text-center font-mono text-xs font-black uppercase text-white hover:bg-zinc-800 transition"
                >
                  How It Works →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ServiceListCard({
  title,
  services,
  href,
  button,
}: {
  title: string;
  services: ServiceLine[];
  href: string;
  button: string;
}) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-xl border-4 border-black bg-zinc-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-5 sm:px-8 sm:py-6 text-center text-white">
        <h3 className="font-raf text-3xl sm:text-4xl uppercase">{title}</h3>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex-1 divide-y divide-zinc-200 border-t-2 border-black">
        {services.map((service) => (
          <div
            key={service.name}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-6 py-4 font-mono text-base sm:text-lg"
          >
            <span className="font-black text-zinc-800">{service.name}</span>
            <span className="text-right font-bold text-zinc-500">
              {service.price}
            </span>
          </div>
        ))}
        </div>

        <Link
          href={href}
          className="mt-5 rounded border-2 border-black bg-black px-4 py-3 text-center font-mono text-sm font-black uppercase text-white hover:bg-red-600 transition"
        >
          {button} →
        </Link>
      </div>
    </article>
  );
}

function FlowColumn({
  title,
  items,
  href,
}: {
  title: string;
  items: string[];
  href: string;
}) {
  return (
    <article className="w-full rounded-xl border-4 border-black bg-zinc-50 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-5 sm:px-8 sm:py-6 text-center text-white">
        <h3 className="font-raf text-3xl sm:text-4xl uppercase">{title}</h3>
      </div>

      <div className="p-6 sm:p-8">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item}>
              <div className="rounded border-2 border-zinc-300 bg-white px-5 py-4 font-mono text-base sm:text-lg font-bold leading-7 text-zinc-700">
                {item}
              </div>
              {index < items.length - 1 && (
                <div className="py-1 text-center font-mono font-black text-zinc-400">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>

        <Link
          href={href}
          className="mt-5 block rounded border-2 border-black bg-red-600 px-4 py-3 text-center font-mono text-sm font-black uppercase text-white hover:bg-red-500 transition"
        >
          OPEN SECTION →
        </Link>
      </div>
    </article>
  );
}

function ShopCard({
  eyebrow,
  title,
  text,
  href,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group w-full overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1"
    >
      <div className="bg-black px-6 py-6 sm:px-8 sm:py-7 text-center">
        <p className="font-mono text-sm font-black uppercase tracking-widest text-red-500">
          {eyebrow}
        </p>
        <h2 className="font-raf mt-2 text-3xl sm:text-4xl uppercase text-white">
          {title}
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        <p className="font-mono text-base leading-7 text-zinc-700">
          {text}
        </p>
        <p className="mt-5 border-t border-zinc-200 pt-4 font-mono text-sm font-black uppercase text-black group-hover:text-red-600">
          OPEN →
        </p>
      </div>
    </Link>
  );
}

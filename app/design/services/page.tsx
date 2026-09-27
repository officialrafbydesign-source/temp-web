"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceItem = {
  id?: string;
  title: string;
  image: string;
  requestLink: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  category?: string;
};

const initialCoreDesignServices: ServiceItem[] = [
  {
    title: "Logo Design",
    image: "/images/Logo Design.png",
    requestLink: "/design/book",
    eyebrow: "Brand identity",
    description:
      "Custom text and symbol image design for brands, artists, businesses, and projects.",
    bullets: ["Black & White: £50", "Colour: £60"],
  },
  {
    title: "2D Character / Mascot",
    image: "/images/2D Character Design.png",
    requestLink: "/design/book",
    eyebrow: "Character artwork",
    description:
      "Single character or mascot design for branding, covers, content, and promotional use.",
    bullets: [
      "Line Art: £45",
      "Black & White: £50",
      "Colour: £60",
      "With Effects: £90",
      "Colour + Background: £100",
      "Extra Character: £30 each",
    ],
  },
  {
    title: "Leaflets / Flyers",
    image: "/images/WEBSITE BUTTON LEAFLET FLYER.png",
    requestLink: "/design/book",
    eyebrow: "Print promotion",
    description:
      "Flyer and leaflet designs for events, offers, announcements, and business promotion.",
    bullets: ["Up to A4 size", "1 Side: £50", "2 Sides: £60"],
  },
  {
    title: "Posters",
    image: "/images/WEBSITE BUTTON POSTERS.png",
    requestLink: "/design/book",
    eyebrow: "Large format design",
    description:
      "Poster designs for events, advertising, music, business, campaigns, and display use.",
    bullets: ["A4: £50", "A3: £60", "A2: £70"],
  },
  {
    title: "Brochures / Menus",
    image: "/images/WEBSITE BUTTON MENUS.png",
    requestLink: "/design/book",
    eyebrow: "Multi-page layout",
    description:
      "Brochure and menu designs for businesses, services, restaurants, events, and information packs.",
    bullets: ["2 Sides: £60", "4 Sides: £80", "Extra Sides: £10 each"],
  },
  {
    title: "Music Cover Design",
    image: "/images/WEBSITE BUTTON MUSIC COVERS.png",
    requestLink: "/design/book",
    eyebrow: "Cover artwork",
    description:
      "Artwork for singles, albums, mixtapes, EPs, digital releases, and promotional music content.",
    bullets: [
      "Simple: £50",
      "Advanced: £80",
      "Back Cover: £20",
      "Social Media Pack: +£10",
    ],
  },
  {
    title: "Banner Design",
    image: "/images/WEBSITE BUTTON BANNER DESIGN.png",
    requestLink: "/design/book",
    eyebrow: "Digital and print banners",
    description:
      "Banner graphics for websites, social media, YouTube, events, headers, and promotional campaigns.",
    bullets: ["Banner Design: £60"],
  },
  {
    title: "Custom Font / Symbol",
    image: "/images/WEBSITE BUTTON CUSTOM FONTS.png",
    requestLink: "/design/book",
    eyebrow: "Custom marks",
    description:
      "Custom font-style lettering, symbols, marks, icons, and visual identity elements.",
    bullets: ["Custom Font / Symbol: £60"],
  },
  {
    title: "Pattern Design",
    image: "/images/WEBSITE BUTTON PATTERN.png",
    requestLink: "/design/book",
    eyebrow: "Repeat graphics",
    description:
      "Pattern artwork for clothing, backgrounds, packaging, wallpapers, branding, and visual systems.",
    bullets: ["Pattern Design: From £60"],
  },
];

const initialBusinessDigitalServices: ServiceItem[] = [
  {
    title: "Business Card",
    image: "/images/WEBSITE BUTTON BUSINESS CARD DESIGN.png",
    requestLink: "/design/book",
    eyebrow: "Business print",
    description:
      "Business card designs for personal brands, companies, creators, freelancers, and services.",
    bullets: ["1 Side: £55", "2 Sides: £60"],
  },
  {
    title: "Advert Photos",
    image: "/images/WEBSITE BUTTON ADVERT PHOTOS.png",
    requestLink: "/design/book",
    eyebrow: "Promotional visuals",
    description:
      "Custom advert images created to a specific style based on your supplied brief. Specify colours, visual direction, product details, text, and promotional requirements. Retouching is included.",
    bullets: [
      "£40 per image",
      "Retouch included",
      "Designed to supplied brief",
    ],
  },
  {
    title: "Social Media Content",
    image: "/images/WEBSITE BUTTON SOCIAL MEDIA VIDEOS.png",
    requestLink: "/design/book",
    eyebrow: "Digital content",
    description:
      "Creative social media content for posts, adverts, campaigns, announcements, and short video visuals.",
    bullets: ["Up to 5 mins video: From £60"],
  },
  {
    title: "GIF Design",
    image: "/images/WEBSITE BUTTON GIF DESIGN.png",
    requestLink: "/design/book",
    eyebrow: "Animated graphics",
    description:
      "Custom GIF designs for branding, content, reactions, digital campaigns, and promotional use.",
    bullets: ["GIF Design: From £60"],
  },
  {
    title: "Lyric Video",
    image: "/images/WEBSITE BUTTON LYRIC VIDEO.png",
    requestLink: "/design/book",
    eyebrow: "Music visuals",
    description:
      "Lyric video design for songs, singles, visual releases, promotional rollouts, and music content.",
    bullets: ["Lyric Video: £80"],
  },
  {
    title: "Photo Editing",
    image: "/images/WEBSITE BUTTON PHOTO EDITING.png",
    requestLink: "/design/book",
    eyebrow: "Photo retouching",
    description:
      "Editing and enhancement of existing photographs, including quality and clarity improvements with optional colour, tone, and custom editing.",
    bullets: [
      "Retouch Only: £30 first photo",
      "Additional Photos: +£5 each",
      "Filter / Hue / Tone / Vibrance: +£10 per photo",
      "Single Colour Edit: +£10 per photo",
      "Custom Editing: +£20 per photo",
    ],
  },
  {
    title: "Mockup Design",
    image: "",
    requestLink: "/design/book",
    eyebrow: "Product visualisation",
    description:
      "2D mockup design showing how your chosen product, artwork, branding, or design will look before final production.",
    bullets: ["2D Mockup Design: £50"],
  },
  {
    title: "Packaging Design",
    image: "",
    requestLink: "/design/book",
    eyebrow: "Product packaging",
    description:
      "Custom package design created around your product, branding, supplied brief, and visual requirements.",
    bullets: ["Packaging Design: £50"],
  },
];

const upcomingServices = [
  "Sticker Design",
  "Background Design",
  "Watermark Design",
];

function SafeServiceVisual({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-blue-500 text-[10px] font-mono uppercase tracking-widest mb-1 font-black">
          ASSET VIEW PENDING
        </span>

        <p className="text-[9px] text-zinc-600 line-clamp-2 px-4 italic font-mono uppercase">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-auto max-h-64 object-contain mx-auto p-4 transition duration-500 group-hover:scale-102"
      loading="lazy"
    />
  );
}

export default function ServicesPage() {
  const [coreServices, setCoreServices] =
    useState<ServiceItem[]>(initialCoreDesignServices);

  const [businessServices, setBusinessServices] =
    useState<ServiceItem[]>(initialBusinessDigitalServices);

  useEffect(() => {
    async function syncDatabaseServices() {
      try {
        const res = await fetch("/api/admin/designservices");
        const data = await res.json();

        if (
          data.services &&
          Array.isArray(data.services) &&
          data.services.length > 0
        ) {
          const updateServicesList = (list: ServiceItem[]) =>
            list.map((localItem) => {
              const dbItem = data.services.find(
                (d: {
                  title: string;
                  imageUrl?: string;
                  image?: string;
                  price?: number;
                }) =>
                  d.title.toLowerCase() === localItem.title.toLowerCase()
              );

              if (dbItem) {
                return {
                  ...localItem,
                  image: dbItem.imageUrl || dbItem.image || localItem.image,
                };
              }

              return localItem;
            });

          setCoreServices((prev) => updateServicesList(prev));
          setBusinessServices((prev) => updateServicesList(prev));
        }
      } catch (err) {
        console.error(
          "Using static defaults, database sync bypassed:",
          err
        );
      }
    }

    syncDatabaseServices();
  }, []);

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

          .section-title-panel {
            background-color: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
          }
        `}
      </style>

      <div className="relative z-10 pt-24 pb-20 space-y-12">
        {/* HEADER SECTION */}
        <header className="section-title-panel relative left-1/2 w-screen max-w-none -translate-x-1/2 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-6 py-10 text-center">
            <h1
              className="raf-heading text-3xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
              style={{
                WebkitTextStroke: "2px #000",
                paintOrder: "stroke fill",
              }}
            >
              Design Services
            </h1>
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto px-6 space-y-16">
          {/* CORE SERVICES SECTION */}
          <ServiceSection
            eyebrow=""
            title="Basic Services"
            services={coreServices}
          />

          {/* BUSINESS DIGITAL SERVICES SECTION */}
          <ServiceSection
            eyebrow="Business / Digital Services"
            title="Business / Digital Services"
            services={businessServices}
          />

          {/* UPCOMING PIPELINE PANEL */}
          <section className="rounded-2xl border-4 border-black bg-black/75 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="font-mono">
              <h2 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide">
                Coming Soon
              </h2>
            </div>

            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-sm sm:text-base">
              {upcomingServices.map((service) => (
                <li
                  key={service}
                  className="rounded border-2 border-black bg-zinc-900/50 px-4 py-3 text-zinc-400 uppercase font-bold tracking-wider"
                >
                  [+] {service}
                </li>
              ))}
            </ul>
          </section>

          {/* NEED MORE INFO SECTION CARDS */}
          <section className="space-y-6">
            <div className="rounded-2xl border-4 border-black bg-black/75 p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="raf-heading text-2xl sm:text-4xl uppercase tracking-wide">
                Need more info?
              </h2>

              <p className="max-w-2xl mx-auto text-zinc-200 font-mono text-sm sm:text-base leading-6 pt-3">
                View previous design examples or learn how the full service
                process works before logging a project configuration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* How It Works Card */}
              <article className="overflow-hidden rounded-2xl border-4 border-black bg-black/75 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <Link
                  href="/how-it-works"
                  className="block bg-zinc-950 border-b-4 border-black group overflow-hidden relative"
                >
                  <SafeServiceVisual
                    src="/images/How It Works Design Image.jpg"
                    alt="How It Works"
                  />

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between items-start">
                  <div className="space-y-2 w-full">
                    <h3 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
                      How It Works
                    </h3>

                    <p className="text-zinc-200 font-mono text-sm sm:text-base leading-6 tracking-normal pt-2">
                      Understand the process from idea to delivery.
                    </p>
                  </div>

                  <div className="w-full mt-6 flex items-center justify-end">
                    <Link
                      href="/how-it-works"
                      className="rounded border-4 border-black bg-blue-600 px-6 py-3 text-sm font-black font-mono uppercase text-black transition hover:bg-blue-500 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                    >
                      Process Blueprint →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Gallery Card */}
              <article className="overflow-hidden rounded-2xl border-4 border-black bg-black/75 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <Link
                  href="/design/gallery"
                  className="block bg-zinc-950 border-b-4 border-black group overflow-hidden relative"
                >
                  <SafeServiceVisual
                    src="/images/Gallery.jpg"
                    alt="Gallery"
                  />

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between items-start">
                  <div className="space-y-2 w-full">
                    <h3 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
                      Gallery
                    </h3>

                    <p className="text-zinc-200 font-mono text-sm sm:text-base leading-6 tracking-normal pt-2">
                      View previous and current design work.
                    </p>
                  </div>

                  <div className="w-full mt-6 flex items-center justify-end">
                    <Link
                      href="/design/gallery"
                      className="rounded border-4 border-black bg-zinc-900 px-5 py-2 text-xs font-black font-mono uppercase text-white transition hover:bg-zinc-800 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                    >
                      View Gallery Matrix →
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ServiceSection({
  eyebrow,
  title,
  services,
}: {
  eyebrow: string;
  title: string;
  services: ServiceItem[];
}) {
  return (
    <section className="space-y-6">
      <div className="font-mono border-b-4 border-black pb-3">
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-widest text-blue-500">
            {eyebrow}
          </p>
        )}

        <h2 className="raf-heading mt-1 text-3xl sm:text-4xl uppercase tracking-wide">
          {title}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((service) => (
          <DesignServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}

function DesignServiceCard({
  title,
  image,
  requestLink,
  eyebrow,
  description,
  bullets,
}: ServiceItem) {
  return (
    <article className="overflow-hidden rounded-2xl border-4 border-black bg-black/75 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
      <Link
        href={requestLink}
        className="block bg-zinc-950 border-b-4 border-black group overflow-hidden relative"
      >
        <SafeServiceVisual src={image} alt={title} />

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-300" />
      </Link>

      <div className="p-6 flex-1 flex flex-col justify-between items-start">
        <div className="space-y-2 w-full">
          <p className="text-sm font-mono font-black uppercase tracking-widest text-blue-400">
            {eyebrow}
          </p>

          <h3 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
            {title}
          </h3>

          <p className="text-zinc-200 font-mono text-sm sm:text-base leading-6 tracking-normal pt-2">
            {description}
          </p>

          <div className="mt-4 pt-4 border-t-2 border-black w-full">
            <h4 className="text-sm font-mono font-black uppercase tracking-widest text-zinc-300 mb-3">
              [ Rate Framework ]
            </h4>

            <div className="grid gap-2 font-mono text-sm sm:text-base">
              {bullets.map((item) => (
                <div
                  key={item}
                  className="bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 rounded text-zinc-100 font-bold tracking-wide"
                >
                  » {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full mt-6 flex items-center justify-end">
          <Link
            href={requestLink}
            className="rounded border-4 border-black bg-blue-600 px-6 py-3 text-sm font-black font-mono uppercase text-black transition hover:bg-blue-500 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
          >
            Book Session
          </Link>
        </div>
      </div>
    </article>
  );
}
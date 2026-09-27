"use client";

import Link from "next/link";

export default function BeatsHubPage() {
  const hubLinks = [
    {
      title: "Beat Store",
      href: "/beats/store",
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068277/Beat_Shop_Image_hd6ycp.jpg",
    },
    {
      title: "Beat Services",
      href: "/beats/services",
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068278/Beat_Services_Image_gqmjiu.jpg",
    },
    {
      title: "Booking Desk",
      href: "/beats/services/book",
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068278/Booking_Music_nts5yf.png",
    },
    {
      title: "How It Works",
      href: "/beats/services/how-it-works",
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068289/How_It_Works_Image_fmqnsd.jpg",
    },
  ];

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

      {/* HEADER BANNER — SAME STYLE AS HOMEPAGE */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h1 className="raf-heading text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            BEATS SECTION
          </h1>
          <p className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-bold">
            Browse original beats, book music production services, hear examples and learn how the process works.
          </p>
        </div>
      </header>

      {/* NAVIGATION IMAGE GRID — 25% WIDER THAN THE PREVIOUS MAX-W-6XL GRID */}
      <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {hubLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.title}
              className="group block overflow-hidden rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-black/75 p-2 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl border border-black sm:border-2 bg-zinc-950">
                <img
                  src={link.image}
                  alt={link.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/beats/services/examples"
            className="inline-flex items-center justify-center rounded-xl border-2 border-black bg-black/80 px-7 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-0.5 hover:bg-red-600"
          >
            Audio Examples
          </Link>
        </div>
      </section>
    </main>
  );
}

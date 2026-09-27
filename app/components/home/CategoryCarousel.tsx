"use client";

import Link from "next/link";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const categories = [
  {
    title: "Beats",
    description: "Browse beats, licences and production.",
    href: "/beats",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_BEATS_BUTTON_sxnwgt.png",
  },
  {
    title: "Music",
    description: "Albums, singles and releases.",
    href: "/music",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162688/HOMEPAGE_MUSIC_BUTTON_o3jqp9.png",
  },
  {
    title: "Clothing",
    description: "HipHop100 clothing and merchandise.",
    href: "/clothing",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_CLOTHING_BUTTON_azz2xr.png",
  },
  {
    title: "Design",
    description: "Artwork, branding and graphics.",
    href: "/design",
    image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_DESIGN_BUTTON_g0jrnp.png",
  },
];

export default function CategoryCarousel() {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="font-raf text-4xl uppercase tracking-wide">
          Explore RAF By Design
        </h2>
        <div className="mx-auto mt-4 h-[2px] w-24 bg-red-500" />
        <p className="mt-4 text-white/60 font-mono text-xs uppercase tracking-widest">
          Everything creative in one place.
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop
        spaceBetween={25}
        breakpoints={{
          0: {
            slidesPerView: 1.2,
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1400: {
            slidesPerView: 4,
          },
        }}
      >
        {categories.map((category) => (
          <SwiperSlide key={category.title}>
            <Link href={category.href}>
              <article className="group overflow-hidden rounded-3xl border border-red-500/20 bg-black/50 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-red-500 hover:shadow-[0_0_35px_rgba(255,0,0,.3)] p-4">

                {/* 1600x900 FRAME (16:9 Aspect Ratio) */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-950 border border-black flex items-center justify-center p-1">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="pt-4 pb-2 px-2">
                  <h3 className="font-raf text-3xl uppercase tracking-wide text-white">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-xs font-mono text-white/60">
                    {category.description}
                  </p>
                </div>
              </article>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
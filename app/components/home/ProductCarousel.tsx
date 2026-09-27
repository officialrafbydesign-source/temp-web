"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type ProductCard = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  badge?: string;
};

type ProductCarouselProps = {
  title?: string;
  items: ProductCard[];
};

export default function ProductCarousel({
  title,
  items,
}: ProductCarouselProps) {
  return (
    <section className="space-y-8">
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-raf text-3xl md:text-4xl">
              {title}
            </h2>

            <div className="mt-3 h-[2px] w-24 bg-red-500" />
          </div>
        </div>
      )}

      <Swiper
        modules={[
          Navigation,
          Pagination,
          Autoplay,
        ]}
        navigation
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 4500,
          disableOnInteraction:
            false,
        }}
        loop={
          items.length > 1
        }
        centeredSlides
        spaceBetween={28}
        breakpoints={{
          0: {
            slidesPerView:
              1.15,
            centeredSlides:
              true,
          },

          640: {
            slidesPerView:
              2,
            centeredSlides:
              false,
          },

          1024: {
            slidesPerView:
              3,
            centeredSlides:
              false,
          },

          1500: {
            slidesPerView:
              4,
            centeredSlides:
              false,
          },
        }}
      >
        {items.map(
          (item) => (
            <SwiperSlide
              key={item.id}
            >
              <Link
                href={
                  item.href
                }
              >
                <article className="group overflow-hidden rounded-3xl border border-red-500/20 bg-black/50 backdrop-blur transition-all duration-500 hover:-translate-y-3 hover:border-red-500 hover:shadow-[0_0_40px_rgba(255,0,0,.35)]">
                  <div className="relative aspect-square overflow-hidden bg-zinc-950 flex items-center justify-center">
                    {item.image &&
                    typeof item.image ===
                      "string" &&
                    item.image.trim() !==
                      "" ? (
                      <Image
                        src={
                          item.image
                        }
                        alt={
                          item.title
                        }
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1499px) 33vw, 25vw"
                        className="object-contain object-center sm:object-cover duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-center p-4">
                        <span className="text-[10px] tracking-widest text-red-500 font-mono font-black mb-1">
                          NO IMAGE
                          UPLOADED
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {item.badge && (
                      <div className="absolute left-4 top-4 rounded-full bg-red-600/95 px-4 py-2 text-xs font-bold tracking-wide shadow-lg">
                        {
                          item.badge
                        }
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h3 className="font-raf text-2xl leading-tight transition-colors duration-300 group-hover:text-red-400">
                        {
                          item.title
                        }
                      </h3>

                      {item.subtitle && (
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          {
                            item.subtitle
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-red-400">
                        View Product
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/40 bg-red-600/10 transition-all duration-300 group-hover:bg-red-600 group-hover:rotate-45">
                        <span className="text-lg">
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </SwiperSlide>
          )
        )}
      </Swiper>
    </section>
  );
}
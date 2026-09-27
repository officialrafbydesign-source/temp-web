"use client";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = [
  {
    src: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg",
    alt: "RAF By Design",
  },
  {
    src: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784140412/Music_Services_Image_hadkro.png",
    alt: "Music",
  },
  {
    src: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068279/Design_Services_Image_jeaxt6.jpg",
    alt: "Design",
  },
];

export default function AboutCarousel() {
  return (
    <div className="overflow-hidden rounded-2xl">

      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop
      >
        {images.map((image) => (
          <SwiperSlide key={image.src}>
            <div className="relative aspect-video">

              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}
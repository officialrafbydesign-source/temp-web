"use client";

import { useState, useEffect } from "react";

const images = [
  "/images/hero-about.jpg",
  "/images/hero-tour.jpg",
  "/images/hero-products.jpg",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-center">

      {/* Responsive container */}
      <div className="relative w-[95%] sm:w-[85%] md:w-[80%] lg:max-w-[900px] aspect-[16/9] rounded-xl overflow-hidden shadow-xl">

        <img
          src={images[current]}
          alt="RAF Slide"
          className="w-full h-full object-cover"
        />

        {/* Navigation dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 w-3 rounded-full transition ${
                current === index
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
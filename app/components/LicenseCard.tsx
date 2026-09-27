"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

interface License {
  id: string;
  name: string;
  price: number | string;
}

interface Beat {
  id: string;
  title: string;
  artworkUrl?: string | null;
}

interface Props {
  beat?: Beat;
  license?: License;
  type?: string;
  title?: string;
  price?: string | number;
  image?: string;
  onClick?: () => void;
}

const LEASING_IMAGE =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068291/Leasing_yyc6oc.png";
const EXCLUSIVE_IMAGE =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068287/Exclusive_itamrd.png";

function normalisePrice(val?: number | string): number {
  if (val === undefined || val === null || val === "") return 0;

  let numeric = typeof val === "string" ? parseFloat(val) : val;

  if (isNaN(numeric)) return 0;

  if (numeric >= 100 && Number.isInteger(numeric)) {
    numeric = numeric / 100;
  }

  return numeric;
}

function formatPrice(val?: number | string): string {
  const numeric = normalisePrice(val);
  const isWhole = numeric % 1 === 0;
  return `£${numeric.toFixed(isWhole ? 0 : 2)}`;
}

export default function LicenseCard({
  beat,
  license,
  title,
  price,
  image,
  onClick,
}: Props) {
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  // 1. Raw License Title & Overrides
  const rawTitle = license?.name || title || "Standard License";
  const lowerName = rawTitle.toLowerCase();

  const isExclusive =
    lowerName.includes("exclusive") ||
    lowerName.includes("premium") ||
    lowerName.includes("unlimited") ||
    lowerName.includes("buyout");

  const cardTitle =
    lowerName.includes("premium") && !lowerName.includes("exclusive")
      ? "Exclusive License"
      : rawTitle;

  // 2. Map Cloudinary Image
  let cardImage = image;
  if (!cardImage) {
    cardImage = isExclusive ? EXCLUSIVE_IMAGE : LEASING_IMAGE;
  }

  // 3. Formatted Price
  const rawPrice = license ? license.price : price;
  const numericPrice = normalisePrice(rawPrice);
  const displayPrice = formatPrice(rawPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onClick) {
      onClick();
      return;
    }

    if (!beat?.id || !license?.id) {
      alert("Missing beat or license details.");
      return;
    }

    addToCart({
      id: beat.id,
      type: "beat",
      title: `${beat.title} — ${cardTitle}`,
      price: numericPrice,
      quantity: 1,
      image: beat.artworkUrl || undefined,
      beatId: beat.id,
      licenseId: license.id,
    });

    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1800);
  };

  return (
    <div
      onClick={handleAddToCart}
      className="bg-red-900 rounded-lg overflow-hidden border border-red-700 shadow cursor-pointer hover:border-red-500 transition group flex flex-col justify-between"
    >
      <div>
        {/* Aspect ratio frame preserving image proportions */}
        <div className="w-full aspect-[16/9] bg-black/60 flex items-center justify-center overflow-hidden p-2">
          <img
            src={cardImage}
            alt={cardTitle}
            className="w-full h-full object-contain group-hover:scale-105 transition duration-300 select-none"
          />
        </div>

        <div className="p-4 text-white">
          <h3 className="text-xl font-bold">{cardTitle}</h3>
          <p className="text-yellow-400 mt-1 text-2xl font-black">
            {displayPrice}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full bg-yellow-400 text-black font-extrabold px-4 py-2.5 rounded hover:bg-yellow-300 transition active:scale-95"
        >
          {addedToCart
            ? "Added to Cart ✓"
            : `Add to Cart (${displayPrice})`}
        </button>
      </div>
    </div>
  );
}

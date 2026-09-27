"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import FadeIn from "@/components/FadeIn";

function SafeImage({ src, alt, className = "", ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-4 text-center border-2 border-black">
        <span className="text-amber-400 text-[10px] font-mono uppercase tracking-widest font-black">
          IMAGE PENDING
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      className={`${className} object-cover w-full h-full`}
      loading="lazy"
    />
  );
}

type ClothingProduct = {
  id: string;
  name?: string;
  title?: string;
  price: number;
  category?: string;
  range?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  image?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  sizes?: string[];
  isTest?: boolean;
  test?: boolean;
  draft?: boolean;
  isDraft?: boolean;
  published?: boolean;
  status?: string;
};

const CLOTHING_RANGES = [
  {
    id: "originals",
    name: "ORIGINALS RANGE",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271436/ORIGINALS_RANGE_BANNER_CLOTHING_SHOP_hj8ix6.jpg",
    slug: "originals",
  },
  {
    id: "state-of-mind",
    name: "STATE OF MIND RANGE",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271438/STATE_OF_MIND_RANGE_BANNER_CLOTHING_SHOP_eupaqg.jpg",
    slug: "state-of-mind",
  },
  {
    id: "4-elements",
    name: "4 ELEMENTS RANGE",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271416/4_ELEMENTS_RANGE_BANNER_CLOTHING_SHOP_irzdmr.png",
    slug: "4-elements",
  },
  {
    id: "keepit100",
    name: "#KEEPIT100 RANGE",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1786550922/_KEEPIT100_RANGE_BANNER_CLOTHING_SHOP_r1sgvf.png",
    slug: "keepit100",
  },
];

export default function ClothingPage() {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");

  const [rawProducts, setRawProducts] = useState<ClothingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState<string>(
    rangeParam || "ALL"
  );
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(200);

  useEffect(() => {
    if (rangeParam) {
      setSelectedRange(rangeParam);
    }
  }, [rangeParam]);

  useEffect(() => {
    async function fetchClothingCatalog() {
      try {
        setLoading(true);

        const res = await fetch("/api/clothing");

        if (res.ok) {
          const data = await res.json();

          const parsed = Array.isArray(data)
            ? data
            : data.products || data.data || [];

          setRawProducts(parsed);
        } else {
          setRawProducts([]);
        }
      } catch (err) {
        console.error("Clothing storefront fetch error:", err);
        setRawProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchClothingCatalog();
  }, []);

  const cleanProducts = useMemo(() => {
    const TEST_KEYWORDS = [
      "test",
      "demo",
      "sample",
      "dummy",
      "placeholder",
      "temp",
      "draft",
      "asdf",
      "testing",
      "foo",
      "bar",
    ];

    return rawProducts
      .map((p) => {
        const displayName = (p.name || p.title || "").trim();

        const displayImg = (
          p.imageUrl ||
          p.imageUrls?.[0] ||
          p.image ||
          ""
        ).trim();

        return {
          ...p,
          displayName,
          displayImg,
        };
      })
      .filter((p) => {
        const nameLower = p.displayName.toLowerCase();
        const imgLower = p.displayImg.toLowerCase();
        const idLower = (p.id || "").toLowerCase();
        const catLower = (p.category || "").toLowerCase();

        if (!p.displayName || !p.displayImg) return false;
        if (typeof p.price !== "number" || p.price <= 0) return false;

        if (
          p.isTest === true ||
          p.test === true ||
          p.draft === true ||
          p.isDraft === true ||
          p.published === false ||
          p.status === "DRAFT" ||
          p.status === "ARCHIVED"
        ) {
          return false;
        }

        const containsTestKeyword = TEST_KEYWORDS.some(
          (kw) =>
            nameLower.includes(kw) ||
            imgLower.includes(kw) ||
            idLower.includes(kw) ||
            catLower.includes(kw)
        );

        if (containsTestKeyword) return false;

        return true;
      });
  }, [rawProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();

    cleanProducts.forEach(
      (p) => p.category && set.add(p.category.toUpperCase())
    );

    return ["ALL", ...Array.from(set)];
  }, [cleanProducts]);

  const filteredProducts = useMemo(() => {
    return cleanProducts.filter((p) => {
      const matchesSearch =
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRange =
        selectedRange === "ALL" ||
        p.range?.toLowerCase() === selectedRange.toLowerCase();

      const matchesCategory =
        selectedCategory === "ALL" ||
        p.category?.toUpperCase() === selectedCategory;

      const matchesStock = !inStockOnly || p.inStock !== false;
      const matchesPrice = p.price <= maxPrice;

      return (
        matchesSearch &&
        matchesRange &&
        matchesCategory &&
        matchesStock &&
        matchesPrice
      );
    });
  }, [
    cleanProducts,
    searchQuery,
    selectedRange,
    selectedCategory,
    inStockOnly,
    maxPrice,
  ]);

  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-24 pt-20 relative font-mono"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068302/WEBSITE_BACKGROUND_YELLOW_mymrsd.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-black/85 backdrop-blur-md border-b-4 border-black">
        <div className="max-w-[1800px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1
              className="font-raf text-3xl md:text-5xl font-black tracking-wider uppercase text-amber-400 drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
              style={{
                WebkitTextStroke: "2px #000",
                paintOrder: "stroke fill",
              }}
            >
              CLOTHING - HIPHOP100 STORE
            </h1>

            <p className="mt-1 text-xs md:text-sm uppercase tracking-[0.2em] text-zinc-300 font-bold">
              Official Streetwear • Heavyweight Apparel & Merchandise
            </p>
          </div>
        </div>
      </header>

      {/* EXPLORE RANGES */}
      <section className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-8 relative z-10">
        <div className="bg-black/75 backdrop-blur-md border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                EXPLORE RANGES
              </p>

              <p className="text-[10px] text-zinc-400 uppercase font-bold mt-1">
                Select a range to view the full collection
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLOTHING_RANGES.map((range) => (
              <Link
                key={range.id}
                href={`/clothing/ranges/${range.slug}`}
                className="group relative rounded-xl border-4 border-black overflow-hidden transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-amber-400 hover:-translate-y-1"
              >
                <div className="aspect-[16/9] w-full relative bg-zinc-950">
                  <SafeImage
                    src={sanitizeCloudinaryUrl(range.imageUrl, "")}
                    alt={range.name}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-center p-2">
                    <span className="text-[11px] sm:text-xs font-black text-white group-hover:text-amber-400 uppercase tracking-wider text-center drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                      {range.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HIPHOP100 FEATURE */}
      <section className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-6 relative z-10">
        <FadeIn>
          <div className="grid lg:grid-cols-2 bg-black/85 backdrop-blur-md border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="min-h-[250px] lg:min-h-[310px] relative">
              <SafeImage
                src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1786550922/_KEEPIT100_RANGE_BANNER_CLOTHING_SHOP_r1sgvf.png"
                alt="HipHop100"
                className="transition-transform duration-500 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/60" />
            </div>

            <div className="p-7 sm:p-10 flex flex-col justify-center items-start">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 mb-2">
                MORE THAN THE CLOTHING
              </p>

              <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
                HIPHOP100
              </h2>

              <p className="font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed mt-4 max-w-2xl">
                Explore the HipHop100 brand beyond the store. Discover the
                clothing ranges, campaigns, adverts, photoshoot diaries,
                behind-the-scenes content, events, cyphers and other media
                connected to the brand.
              </p>

              <p className="text-amber-400 text-xs font-black uppercase tracking-widest mt-4">
                REP THE CULTURE.
              </p>

              <Link
                href="/clothing/hiphop100"
                className="mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition"
              >
                EXPLORE HIPHOP100 →
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* SEARCH BAR */}
      <section className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-6 relative z-10">
        <div className="bg-black/85 backdrop-blur-md border-4 border-black p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              placeholder="SEARCH HOODIES, TEES, CAPS, OR APPAREL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-amber-400/60 text-white placeholder-zinc-500 pl-10 pr-20 py-3 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            />

            <span className="absolute left-3.5 text-amber-400 text-sm">
              🔍
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-zinc-900 hover:bg-amber-300 text-[10px] font-black uppercase bg-amber-400 px-2 py-1 rounded border border-black"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* FILTER SIDEBAR */}
        <aside className="lg:col-span-3 xl:col-span-2 space-y-6">
          <div className="bg-black/85 backdrop-blur-md border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                ⚙️ FILTER STORE
              </h3>

              <button
                onClick={() => {
                  setSelectedRange("ALL");
                  setSelectedCategory("ALL");
                  setMaxPrice(200);
                  setInStockOnly(false);
                  setSearchQuery("");
                }}
                className="text-[10px] text-zinc-400 hover:text-amber-400 uppercase font-black underline"
              >
                RESET
              </button>
            </div>

            {/* RANGE FILTER */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-300 uppercase block">
                RANGE
              </label>

              <div className="flex flex-col gap-1.5">
                {[
                  {
                    id: "ALL",
                    name: "ALL RANGES",
                    slug: "ALL",
                  },
                  ...CLOTHING_RANGES,
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRange(r.slug)}
                    className={`text-left px-3 py-1.5 rounded text-xs font-bold uppercase border border-black transition-all flex items-center justify-between ${
                      selectedRange === r.slug
                        ? "bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black"
                        : "bg-zinc-950 text-zinc-400 hover:border-amber-400 hover:text-white"
                    }`}
                  >
                    <span>{r.name}</span>

                    {selectedRange === r.slug && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-zinc-300 uppercase block">
                CATEGORY
              </label>

              <div className="flex flex-col gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-left px-3 py-1.5 rounded text-xs font-bold uppercase border border-black transition-all flex items-center justify-between ${
                      selectedCategory === c
                        ? "bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black"
                        : "bg-zinc-950 text-zinc-400 hover:border-amber-400 hover:text-white"
                    }`}
                  >
                    <span>{c}</span>

                    {selectedCategory === c && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE FILTER */}
            <div className="space-y-2 pt-2 border-t border-black">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-zinc-300 uppercase">
                  MAX PRICE
                </span>

                <span className="text-amber-400 font-black">
                  £{maxPrice.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* STOCK FILTER */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 pt-2 border-t border-black font-bold uppercase">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-amber-400 border-black rounded"
              />

              <span>IN STOCK ONLY</span>
            </label>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <section className="lg:col-span-9 xl:col-span-10 space-y-6">
          <FadeIn>
            <div className="bg-black/85 backdrop-blur-md border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="text-base font-black uppercase text-amber-400">
                  {selectedRange !== "ALL"
                    ? `${selectedRange.replaceAll("-", " ")} RANGE`
                    : "ALL APPAREL PRODUCTS"}
                </h3>

                <span className="text-xs text-zinc-400 font-bold">
                  {filteredProducts.length} ITEMS FOUND
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-amber-400 font-black text-xs uppercase animate-pulse">
                  LOADING STORE CATALOG...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-zinc-400 font-bold uppercase text-xs tracking-wider">
                    NO VALID CLOTHING ITEMS FOUND MATCHING YOUR ACTIVE FILTERS.
                  </p>

                  <button
                    onClick={() => {
                      setSelectedRange("ALL");
                      setSelectedCategory("ALL");
                      setMaxPrice(200);
                      setInStockOnly(false);
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 bg-amber-400 text-black font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-zinc-950 rounded-xl border-4 border-black hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div>
                        <div className="aspect-square relative border-b-4 border-black overflow-hidden bg-black">
                          <SafeImage
                            src={sanitizeCloudinaryUrl(
                              product.displayImg,
                              ""
                            )}
                            alt={product.displayName}
                            className="group-hover:scale-105 transition-transform duration-300"
                          />

                          {product.badge && (
                            <span className="absolute top-2 left-2 bg-amber-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {product.badge}
                            </span>
                          )}

                          {product.inStock === false && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center">
                              <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded border border-black uppercase">
                                SOLD OUT
                              </span>
                            </div>
                          )}

                          <span className="absolute bottom-2 right-2 bg-black/90 text-amber-400 font-black text-xs px-2 py-1 rounded border border-black">
                            £{product.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="p-3 space-y-1.5">
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block">
                            {product.category || "STREETWEAR"}
                          </span>

                          <h4 className="font-black text-xs text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {product.displayName}
                          </h4>

                          {product.sizes &&
                            product.sizes.length > 0 && (
                              <div className="pt-1 flex flex-wrap gap-1">
                                {product.sizes.map((sz) => (
                                  <span
                                    key={sz}
                                    className="text-[8px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded"
                                  >
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="p-3 pt-0">
                        <Link
                          href={`/clothing/${product.id}`}
                          className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black text-center text-[10px] font-black uppercase rounded-lg border-2 border-black block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          VIEW DETAILS
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
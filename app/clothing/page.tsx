"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import FadeIn from "@/components/FadeIn";

function SafeImage({
  src,
  alt,
  className = "",
  ...props
}: any) {
  const [error, setError] =
    useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-4 text-center border-2 border-black">
        <p className="text-sm text-zinc-300 font-mono">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() =>
        setError(true)
      }
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

function ClothingContent() {
  const searchParams =
    useSearchParams();

  const rangeParam =
    searchParams.get(
      "range"
    );

  const [
    rawProducts,
    setRawProducts,
  ] = useState<
    ClothingProduct[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedRange,
    setSelectedRange,
  ] = useState<string>(
    rangeParam || "ALL"
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  const [
    inStockOnly,
    setInStockOnly,
  ] = useState(false);

  const [
    maxPrice,
    setMaxPrice,
  ] = useState<number>(
    200
  );

  useEffect(() => {
    if (rangeParam) {
      setSelectedRange(
        rangeParam
      );
    }
  }, [rangeParam]);

  useEffect(() => {
    async function fetchClothingCatalog() {
      try {
        setLoading(true);

        const response =
          await fetch(
            "/api/clothing"
          );

        if (
          response.ok
        ) {
          const data =
            await response.json();

          const parsed =
            Array.isArray(
              data
            )
              ? data
              : data.products ||
                data.data ||
                [];

          setRawProducts(
            parsed
          );
        } else {
          setRawProducts(
            []
          );
        }
      } catch (error) {
        console.error(
          "Clothing storefront fetch error:",
          error
        );

        setRawProducts(
          []
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClothingCatalog();
  }, []);

  const cleanProducts =
    useMemo(() => {
      const TEST_KEYWORDS =
        [
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
        .map(
          (product) => {
            const displayName =
              (
                product.name ||
                product.title ||
                ""
              ).trim();

            const displayImg =
              (
                product.imageUrl ||
                product
                  .imageUrls?.[0] ||
                product.image ||
                ""
              ).trim();

            return {
              ...product,
              displayName,
              displayImg,
            };
          }
        )
        .filter(
          (product) => {
            const nameLower =
              product.displayName.toLowerCase();

            const imgLower =
              product.displayImg.toLowerCase();

            const idLower =
              (
                product.id ||
                ""
              ).toLowerCase();

            const catLower =
              (
                product.category ||
                ""
              ).toLowerCase();

            if (
              !product.displayName ||
              !product.displayImg
            ) {
              return false;
            }

            if (
              typeof product.price !==
                "number" ||
              product.price <=
                0
            ) {
              return false;
            }

            if (
              product.isTest ===
                true ||
              product.test ===
                true ||
              product.draft ===
                true ||
              product.isDraft ===
                true ||
              product.published ===
                false ||
              product.status ===
                "DRAFT" ||
              product.status ===
                "ARCHIVED"
            ) {
              return false;
            }

            const containsTestKeyword =
              TEST_KEYWORDS.some(
                (
                  keyword
                ) =>
                  nameLower.includes(
                    keyword
                  ) ||
                  imgLower.includes(
                    keyword
                  ) ||
                  idLower.includes(
                    keyword
                  ) ||
                  catLower.includes(
                    keyword
                  )
              );

            return !containsTestKeyword;
          }
        );
    }, [rawProducts]);

  const categories =
    useMemo(() => {
      const set =
        new Set<string>();

      cleanProducts.forEach(
        (product) => {
          if (
            product.category
          ) {
            set.add(
              product.category.toUpperCase()
            );
          }
        }
      );

      return [
        "ALL",
        ...Array.from(
          set
        ),
      ];
    }, [cleanProducts]);

  const filteredProducts =
    useMemo(() => {
      const query =
        searchQuery.toLowerCase();

      return cleanProducts.filter(
        (product) => {
          const matchesSearch =
            product.displayName
              .toLowerCase()
              .includes(
                query
              ) ||
            product.description
              ?.toLowerCase()
              .includes(
                query
              ) ||
            product.category
              ?.toLowerCase()
              .includes(
                query
              );

          const matchesRange =
            selectedRange ===
              "ALL" ||
            product.range
              ?.toLowerCase() ===
              selectedRange.toLowerCase();

          const matchesCategory =
            selectedCategory ===
              "ALL" ||
            product.category
              ?.toUpperCase() ===
              selectedCategory;

          const matchesStock =
            !inStockOnly ||
            product.inStock !==
              false;

          const matchesPrice =
            product.price <=
            maxPrice;

          return (
            matchesSearch &&
            matchesRange &&
            matchesCategory &&
            matchesStock &&
            matchesPrice
          );
        }
      );
    }, [
      cleanProducts,
      searchQuery,
      selectedRange,
      selectedCategory,
      inStockOnly,
      maxPrice,
    ]);

  const resetFilters = () => {
    setSelectedRange(
      "ALL"
    );

    setSelectedCategory(
      "ALL"
    );

    setMaxPrice(200);
    setInStockOnly(
      false
    );

    setSearchQuery("");
  };

  return (
    <main
      className="min-h-screen text-white pb-24 pt-20 relative font-mono"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068302/WEBSITE_BACKGROUND_YELLOW_mymrsd.jpg')",

        backgroundAttachment:
          "fixed",

        backgroundPosition:
          "center center",

        backgroundSize:
          "cover",
      }}
    >
      <header className="w-full bg-black/85 backdrop-blur-md border-b-4 border-black">
        <div className="w-full px-6 py-10 text-center">
          <h1 className="font-raf text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-amber-400">
            CLOTHING -
            HIPHOP100 STORE
          </h1>
        </div>
      </header>

      <section className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-8 relative z-10">
        <div className="bg-black/75 backdrop-blur-md border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="border-b-2 border-black pb-3 text-center">
            <h2 className="font-raf text-2xl sm:text-3xl uppercase tracking-wide text-amber-400">
              EXPLORE RANGES
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLOTHING_RANGES.map(
              (range) => (
                <Link
                  key={
                    range.id
                  }
                  href={`/clothing/ranges/${range.slug}`}
                  className="group relative rounded-xl border-4 border-black overflow-hidden transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-amber-400 hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] w-full relative bg-zinc-950">
                    <SafeImage
                      src={sanitizeCloudinaryUrl(
                        range.imageUrl,
                        ""
                      )}
                      alt={
                        range.name
                      }
                      className="group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-center p-2">
                      <span className="text-sm sm:text-base font-black text-white group-hover:text-amber-400 uppercase tracking-wide text-center drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                        {
                          range.name
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <section className="lg:hidden w-full max-w-[1800px] mx-auto px-4 pt-4 relative z-10">
        <FadeIn>
          <div className="bg-black/85 backdrop-blur-md border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="border-b border-black pb-2 text-center">
              <h3 className="font-raf text-base uppercase tracking-wide text-amber-400">
                {selectedRange !==
                "ALL"
                  ? `${selectedRange.replaceAll(
                      "-",
                      " "
                    )} RANGE`
                  : "ALL APPAREL PRODUCTS"}
              </h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-amber-400 font-black text-xs uppercase animate-pulse">
                LOADING STORE
                CATALOG...
              </div>
            ) : filteredProducts.length ===
              0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-zinc-200 font-bold uppercase text-xs tracking-wide">
                  NO VALID
                  CLOTHING ITEMS
                  FOUND MATCHING
                  YOUR ACTIVE
                  FILTERS.
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="px-4 py-2 bg-amber-400 text-black font-black text-xs uppercase rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  RESET ALL
                  FILTERS
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(
                  (
                    product
                  ) => (
                    <div
                      key={
                        product.id
                      }
                      className="group min-h-[138px] flex overflow-hidden bg-zinc-950 rounded-xl border-2 border-black hover:border-amber-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="w-[38%] aspect-square flex-shrink-0 relative border-r-2 border-black overflow-hidden bg-black">
                        <SafeImage
                          src={sanitizeCloudinaryUrl(
                            product.displayImg,
                            ""
                          )}
                          alt={
                            product.displayName
                          }
                          className="group-hover:scale-105 transition-transform duration-300"
                        />

                        {product.badge && (
                          <span className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-black">
                            {
                              product.badge
                            }
                          </span>
                        )}

                        {product.inStock ===
                          false && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black text-[9px] px-2 py-1 rounded border border-black uppercase">
                              SOLD
                              OUT
                            </span>
                          </div>
                        )}

                        <span className="absolute bottom-1.5 right-1.5 bg-black/90 text-amber-400 font-black text-[10px] px-1.5 py-0.5 rounded border border-black">
                          £
                          {product.price.toFixed(
                            2
                          )}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 p-2.5 flex flex-col justify-between">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide block">
                            {product.category ||
                              "STREETWEAR"}
                          </span>

                          <h4 className="mt-1 font-black text-sm text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {
                              product.displayName
                            }
                          </h4>

                          {product.sizes &&
                            product
                              .sizes
                              .length >
                              0 && (
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {product.sizes.map(
                                  (
                                    size
                                  ) => (
                                    <span
                                      key={
                                        size
                                      }
                                      className="text-[9px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded"
                                    >
                                      {
                                        size
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <Link
                          href={`/clothing/${product.id}`}
                          className="mt-2 w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-center text-[10px] font-black uppercase rounded-md border border-black block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          VIEW
                          DETAILS
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      <div className="flex flex-col">
        <section className="order-3 lg:order-1 w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-6 relative z-10">
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

              <div className="p-7 sm:p-10 flex flex-col justify-center items-center text-center">
                <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
                  HIPHOP100
                </h2>

                <p className="font-mono text-sm sm:text-base text-zinc-200 leading-7 mt-4 max-w-2xl">
                  Explore the
                  HipHop100 brand
                  beyond the
                  store. Discover
                  the clothing
                  ranges,
                  campaigns,
                  adverts,
                  photoshoot
                  diaries,
                  behind-the-scenes
                  content, events,
                  cyphers and other
                  media connected
                  to the brand.
                </p>

                <Link
                  href="/clothing/hiphop100"
                  className="mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  EXPLORE
                  HIPHOP100 →
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="order-1 lg:order-2 w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-6 relative z-10">
          <div className="bg-black/85 backdrop-blur-md border-4 border-black p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="SEARCH HOODIES, TEES, CAPS, OR APPAREL..."
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event
                      .target
                      .value
                  )
                }
                className="w-full bg-zinc-950 border-2 border-amber-400/60 text-white placeholder-zinc-500 pl-10 pr-20 py-3.5 rounded-xl text-sm font-bold uppercase focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              />

              <span className="absolute left-3.5 text-amber-400 text-sm">
                🔍
              </span>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                  className="absolute right-3 text-zinc-900 hover:bg-amber-300 text-[10px] font-black uppercase bg-amber-400 px-2 py-1 rounded border border-black"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="order-2 lg:order-3 max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-4 sm:pt-6 lg:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 relative z-10">
          <aside className="lg:col-span-3 xl:col-span-2 space-y-3 lg:space-y-6">
            <div className="bg-black/85 backdrop-blur-md border-2 lg:border-4 border-black p-3 lg:p-5 rounded-xl lg:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-6">
              <div className="flex items-center justify-between border-b border-black lg:border-b-2 pb-2 lg:pb-3">
                <h3 className="font-raf text-sm lg:text-xl text-amber-400 uppercase tracking-wide">
                  FILTER STORE
                </h3>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="text-[9px] lg:text-sm text-zinc-300 hover:text-amber-400 uppercase font-black underline"
                >
                  RESET
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] lg:text-sm font-black text-white uppercase block">
                  RANGE
                </p>

                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
                  {[
                    {
                      id:
                        "ALL",

                      name:
                        "ALL RANGES",

                      slug:
                        "ALL",
                    },
                    ...CLOTHING_RANGES,
                  ].map(
                    (range) => (
                      <button
                        type="button"
                        key={
                          range.id
                        }
                        onClick={() =>
                          setSelectedRange(
                            range.slug
                          )
                        }
                        className={`shrink-0 lg:w-full text-left px-2 lg:px-3 py-1.5 lg:py-2 rounded text-[10px] lg:text-sm font-bold uppercase border border-black transition-all flex items-center justify-between gap-2 ${
                          selectedRange ===
                          range.slug
                            ? "bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black"
                            : "bg-zinc-950 text-zinc-400 hover:border-amber-400 hover:text-white"
                        }`}
                      >
                        <span>
                          {
                            range.name
                          }
                        </span>

                        {selectedRange ===
                          range.slug && (
                          <span>
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] lg:text-sm font-black text-white uppercase block">
                  CATEGORY
                </p>

                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
                  {categories.map(
                    (
                      category
                    ) => (
                      <button
                        type="button"
                        key={
                          category
                        }
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`shrink-0 lg:w-full text-left px-2 lg:px-3 py-1.5 lg:py-2 rounded text-[10px] lg:text-sm font-bold uppercase border border-black transition-all flex items-center justify-between gap-2 ${
                          selectedCategory ===
                          category
                            ? "bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black"
                            : "bg-zinc-950 text-zinc-400 hover:border-amber-400 hover:text-white"
                        }`}
                      >
                        <span>
                          {
                            category
                          }
                        </span>

                        {selectedCategory ===
                          category && (
                          <span>
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-1.5 lg:space-y-2 pt-2 border-t border-black">
                <div className="flex justify-between items-center text-[10px] lg:text-sm font-bold">
                  <span className="text-zinc-300 uppercase">
                    MAX PRICE
                  </span>

                  <span className="text-amber-400 font-black">
                    £
                    {maxPrice.toFixed(
                      2
                    )}
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={
                    maxPrice
                  }
                  onChange={(
                    event
                  ) =>
                    setMaxPrice(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-[10px] lg:text-sm text-zinc-200 pt-2 border-t border-black font-bold uppercase">
                <input
                  type="checkbox"
                  checked={
                    inStockOnly
                  }
                  onChange={(
                    event
                  ) =>
                    setInStockOnly(
                      event
                        .target
                        .checked
                    )
                  }
                  className="w-3.5 h-3.5 lg:w-4 lg:h-4 accent-amber-400 border-black rounded"
                />

                <span>
                  IN STOCK ONLY
                </span>
              </label>
            </div>
          </aside>

          <section className="hidden lg:block lg:col-span-9 xl:col-span-10 space-y-6">
            <FadeIn>
              <div className="bg-black/85 backdrop-blur-md border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
                <div className="border-b-2 border-black pb-3 text-center">
                  <h3 className="font-raf text-2xl sm:text-3xl uppercase tracking-wide text-amber-400">
                    {selectedRange !==
                    "ALL"
                      ? `${selectedRange.replaceAll(
                          "-",
                          " "
                        )} RANGE`
                      : "ALL APPAREL PRODUCTS"}
                  </h3>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-amber-400 font-black text-sm uppercase animate-pulse">
                    LOADING STORE
                    CATALOG...
                  </div>
                ) : filteredProducts.length ===
                  0 ? (
                  <div className="py-16 text-center space-y-3">
                    <p className="text-zinc-200 font-bold uppercase text-sm tracking-wide">
                      NO VALID
                      CLOTHING
                      ITEMS FOUND
                      MATCHING YOUR
                      ACTIVE
                      FILTERS.
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="px-5 py-2.5 bg-amber-400 text-black font-black text-sm uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      RESET ALL
                      FILTERS
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map(
                      (
                        product
                      ) => (
                        <div
                          key={
                            product.id
                          }
                          className="group bg-zinc-950 rounded-xl border-4 border-black hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <div>
                            <div className="aspect-square relative border-b-4 border-black overflow-hidden bg-black">
                              <SafeImage
                                src={sanitizeCloudinaryUrl(
                                  product.displayImg,
                                  ""
                                )}
                                alt={
                                  product.displayName
                                }
                                className="group-hover:scale-105 transition-transform duration-300"
                              />

                              {product.badge && (
                                <span className="absolute top-2 left-2 bg-amber-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  {
                                    product.badge
                                  }
                                </span>
                              )}

                              {product.inStock ===
                                false && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center">
                                  <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded border border-black uppercase">
                                    SOLD
                                    OUT
                                  </span>
                                </div>
                              )}

                              <span className="absolute bottom-2 right-2 bg-black/90 text-amber-400 font-black text-xs px-2 py-1 rounded border border-black">
                                £
                                {product.price.toFixed(
                                  2
                                )}
                              </span>
                            </div>

                            <div className="p-3 space-y-1.5">
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wide block">
                                {product.category ||
                                  "STREETWEAR"}
                              </span>

                              <h4 className="font-black text-sm sm:text-base text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                                {
                                  product.displayName
                                }
                              </h4>

                              {product.sizes &&
                                product
                                  .sizes
                                  .length >
                                  0 && (
                                  <div className="pt-1 flex flex-wrap gap-1">
                                    {product.sizes.map(
                                      (
                                        size
                                      ) => (
                                        <span
                                          key={
                                            size
                                          }
                                          className="text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-1 rounded"
                                        >
                                          {
                                            size
                                          }
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className="p-3 pt-0">
                            <Link
                              href={`/clothing/${product.id}`}
                              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-center text-sm font-black uppercase rounded-lg border-2 border-black block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                              VIEW
                              DETAILS
                            </Link>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </FadeIn>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ClothingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black pt-32 text-center text-amber-400 font-mono font-black uppercase">
          Loading clothing
          store...
        </main>
      }
    >
      <ClothingContent />
    </Suspense>
  );
}
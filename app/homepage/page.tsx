"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type License = {
  id: string;
  name: string;
  price: number;
};

type Beat = {
  id: string;
  title: string;
  genre?: string | null;
  bpm?: number | null;
  key?: string | null;
  artworkUrl?: string | null;
  audioUrl?: string | null;
  youtubeUrl?: string | null;
  licenses?: License[];
};

type MusicProduct = {
  id: string;
  price: number;
  itemType: string;
  release?: {
    id: string;
    title: string;
    type: string;
    coverUrl?: string | null;
    genre?: string | null;
    artist?: {
      name?: string | null;
    };
    songs?: unknown[];
  };
};

type ClothingProduct = {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrls?: string[];
  variants?: {
    id: string;
    stock: number;
  }[];
};

type HomepageData = {
  beats: Beat[];
  music: MusicProduct[];
  clothing: ClothingProduct[];
};

type CategorySlide = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  imageLabel: string;
};

const categorySlides: CategorySlide[] = [
  {
    title: "Beats",
    subtitle: "Lease beats, buy exclusives and discover new instrumentals.",
    href: "/beats",
    image: "",
    imageLabel: "BEATS CAROUSEL IMAGE — 1600 × 900 PX",
  },
  {
    title: "Music",
    subtitle: "Explore releases, singles, mixtapes and digital downloads.",
    href: "/music",
    image: "",
    imageLabel: "MUSIC CAROUSEL IMAGE — 1600 × 900 PX",
  },
  {
    title: "Clothing",
    subtitle: "Shop HipHop100 clothing, accessories and original artwork.",
    href: "/shop",
    image: "",
    imageLabel: "CLOTHING CAROUSEL IMAGE — 1600 × 900 PX",
  },
  {
    title: "Design",
    subtitle: "Logos, artwork, branding, promotional content and more.",
    href: "/design",
    image: "",
    imageLabel: "DESIGN CAROUSEL IMAGE — 1600 × 900 PX",
  },
];

const aboutSlides = [
  {
    image: "/images/hero-about.jpg",
    title: "A One Stop Shop for All Things Art",
  },
  {
    image: "",
    title: "Music, Design and Clothing Under One Roof",
  },
  {
    image: "",
    title: "Independent Creativity Built to Last",
  },
];

function getLicensePrice(
  beat: Beat,
  name: string,
  fallback: number
): number {
  return (
    beat.licenses?.find(
      (license) => license.name.toLowerCase() === name.toLowerCase()
    )?.price ?? fallback
  );
}

export default function Homepage() {
  const [data, setData] = useState<HomepageData>({
    beats: [],
    music: [],
    clothing: [],
  });

  const [loading, setLoading] = useState(true);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [aboutIndex, setAboutIndex] = useState(0);

  useEffect(() => {
    async function loadHomepage() {
      try {
        const response = await fetch("/api/homepage");

        if (!response.ok) {
          throw new Error("Failed to load homepage content");
        }

        const result = await response.json();

        setData({
          beats: Array.isArray(result.beats) ? result.beats : [],
          music: Array.isArray(result.music) ? result.music : [],
          clothing: Array.isArray(result.clothing)
            ? result.clothing
            : [],
        });
      } catch (error) {
        console.error("Homepage load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHomepage();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCategoryIndex(
        (current) => (current + 1) % categorySlides.length
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAboutIndex(
        (current) => (current + 1) % aboutSlides.length
      );
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const categorySlide = categorySlides[categoryIndex];
  const aboutSlide = aboutSlides[aboutIndex];

  const latestBeatCount = data.beats.length;
  const latestMusicCount = data.music.length;
  const latestClothingCount = data.clothing.length;

  const totalLatestItems = useMemo(
    () =>
      latestBeatCount +
      latestMusicCount +
      latestClothingCount,
    [latestBeatCount, latestMusicCount, latestClothingCount]
  );

  function changeCategory(direction: number) {
    setCategoryIndex((current) => {
      const next =
        (current + direction + categorySlides.length) %
        categorySlides.length;

      return next;
    });
  }

  function changeAbout(direction: number) {
    setAboutIndex((current) => {
      const next =
        (current + direction + aboutSlides.length) %
        aboutSlides.length;

      return next;
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes homeFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes homeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.985);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .home-fade-up {
          animation: homeFadeUp 650ms ease both;
        }

        .home-scale-in {
          animation: homeScaleIn 700ms ease both;
        }
      `}</style>

      {/* CATEGORY CAROUSEL */}
      <section className="relative min-h-[560px] border-b border-white/10">
        {categorySlide.image ? (
          <img
            key={categorySlide.image}
            src={categorySlide.image}
            alt={categorySlide.title}
            className="absolute inset-0 h-full w-full object-cover home-scale-in"
          />
        ) : (
          <div
            key={categorySlide.title}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950 home-scale-in"
          >
            <div className="rounded-2xl border border-dashed border-white/25 bg-black/40 px-8 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">
                Placeholder image
              </p>

              <p className="mt-3 text-sm font-semibold text-white/70">
                {categorySlide.imageLabel}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-6 lg:items-center lg:pb-0">
          <div
            key={`${categorySlide.title}-content`}
            className="max-w-2xl home-fade-up"
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              RAF By Design
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none tracking-tight sm:text-7xl">
              {categorySlide.title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              {categorySlide.subtitle}
            </p>

            <Link
              href={categorySlide.href}
              className="mt-8 inline-flex items-center rounded-full bg-red-600 px-7 py-3 text-sm font-black transition hover:bg-red-500 hover:scale-[1.02]"
            >
              Explore {categorySlide.title}
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous category"
          onClick={() => changeCategory(-1)}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 px-4 py-3 text-lg backdrop-blur transition hover:bg-black/80"
        >
          ‹
        </button>

        <button
          type="button"
          aria-label="Next category"
          onClick={() => changeCategory(1)}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 px-4 py-3 text-lg backdrop-blur transition hover:bg-black/80"
        >
          ›
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {categorySlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show ${slide.title}`}
              onClick={() => setCategoryIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                categoryIndex === index
                  ? "w-8 bg-red-500"
                  : "w-2.5 bg-white/35 hover:bg-white/65"
              }`}
            />
          ))}
        </div>
      </section>

      {/* LATEST ADDITIONS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-500">
              Recently added
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Latest from RAF By Design
            </h2>
          </div>

          {!loading && (
            <p className="text-sm text-white/40">
              {totalLatestItems} latest catalogue items
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            <LatestBeatsBox beats={data.beats} />

            <LatestMusicBox music={data.music} />

            <LatestClothingBox clothing={data.clothing} />
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section className="border-y border-white/10 bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-500">
              Creative services
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Bring Your Ideas to Life
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ServiceImageLink
              href="/services/music"
              title="Music Services"
              description="Recording, production, custom beats, mixing and mastering."
              imageLabel="MUSIC SERVICES IMAGE — 1600 × 1000 PX"
            />

            <ServiceImageLink
              href="/services/design"
              title="Design Services"
              description="Artwork, logos, promotional design, branding and digital content."
              imageLabel="DESIGN SERVICES IMAGE — 1600 × 1000 PX"
            />
          </div>
        </div>
      </section>

      {/* ABOUT CAROUSEL */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="grid min-h-[460px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[320px]">
              {aboutSlide.image ? (
                <img
                  key={aboutSlide.image}
                  src={aboutSlide.image}
                  alt={aboutSlide.title}
                  className="absolute inset-0 h-full w-full object-cover home-scale-in"
                />
              ) : (
                <div
                  key={aboutSlide.title}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black home-scale-in"
                >
                  <div className="rounded-2xl border border-dashed border-white/25 px-7 py-5 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                      About carousel placeholder
                    </p>

                    <p className="mt-3 text-sm text-white/65">
                      ABOUT IMAGE — 1600 × 900 PX
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/35" />
            </div>

            <div
              key={`${aboutSlide.title}-text`}
              className="flex flex-col justify-center p-8 sm:p-12 home-fade-up"
            >
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-500">
                About RAF By Design
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                {aboutSlide.title}
              </h2>

              <p className="mt-6 leading-7 text-white/60">
                RAF By Design brings music, design, clothing and
                creative services together in one independent
                platform. Our aim is to help artists, businesses and
                creative people turn ideas into finished work.
              </p>

              <Link
                href="/about"
                className="mt-8 inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black transition hover:border-red-500 hover:bg-red-600"
              >
                Discover Our Story
              </Link>

              <div className="mt-9 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeAbout(-1)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
                >
                  ‹
                </button>

                <div className="flex gap-2">
                  {aboutSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Show about slide ${index + 1}`}
                      onClick={() => setAboutIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === aboutIndex
                          ? "w-7 bg-red-500"
                          : "w-2 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => changeAbout(1)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUTURE SOCIAL FEED */}
      <section className="border-t border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-500">
              Latest updates
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              News & Social
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
              This section is ready for the official platform API
              connection. It will display the latest RAF By Design
              social posts and YouTube uploads in a news-style feed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {["YouTube", "Instagram", "Latest News"].map(
              (platform) => (
                <div
                  key={platform}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black"
                >
                  <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                    <div className="px-6 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                        API feed placeholder
                      </p>

                      <p className="mt-3 font-bold text-white/65">
                        {platform}
                      </p>

                      <p className="mt-3 text-xs text-white/35">
                        1080 × 1080 or 1080 × 1350 PX
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                      Coming later
                    </p>

                    <h3 className="mt-2 font-bold">
                      Live {platform} updates
                    </h3>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function LatestBeatsBox({ beats }: { beats: Beat[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-xl sm:p-8">
      <SectionHeader
        eyebrow="Beat Store"
        title="Latest Beats"
        href="/beats"
        linkLabel="View All Beats"
      />

      {beats.length === 0 ? (
        <EmptyMessage text="No beats are available yet." />
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {beats.map((beat) => (
            <article
              key={beat.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black"
            >
              {beat.artworkUrl ? (
                <img
                  src={beat.artworkUrl}
                  alt={beat.title}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <SquarePlaceholder label="BEAT COVER — 1200 × 1200 PX" />
              )}

              <div className="p-4">
                <h3 className="font-black">{beat.title}</h3>

                <p className="mt-1 text-xs text-white/45">
                  {[beat.genre, beat.bpm ? `${beat.bpm} BPM` : null]
                    .filter(Boolean)
                    .join(" · ") || "New beat"}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-black">
                    From £{getLicensePrice(beat, "Lease", 60)}
                  </p>

                  <Link
                    href="/beats"
                    className="rounded-full bg-red-600 px-4 py-2 text-xs font-black transition hover:bg-red-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LatestMusicBox({
  music,
}: {
  music: MusicProduct[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-xl sm:p-8">
      <SectionHeader
        eyebrow="Official Releases"
        title="Latest Music"
        href="/music"
        linkLabel="View All Music"
      />

      {music.length === 0 ? (
        <EmptyMessage text="No music releases are available yet." />
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {music.map((product) => (
            <Link
              key={product.id}
              href={`/music/shop/${product.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black"
            >
              {product.release?.coverUrl ? (
                <img
                  src={product.release.coverUrl}
                  alt={product.release.title}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <SquarePlaceholder label="MUSIC COVER — 1200 × 1200 PX" />
              )}

              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                  {product.release?.type || "Release"}
                </p>

                <h3 className="mt-2 text-lg font-black">
                  {product.release?.title || "Untitled release"}
                </h3>

                <p className="mt-1 text-sm text-white/45">
                  {product.release?.artist?.name || "Unknown artist"}
                </p>

                <p className="mt-4 font-black">
                  £{Number(product.price || 0).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function LatestClothingBox({
  clothing,
}: {
  clothing: ClothingProduct[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-xl sm:p-8">
      <SectionHeader
        eyebrow="HipHop100"
        title="Latest Clothing"
        href="/shop"
        linkLabel="Shop Clothing"
      />

      {clothing.length === 0 ? (
        <EmptyMessage text="No clothing products are available yet." />
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clothing.map((product) => {
            const stock =
              product.variants?.reduce(
                (total, variant) => total + variant.stock,
                0
              ) || 0;

            return (
              <Link
                key={product.id}
                href="/shop"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black"
              >
                {product.imageUrls?.[0] ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <SquarePlaceholder label="PRODUCT IMAGE — 2000 × 2000 PX" />
                )}

                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                    {product.category || "Product"}
                  </p>

                  <h3 className="mt-2 text-lg font-black">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {product.brand || "RAF By Design"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-black">
                      £
                      {Number(
                        product.salePrice ?? product.price
                      ).toFixed(2)}
                    </p>

                    <p className="text-xs text-white/35">
                      {stock > 0 ? `${stock} available` : "Stock pending"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          {title}
        </h2>
      </div>

      <Link
        href={href}
        className="w-fit text-sm font-black text-white/55 transition hover:text-white"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function ServiceImageLink({
  href,
  title,
  description,
  imageLabel,
}: {
  href: string;
  title: string;
  description: string;
  imageLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-xl"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
        <div className="rounded-2xl border border-dashed border-white/20 px-7 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
            Service image placeholder
          </p>

          <p className="mt-3 text-sm text-white/60">
            {imageLabel}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-7 sm:p-9">
        <h3 className="text-3xl font-black">{title}</h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
          {description}
        </p>

        <span className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-xs font-black text-black transition group-hover:bg-red-500 group-hover:text-white">
          Explore Services
        </span>
      </div>
    </Link>
  );
}

function SquarePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
      <div className="px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
          Placeholder
        </p>

        <p className="mt-3 text-xs text-white/55">{label}</p>
      </div>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-black/35 p-8 text-center text-sm text-white/40">
      {text}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import CategoryCarousel from "@/components/home/CategoryCarousel";
import ProductCarousel from "@/components/home/ProductCarousel";
import NewsletterModal from "@/components/home/NewsletterModal";
import FadeIn from "@/components/FadeIn";

// ========================================================
// SAFE IMAGE COMPONENT
// ========================================================
function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center border-b-4 border-black">
        <span className="text-white text-sm font-black uppercase tracking-widest mb-1">
          Image Unavailable
        </span>
        <p className="text-sm text-zinc-400 line-clamp-2 px-2">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      className={`${props.className || ""} object-cover w-full h-full`}
      loading="lazy"
      decoding="async"
    />
  );
}

// Inline Localized Slider Component
function LocalAboutCarousel() {
  const slides = [
    {
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022016/WHATWEOFFER_oqbyvq.png",
      alt: "What We Offer",
      href: "/what-we-offer",
    },
    {
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022020/About_Us_oyekxq.png",
      alt: "How It Works",
      href: "/how-it-works",
    },
    {
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022025/All_About_RAF_lfb43o.png",
      alt: "All About RAF",
      href: "/all-about-raf",
    },
    {
      image:
        "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022211/Showcase_i2x3me.png",
      alt: "Showcase",
      href: "/showcase",
    },
  ];

  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));

  const next = () =>
    setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  const slide = slides[current];

  return (
    <div className="w-full relative group aspect-[16/6] overflow-hidden rounded-xl border-4 border-black bg-zinc-950">
      <Link
        href={slide.href}
        className="absolute inset-0 block"
        aria-label={`Open ${slide.alt}`}
      >
        <SafeImage src={slide.image} alt={slide.alt} />
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </Link>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous All About RAF slide"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-black/80 flex items-center justify-center text-white hover:bg-red-600 transition text-lg font-black z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        &lt;
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next All About RAF slide"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-black/80 flex items-center justify-center text-white hover:bg-red-600 transition text-lg font-black z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        &gt;
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((item, i) => (
          <button
            key={item.href}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Show ${item.alt}`}
            className={`h-2 rounded-full border border-black transition-all ${
              current === i ? "w-7 bg-red-500" : "w-2 bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


function SocialPlatformCarousel({
  title,
  channelUrl,
  posts,
}: {
  title: string;
  channelUrl: string;
  posts: SocialPost[];
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current > posts.length - 1) {
      setCurrent(0);
    }
  }, [posts.length, current]);

  const hasPosts = posts.length > 0;
  const post = hasPosts ? posts[current] : null;

  const prev = () => {
    if (!hasPosts) return;
    setCurrent((value) => (value === 0 ? posts.length - 1 : value - 1));
  };

  const next = () => {
    if (!hasPosts) return;
    setCurrent((value) => (value === posts.length - 1 ? 0 : value + 1));
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border-4 border-black bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between gap-3 border-b-4 border-black bg-black px-4 py-4">
        <div className="min-w-0 flex-1 text-center">
          <h3 className="font-raf text-2xl sm:text-3xl uppercase text-red-500">
            {title}
          </h3>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:text-white"
          >
            Open Channel →
          </a>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={!hasPosts || posts.length <= 1}
            aria-label={`Previous ${title} post`}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-default disabled:opacity-30"
          >
            &lt;
          </button>

          <button
            type="button"
            onClick={next}
            disabled={!hasPosts || posts.length <= 1}
            aria-label={`Next ${title} post`}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-default disabled:opacity-30"
          >
            &gt;
          </button>
        </div>
      </div>

      {post ? (
        <a
          key={`${post.platform}-${post.id}`}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-zinc-950"
        >
          {post.imageUrl ? (
            <div className="aspect-video overflow-hidden border-b-2 border-black bg-black">
              <img
                src={post.imageUrl}
                alt={post.headline || post.content || `${title} post`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center border-b-2 border-black bg-gradient-to-br from-zinc-900 to-black">
              <span className="font-raf text-3xl uppercase text-white/25">
                {title}
              </span>
            </div>
          )}

          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-red-500">
                {title}
              </span>

              <span className="text-xs text-zinc-500">
                {post.timestamp || post.date || "Recent"}
              </span>
            </div>

            <h4 className="mt-3 line-clamp-2 min-h-[48px] text-base sm:text-lg font-bold leading-6 text-white">
              {post.headline || post.content || "View latest post"}
            </h4>

            {(post.channelHandle || post.handle) && (
              <p className="mt-2 text-sm text-zinc-400">
                {post.channelHandle || post.handle}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white transition group-hover:text-red-400">
                View Post →
              </p>

              {posts.length > 1 && (
                <span className="text-xs text-zinc-500">
                  {current + 1} / {posts.length}
                </span>
              )}
            </div>
          </div>
        </a>
      ) : (
        <div className="flex min-h-[240px] sm:min-h-[330px] flex-col items-center justify-center p-4 sm:p-6 text-center">
          <p className="font-raf text-2xl uppercase text-white">
            Visit {title}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
            Open the RAF By Design {title} page to view the latest posts.
          </p>
        </div>
      )}
    </section>
  );
}

type Beat = { id: string; title: string; genre?: string; bpm?: number; artworkUrl?: string; };
type MusicRelease = { id: string; releaseId: string; title: string; artist: string; coverUrl?: string; };
type ClothingProduct = { id: string; name: string; price: number; imageUrl?: string; imageUrls?: string[]; };
type SocialPost = {
  id: string;
  platform: string;
  channelHandle?: string;
  handle?: string;
  headline?: string;
  content?: string;
  url: string;
  timestamp?: string;
  date?: string;
  imageUrl?: string;
  mediaType?: string;
  publishedAt?: string;
};

export default function Home() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [music, setMusic] = useState<MusicRelease[]>([]);
  const [clothing, setClothing] = useState<ClothingProduct[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);

  const fetchSocialFeed = async () => {
    try {
      const socialRes = await fetch("/api/social");
      if (socialRes.ok) {
        const data = await socialRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setSocialFeed(data);
        }
      }
    } catch (err) {
      console.error("Failed to refresh social feed:", err);
    }
  };

  useEffect(() => {
    async function loadHomepage() {
      try {
        const [beatsRes, musicRes, clothingRes] = await Promise.all([
          fetch("/api/beats"),
          fetch("/api/music/release"),
          fetch("/api/products"),
        ]);

        if (beatsRes.ok) setBeats((await beatsRes.json()).slice?.(0, 8) || []);

        if (musicRes.ok) {
          const musicData = await musicRes.json();
          const musicArray = Array.isArray(musicData)
            ? musicData
            : (musicData.releases || musicData.data || []);
          setMusic(musicArray.slice(0, 8));
        }

        if (clothingRes.ok) setClothing((await clothingRes.json()).slice?.(0, 8) || []);
      } catch (err) {
        console.error("Failed to load homepage elements", err);
      }
    }

    loadHomepage();
    fetchSocialFeed();

    const interval = setInterval(fetchSocialFeed, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      className="home-visual-pass min-h-screen text-white overflow-hidden pb-24 pt-24 relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      <style jsx global>{`
        @font-face {
          font-family: "RAF Font Demo";
          src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .home-visual-pass {
          font-family: inherit;
        }

        .home-visual-pass .font-mono {
          font-family: inherit !important;
        }

        .home-visual-pass .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }

        /* Readability rule: avoid tiny supporting text on the homepage. */
        .home-visual-pass .text-xs {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }

        .home-visual-pass .text-\[10px\],
        .home-visual-pass .text-\[9px\] {
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }

        /* Explore RAF By Design gets an extra readability lift. */
        .homepage-category-section .text-xs,
        .homepage-category-section .text-sm {
          font-size: 1rem !important;
          line-height: 1.55rem !important;
        }

        .homepage-category-section .text-\[10px\],
        .homepage-category-section .text-\[9px\] {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }

        /* Keep Explore RAF supporting copy white and clearly readable. */
        .homepage-category-section .text-zinc-300,
        .homepage-category-section .text-zinc-400,
        .homepage-category-section .text-zinc-500,
        .homepage-category-section .text-zinc-600 {
          color: #ffffff !important;
        }

        /* Keep global header/footer supporting text from dropping below the same readable baseline. */
        nav .text-xs,
        footer .text-xs {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }

        nav .text-\[10px\],
        nav .text-\[9px\],
        footer .text-\[10px\],
        footer .text-\[9px\] {
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }

        /* Mobile homepage pass: smaller cards and lighter background rendering. */
        @media (max-width: 639px) {
          .home-visual-pass {
            background-image:
              linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)),
              url("https://res.cloudinary.com/dcrkpsnn9/image/upload/f_auto,q_auto:eco,w_900/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg") !important;
            background-attachment: scroll !important;
            background-position: center top !important;
            background-size: auto 1000px !important;
          }

          .homepage-product-section [class*="min-w-["],
          .homepage-category-section [class*="min-w-["] {
            min-width: 210px !important;
            width: 210px !important;
          }

          /* Shorter mobile cards for Explore RAF, Beats and Music Store only. */
          .homepage-category-section [class*="aspect-"] {
            aspect-ratio: 2 / 1 !important;
            max-height: 150px !important;
          }

          .homepage-beats-section [class*="aspect-"],
          .homepage-music-section [class*="aspect-"],
          .homepage-clothing-section [class*="aspect-"] {
            aspect-ratio: 4 / 3 !important;
            max-height: 158px !important;
          }

          .homepage-category-section [class*="p-4"],
          .homepage-category-section [class*="p-5"],
          .homepage-category-section [class*="p-6"],
          .homepage-beats-section [class*="p-4"],
          .homepage-beats-section [class*="p-5"],
          .homepage-beats-section [class*="p-6"],
          .homepage-music-section [class*="p-4"],
          .homepage-music-section [class*="p-5"],
          .homepage-music-section [class*="p-6"],
          .homepage-clothing-section [class*="p-4"],
          .homepage-clothing-section [class*="p-5"],
          .homepage-clothing-section [class*="p-6"] {
            padding-top: 0.65rem !important;
            padding-bottom: 0.65rem !important;
          }

          /* Explore RAF: reduce mobile heading and supporting copy. */
          .homepage-category-section h2,
          .homepage-category-section h3 {
            font-size: 1.05rem !important;
            line-height: 1.25rem !important;
          }

          .homepage-category-section p,
          .homepage-category-section .text-sm,
          .homepage-category-section .text-xs {
            font-size: 0.72rem !important;
            line-height: 1rem !important;
          }

          .homepage-category-section .text-\[10px\],
          .homepage-category-section .text-\[9px\] {
            font-size: 0.64rem !important;
            line-height: 0.9rem !important;
          }

          /* Smaller mobile product-link text in Music Store + HipHop100. */
          .homepage-music-section a .text-xs,
          .homepage-music-section a.text-xs,
          .homepage-clothing-section a .text-xs,
          .homepage-clothing-section a.text-xs {
            font-size: 0.66rem !important;
            line-height: 0.9rem !important;
          }
        }
      `}</style>
      {/* HEADER HERO SECTION */}
      <header className="w-full bg-black/60 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-center">
          <h1 className="font-raf text-[1.9rem] leading-none sm:text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            RAF BY DESIGN
          </h1>
          <p className="mt-3 mx-auto max-w-[300px] sm:max-w-none whitespace-normal sm:whitespace-nowrap text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.10em] sm:tracking-[0.28em] md:tracking-[0.38em] text-white/80 font-bold">
            One Stop Shop For All Things Art
          </p>
        </div>
      </header>

      {/* SCROLLING NEWS TICKER */}
      <div className="w-full bg-red-600 border-b-4 border-black text-white text-xs uppercase font-black tracking-widest py-2.5 overflow-hidden whitespace-nowrap select-none relative z-10 shadow-md">
        <div className="inline-block animate-[marquee_25s_linear_infinite] will-change-transform">
          ⚡ WELCOME TO RAF BY DESIGN • BEATS, MUSIC, DESIGN SERVICES AND HIPHOP100 CLOTHING • EXPLORE OUR LATEST WORK, RELEASES AND SERVICES • ⚡ WELCOME TO RAF BY DESIGN • BEATS, MUSIC, DESIGN SERVICES AND HIPHOP100 CLOTHING • EXPLORE OUR LATEST WORK, RELEASES AND SERVICES •
        </div>
      </div>

      <section className="w-full mx-auto px-3 sm:px-6 md:px-8 xl:px-10 2xl:px-12 space-y-8 sm:space-y-16 pt-6 sm:pt-12 relative z-10">

        {/* CATEGORIES SECTION */}
        <FadeIn>
          <div className="homepage-category-section w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 text-center shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CategoryCarousel />
          </div>
        </FadeIn>

        {/* LATEST BEATS DISPLAY */}
        <FadeIn>
          <div className="homepage-product-section homepage-beats-section w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 sm:mb-6 border-b-4 border-black pb-2 sm:pb-3 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                Beats
              </h2>
            </div>
            <ProductCarousel
              items={beats.map((beat) => ({
                id: beat.id,
                title: beat.title,
                subtitle: beat.genre || "Production Instrumental",
                image: sanitizeCloudinaryUrl(beat.artworkUrl, ""),
                href: `/beats/${beat.id}`,
                badge: beat.bpm ? `${beat.bpm} BPM` : "AUDIO",
                ImageComponent: SafeImage,
              }))}
            />
          </div>
        </FadeIn>

        {/* LATEST MUSIC RELEASES */}
        <FadeIn>
          <div className="homepage-product-section homepage-music-section w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 sm:mb-6 border-b-4 border-black pb-2 sm:pb-3 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                Music Store
              </h2>
            </div>
            <ProductCarousel
              items={music.map((release) => {
                const targetId = release.releaseId || release.id || "";
                return {
                  id: release.id || targetId,
                  title: release.title || "Untitled",
                  subtitle: release.artist || "Unknown Artist",
                  image: sanitizeCloudinaryUrl(release.coverUrl, ""),
                  href: targetId ? `/music/${targetId}` : "/music",
                  badge: "RELEASE",
                  ImageComponent: SafeImage,
                };
              })}
            />
          </div>
        </FadeIn>

        {/* CLOTHING & APPAREL PRODUCTS */}
        <FadeIn>
          <div className="homepage-product-section homepage-clothing-section w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 sm:mb-6 border-b-4 border-black pb-2 sm:pb-3 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                HipHop100 Clothing
              </h2>
            </div>
            <ProductCarousel
              items={clothing.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: `£${item.price.toFixed(2)}`,
                image: sanitizeCloudinaryUrl(item.imageUrl || item.imageUrls?.[0], ""),
                href: `/clothing/${item.id}`,
                badge: "CLOTHING",
                ImageComponent: SafeImage,
              }))}
            />
          </div>
        </FadeIn>

        {/* SERVICES BANNER */}
        <FadeIn>
          <section className="w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 md:p-8 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 sm:mb-6 border-b-4 border-black pb-2 sm:pb-3 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                Browse Services
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-6 md:grid-cols-2 w-full mx-auto">

              <Link href="/beats/services" className="group">
                <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(255,0,0,.25)]">
                  <div className="relative aspect-[16/6] border-b-4 border-black">
                    <SafeImage
                      src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784140412/Music_Services_Image_hadkro.png"
                      alt="Music Services"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 text-center">
                    <h3 className="font-raf text-xl sm:text-2xl tracking-wide">Music Services</h3>
                    <p className="mt-2 text-zinc-300 text-sm sm:text-base leading-6">Production • Recording • Mixing • Mastering</p>
                  </div>
                </div>
              </Link>

              <Link href="/design/services" className="group">
                <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(255,0,0,.25)]">
                  <div className="relative aspect-[16/6] border-b-4 border-black">
                    <SafeImage
                      src="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068279/Design_Services_Image_jeaxt6.jpg"
                      alt="Design Services"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 text-center">
                    <h3 className="font-raf text-xl sm:text-2xl tracking-wide">Design Services</h3>
                    <p className="mt-2 text-zinc-300 text-sm sm:text-base leading-6">Branding • Artwork • Print • Digital Design</p>
                  </div>
                </div>
              </Link>

            </div>
          </section>
        </FadeIn>

        {/* ABOUT US CAROUSEL */}
        <FadeIn>
          <div className="w-full rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border-4 border-black p-3 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-4 sm:mb-6 border-b-4 border-black pb-2 sm:pb-3 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                All About RAF
              </h2>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              <LocalAboutCarousel />
            </div>
          </div>
        </FadeIn>

        {/* LIVE SOCIAL FEED */}
        <FadeIn>
          <div className="w-full rounded-xl sm:rounded-2xl bg-black/80 backdrop-blur-md border-4 border-black p-3 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-4 border-black pb-3 sm:pb-4 mb-4 sm:mb-6 text-center">
              <h2 className="font-raf text-2xl sm:text-4xl uppercase tracking-wide text-red-500">
                RAF Social Feed
              </h2>

              <p className="mt-3 max-w-3xl mx-auto text-sm sm:text-base leading-7 text-zinc-300 text-center">
                Browse the latest RAF By Design posts and social links from YouTube, Instagram and TikTok.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
              <SocialPlatformCarousel
                title="YouTube"
                channelUrl="https://www.youtube.com/@rafbydesign"
                posts={socialFeed.filter((post) =>
                  post.platform.toLowerCase().includes("youtube")
                )}
              />

              <SocialPlatformCarousel
                title="Instagram"
                channelUrl="https://www.instagram.com/rafbydesign"
                posts={socialFeed.filter((post) =>
                  post.platform.toLowerCase().includes("instagram")
                )}
              />

              <SocialPlatformCarousel
                title="TikTok"
                channelUrl="https://www.tiktok.com/@rafbydesignmusic"
                posts={socialFeed.filter((post) =>
                  post.platform.toLowerCase().includes("tiktok")
                )}
              />
            </div>
          </div>
        </FadeIn>

      </section>

      <NewsletterModal />
    </main>
  );
}
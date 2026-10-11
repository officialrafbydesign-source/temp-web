"use client";

import { useEffect, useState } from "react";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import NewsletterModal from "@/components/home/NewsletterModal";
import CompactHomeSection, { compactHomepageCss, type HomeTile } from "@/components/home/CompactHomeSection";

type Beat = { id: string; title: string; genre?: string; bpm?: number; artworkUrl?: string };
type MusicRelease = { id: string; releaseId: string; title: string; artist: string; coverUrl?: string };
type ClothingProduct = { id: string; name: string; price: number; imageUrl?: string; imageUrls?: string[] };
type SocialPost = {
  id: string; platform: string; handle?: string; channelHandle?: string;
  headline?: string; content?: string; url: string; imageUrl?: string;
  timestamp?: string; date?: string; publishedAt?: string;
};

const categories: HomeTile[] = [
  { id: "explore-beats", title: "Beats", subtitle: "Beats, licences and production", href: "/beats", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_BEATS_BUTTON_sxnwgt.png", insetImage: true },
  { id: "explore-music", title: "Music", subtitle: "Albums, singles and releases", href: "/music", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162688/HOMEPAGE_MUSIC_BUTTON_o3jqp9.png", insetImage: true },
  { id: "explore-clothing", title: "Clothing", subtitle: "HipHop100 clothing and merchandise", href: "/clothing", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_CLOTHING_BUTTON_azz2xr.png", insetImage: true },
  { id: "explore-design", title: "Design", subtitle: "Artwork, branding and graphics", href: "/design", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785162687/HOMEPAGE_DESIGN_BUTTON_g0jrnp.png", insetImage: true },
];

const services: HomeTile[] = [
  { id: "music-services", title: "Music Services", subtitle: "Production · Recording · Mixing · Mastering", href: "/beats/services", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784140412/Music_Services_Image_hadkro.png", insetImage: true },
  { id: "design-services", title: "Design Services", subtitle: "Branding · Artwork · Print · Digital Design", href: "/design/services", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068279/Design_Services_Image_jeaxt6.jpg", insetImage: true },
];

const about: HomeTile[] = [
  { id: "what-we-offer", title: "What We Offer", subtitle: "Our services and products", href: "/what-we-offer", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022016/WHATWEOFFER_oqbyvq.png", insetImage: true },
  { id: "how-it-works", title: "How It Works", subtitle: "Working with RAF By Design", href: "/how-it-works", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022020/About_Us_oyekxq.png", insetImage: true },
  { id: "all-about-raf", title: "All About RAF", subtitle: "The story behind the business", href: "/all-about-raf", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022025/All_About_RAF_lfb43o.png", insetImage: true },
  { id: "showcase", title: "Showcase", subtitle: "Selected work and projects", href: "/showcase", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788022211/Showcase_i2x3me.png", insetImage: true },
];

function latestPost(posts: SocialPost[], platform: string) {
  const publishedTime = (post: SocialPost) => Date.parse(post.publishedAt || "") || 0;
  return posts.filter((post) => post.platform.toUpperCase() === platform)
    .sort((a, b) => publishedTime(b) - publishedTime(a))[0];
}

function socialCard(title: string, post: SocialPost | undefined, channelUrl: string, channelHandle: string, loading: boolean): HomeTile {
  return {
    id: `latest-${title.toLowerCase()}`,
    tag: title,
    title: post?.headline || post?.content || (loading ? "Finding the latest post…" : `See the latest on ${title}`),
    subtitle: post?.handle || post?.channelHandle || channelHandle,
    href: post?.url || channelUrl,
    // Preserve the server thumbnail proxy and avoid injecting platform widgets.
    image: post?.imageUrl?.startsWith("/api/social/thumbnail?") ? post.imageUrl : undefined,
    meta: post ? `${post.timestamp || post.date || "Latest post"} · View →` : loading ? "Loading…" : "Open profile →",
    external: true,
  };
}

export default function Home() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [music, setMusic] = useState<MusicRelease[]>([]);
  const [clothing, setClothing] = useState<ClothingProduct[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [socialLoading, setSocialLoading] = useState(true);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;

    async function refresh() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const response = await fetch("/api/social", { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && !controller.signal.aborted) {
            setSocialFeed(data.filter((post: SocialPost) => !post.id.endsWith("-link")));
          }
        }
      } catch {
        // Keep previously loaded posts during a temporary network failure.
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setSocialLoading(false);
      }
    }

    void refresh();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 300000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

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
      } finally {
        setCatalogueLoading(false);
      }
    }

    loadHomepage();
  }, []);


  const socialCards: HomeTile[] = [
    socialCard("YouTube", latestPost(socialFeed, "YOUTUBE"), "https://www.youtube.com/@rafbydesign", "@rafbydesign", socialLoading),
    socialCard("Instagram", latestPost(socialFeed, "INSTAGRAM"), "https://www.instagram.com/rafbydesign", "@rafbydesign", socialLoading),
    { id: "tiktok-profile", tag: "TikTok", title: "RAF By Design on TikTok", subtitle: "@rafbydesignmusic", href: "https://www.tiktok.com/@rafbydesignmusic", image: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1791740711/RAF_TIKTOK_griscl.png", insetImage: true, meta: "Open profile →", external: true },
  ];

  return (
    <main className="home-compact min-h-screen text-white overflow-hidden pb-24 pt-24 relative" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
      backgroundAttachment: "scroll", backgroundPosition: "center top", backgroundSize: "cover",
    }}>
      <style>{compactHomepageCss}</style>
      <header className="w-full bg-black/60 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <h1 className="font-raf text-[1.9rem] leading-none sm:text-3xl md:text-5xl tracking-wide uppercase text-white">RAF BY DESIGN</h1>
          <p className="mt-3 mx-auto max-w-[300px] sm:max-w-none text-xs sm:text-sm uppercase tracking-[0.10em] sm:tracking-[0.28em] text-white/80 font-bold">One Stop Shop For All Things Art</p>
        </div>
      </header>
      <div className="w-full bg-red-600 border-b-4 border-black text-white text-xs uppercase font-black tracking-widest py-2.5 overflow-hidden whitespace-nowrap select-none relative z-10">
        <div className="inline-block animate-[marquee_25s_linear_infinite] will-change-transform">⚡ WELCOME TO RAF BY DESIGN • BEATS, MUSIC, DESIGN SERVICES AND HIPHOP100 CLOTHING • EXPLORE OUR LATEST WORK, RELEASES AND SERVICES • ⚡ WELCOME TO RAF BY DESIGN • BEATS, MUSIC, DESIGN SERVICES AND HIPHOP100 CLOTHING • EXPLORE OUR LATEST WORK, RELEASES AND SERVICES •</div>
      </div>
      <div className="home-sections">
        <CompactHomeSection id="explore" title="Explore RAF By Design" summary="Everything creative in one place." cards={categories} />
        <CompactHomeSection id="beats" title="Beats" summary="Browse our latest instrumentals." cards={beats.map((beat) => ({
          id: beat.id, title: beat.title, subtitle: beat.genre || "Production Instrumental", image: sanitizeCloudinaryUrl(beat.artworkUrl, ""), href: `/beats/${beat.id}`, tag: beat.bpm ? `${beat.bpm} BPM` : "AUDIO", meta: "View beat →",
        }))} busy={catalogueLoading} emptyText={catalogueLoading ? "Loading the latest beats…" : "Explore the beat store for available instrumentals."} />
        <CompactHomeSection id="music" title="Music Store" summary="Latest albums, singles and releases." cards={music.map((release) => {
          const targetId = release.releaseId || release.id || "";
          return { id: release.id || targetId, title: release.title || "Untitled", subtitle: release.artist || "RAF By Design", image: sanitizeCloudinaryUrl(release.coverUrl, ""), href: targetId ? `/music/${targetId}` : "/music", tag: "RELEASE", meta: "View release →" };
        })} busy={catalogueLoading} emptyText={catalogueLoading ? "Loading the latest releases…" : "Explore the music store for available releases."} />
        <CompactHomeSection id="clothing" title="HipHop100 Clothing" summary="Clothing and merchandise from HipHop100." cards={clothing.map((item) => ({
          id: item.id, title: item.name, subtitle: `£${Number(item.price).toFixed(2)}`, image: sanitizeCloudinaryUrl(item.imageUrl || item.imageUrls?.[0], ""), href: `/clothing/${item.id}`, tag: "CLOTHING", meta: "View item →",
        }))} busy={catalogueLoading} emptyText={catalogueLoading ? "Loading the latest clothing…" : "Explore the clothing store for available products."} />
        <CompactHomeSection id="services" title="Browse Services" summary="Music production and graphic design." cards={services} columns={2} />
        <CompactHomeSection id="about" title="All About RAF" summary="Our story, services and selected work." cards={about} />
        <CompactHomeSection id="social" title="RAF Social Feed" summary="Latest YouTube and Instagram posts, plus TikTok." cards={socialCards} columns={3} busy={socialLoading} />
      </div>
      <NewsletterModal />
    </main>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { sanitizeCloudinaryUrl } from "@/lib/utils";
import FadeIn from "@/components/FadeIn";

function SafeImage({ src, alt, className = "", ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-black flex items-center justify-center p-4 text-center border-2 border-emerald-600/40">
        <p className="text-sm text-zinc-300 line-clamp-2 font-mono">{alt}</p>
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

type Track = {
  id: string;
  title: string;
  artist?: string;
  albumTitle?: string;
  duration?: string;
  price?: number; // Unique individual track price
  coverUrl?: string;
  plays?: number;
  type?: "standard" | "remix" | "instrumental" | "acapella";
  isLiked?: boolean;
  isrc?: string;
  fileUrl?: string;
  audioUrl?: string;
  sellIndividually?: boolean;
  releaseId?: string;
  releaseDate?: string;
  genre?: string;
};

type MusicRelease = {
  id: string;
  releaseId?: string;
  title: string;
  artist: string;
  genre?: string;
  type?: "album" | "ep" | "single" | "mixtape" | "compilation" | "project";
  releaseDate?: string;
  price?: number;
  coverUrl?: string;
  badge?: string;
  featured?: boolean;
  tracks?: Track[];
  songs?: Track[];
};

const FALLBACK_RELEASES: MusicRelease[] = [
  {
    id: "m1",
    releaseId: "rel-01",
    title: "NEON SYNTHESIS VOL. 1",
    artist: "RAF & THE SOUND ENGINE",
    genre: "Hip-Hop / Synthwave",
    type: "project",
    releaseDate: "2026",
    price: 9.99,
    badge: "FEATURED ALBUM",
    coverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068288/hero-products_cmtloa.jpg",
    tracks: [
      { id: "t1", title: "Midnight Frequency", duration: "2:45", price: 1.29, plays: 12400, type: "standard" },
      { id: "t2", title: "Red Line Overdrive (VIP Remix)", duration: "3:30", price: 1.49, plays: 9800, type: "remix" },
      { id: "t3", title: "Studio Basement Session (Instrumental)", duration: "4:12", price: 0.99, plays: 15100, type: "instrumental" },
      { id: "t4", title: "Analog Horizon (Acapella)", duration: "3:58", price: 1.99, plays: 7200, type: "acapella" },
    ],
  },
  {
    id: "m2",
    releaseId: "rel-02",
    title: "DARK TAPE INSTRUMENTALS",
    artist: "RAF BEAT MATRIX",
    genre: "Trap / Underground",
    type: "project",
    releaseDate: "2026",
    price: 12.49,
    badge: "TOP CHARTS #1",
    coverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068289/hero-tour_lpvwhy.jpg",
    tracks: [
      { id: "t5", title: "808 Warfare", duration: "3:10", price: 1.49, plays: 22100, type: "standard" },
      { id: "t6", title: "Grid Lock Bounce (Instrumental)", duration: "2:55", price: 1.19, plays: 18400, type: "instrumental" },
    ],
  },
  {
    id: "m3",
    releaseId: "rel-03",
    title: "LO-FI CHRONICLES: CHAPTER II",
    artist: "STUDIO VIBES",
    genre: "Lo-Fi / Chill",
    type: "single",
    releaseDate: "2026",
    price: 7.99,
    badge: "NEW SINGLE",
    coverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068288/hero-about_vxgidx.jpg",
    tracks: [
      { id: "t7", title: "Rainy Vinyl Groove", duration: "2:15", price: 0.99, plays: 31000, type: "standard" },
      { id: "t7-remix", title: "Rainy Vinyl Groove (Nightowl Remix)", duration: "2:40", price: 1.29, plays: 11000, type: "remix" },
    ],
  },
  {
    id: "m4",
    releaseId: "rel-04",
    title: "BOOM BAP ARCHIVES 1998",
    artist: "RAF CLASSIC",
    genre: "Classic Hip-Hop",
    type: "project",
    releaseDate: "2025",
    price: 10.99,
    badge: "ESSENTIAL",
    coverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784140412/Music_Services_Image_hadkro.png",
    tracks: [
      { id: "t8", title: "Concrete Jungle Echoes", duration: "3:40", price: 1.29, plays: 8900, type: "standard" },
      { id: "t8-acap", title: "Concrete Jungle Echoes (Studio Vocal Stems)", duration: "3:20", price: 1.79, plays: 4100, type: "acapella" },
    ],
  },
  {
    id: "m5",
    releaseId: "rel-05",
    title: "ASTRAL WAVES PROJECT",
    artist: "RAF & GUESTS",
    genre: "Ambient / Trap",
    type: "project",
    releaseDate: "2026",
    price: 11.99,
    badge: "NEW DROP",
    coverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068288/hero-products_cmtloa.jpg",
    tracks: [
      { id: "t9", title: "Starlight Drift", duration: "3:15", price: 1.39, plays: 14200, type: "standard" },
    ],
  },
];

// Priority score logic: Standard (1) > Remixes (2) > Instrumentals (3) > Acapellas (4)
function getTrackPriorityScore(track: Track): number {
  const title = (track.title || "").toLowerCase();
  if (track.type === "acapella" || title.includes("acapella") || title.includes("stem") || title.includes("vocal")) return 4;
  if (track.type === "instrumental" || title.includes("instrumental") || title.includes("inst")) return 3;
  if (track.type === "remix" || title.includes("remix") || title.includes("flip") || title.includes("vip")) return 2;
  return 1;
}

function normaliseTrackMetadata(value?: string | number | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getReleaseDateScore(value?: string): number {
  if (!value) return 0;

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;

  const year = Number(value);
  if (!Number.isNaN(year) && year > 0) {
    return new Date(year, 0, 1).getTime();
  }

  return 0;
}

function getTrackDeduplicationKey(track: Track): string {
  const title = normaliseTrackMetadata(track.title);
  const artist = normaliseTrackMetadata(track.artist);
  const isrc = normaliseTrackMetadata(track.isrc);

  // ISRC is the strongest identity match when it exists.
  if (isrc) {
    return `isrc:${isrc}`;
  }

  // Otherwise compare the identifying metadata that describes the song itself,
  // deliberately excluding the project/album title so the same song appearing
  // on more than one project is only shown once.
  return [
    title,
    artist,
    normaliseTrackMetadata(track.duration),
    normaliseTrackMetadata(track.type || "standard"),
  ].join("|");
}

function buildUniqueTrackList(
  sourceReleases: MusicRelease[],
  userLikes: string[] = []
): Track[] {
  const candidates: Track[] = [];

  sourceReleases.forEach((release) => {
    const releaseTracks =
      release.tracks && release.tracks.length > 0
        ? release.tracks
        : release.songs || [];

    releaseTracks.forEach((track, index) => {
      // Only genuine individual song records belong in the track catalogue.
      // Do not manufacture "title tracks" from projects that have no song data.
      if (!track?.title) return;
      if (track.sellIndividually === false) return;

      const defaultTrackPrice = Number((1.29 + index * 0.15).toFixed(2));

      candidates.push({
        ...track,
        artist: track.artist || release.artist,
        albumTitle: release.title,
        releaseId: release.releaseId || release.id,
        releaseDate: release.releaseDate,
        genre: release.genre,
        coverUrl: track.coverUrl || release.coverUrl,
        fileUrl: track.fileUrl || track.audioUrl,
        audioUrl: track.audioUrl || track.fileUrl,
        price:
          track.price !== undefined && track.price !== null
            ? Number(track.price)
            : defaultTrackPrice,
        plays: track.plays,
        isLiked: userLikes.includes(track.id),
      });
    });
  });

  const uniqueTracks = new Map<string, Track>();

  candidates.forEach((track) => {
    const key = getTrackDeduplicationKey(track);
    const existing = uniqueTracks.get(key);

    if (!existing) {
      uniqueTracks.set(key, track);
      return;
    }

    // If the duplicate exists on more than one project, keep the copy attached
    // to the newest release so its artwork/link context stays current.
    if (
      getReleaseDateScore(track.releaseDate) >
      getReleaseDateScore(existing.releaseDate)
    ) {
      uniqueTracks.set(key, track);
    }
  });

  return Array.from(uniqueTracks.values()).sort((a, b) => {
    const dateDifference =
      getReleaseDateScore(b.releaseDate) - getReleaseDateScore(a.releaseDate);

    if (dateDifference !== 0) return dateDifference;

    return getTrackPriorityScore(a) - getTrackPriorityScore(b);
  });
}

export default function MusicPage() {
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(25);
  const [activeTrackPlaying, setActiveTrackPlaying] = useState<string | null>(null);

  // Simulated User Session for recommendations (if logged in)
  const [userLikes] = useState<string[]>(["t1", "t5", "t7"]);
  const [isLoggedIn] = useState<boolean>(true);

  // Pagination offsets for center rows (4 per page)
  const [recentOffset, setRecentOffset] = useState(0);
  const [projectOffset, setProjectOffset] = useState(0);
  const [trackOffset, setTrackOffset] = useState(0);

  // View More toggles
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  useEffect(() => {
    async function fetchMusicStore() {
      try {
        const res = await fetch("/api/music/release");
        if (res.ok) {
          const data = await res.json();
          const parsed = Array.isArray(data) ? data : data.releases || data.data || [];
          setReleases(parsed.length > 0 ? parsed : FALLBACK_RELEASES);
        } else {
          setReleases(FALLBACK_RELEASES);
        }
      } catch (err) {
        console.error("Music storefront fetch error:", err);
        setReleases(FALLBACK_RELEASES);
      }
    }
    fetchMusicStore();
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    releases.forEach((r) => r.genre && set.add(r.genre.split("/")[0].trim()));
    return ["ALL", ...Array.from(set)];
  }, [releases]);

  // Global search & sidebar filter logic
  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      const releaseTracks =
        r.tracks && r.tracks.length > 0 ? r.tracks : r.songs || [];

      const matchesTrackSearch = releaseTracks.some((track) => {
        const q = searchQuery.toLowerCase();

        return (
          track.title?.toLowerCase().includes(q) ||
          track.artist?.toLowerCase().includes(q) ||
          track.isrc?.toLowerCase().includes(q)
        );
      });

      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.genre && r.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
        matchesTrackSearch;

      const matchesGenre =
        selectedGenre === "ALL" || r.genre?.toLowerCase().includes(selectedGenre.toLowerCase());

      const matchesType =
        selectedType === "ALL" ||
        (selectedType === "projects" && (r.type === "project" || r.type === "album" || !r.type)) ||
        (selectedType === "singles" && r.type === "single");

      const matchesPrice = (r.price || 0) <= maxPrice;

      return matchesSearch && matchesGenre && matchesType && matchesPrice;
    });
  }, [releases, searchQuery, selectedGenre, selectedType, maxPrice]);

  // PROJECTS List
  const projectList = useMemo(() => {
    const projs = filteredReleases.filter((r) => r.type !== "single");
    return projs.length > 0 ? projs : filteredReleases;
  }, [filteredReleases]);

  // Build a real individual-song catalogue from release tracklists.
  // Duplicate appearances of the same song across different projects are removed.
  const allIndividualTracks = useMemo(() => {
    return buildUniqueTrackList(releases, userLikes);
  }, [releases, userLikes]);

  const extractedTracks = useMemo(() => {
    const uniqueTracks = buildUniqueTrackList(filteredReleases, userLikes);

    return [...uniqueTracks].sort((a, b) => {
      if (isLoggedIn) {
        if (a.isLiked && !b.isLiked) return -1;
        if (!a.isLiked && b.isLiked) return 1;
      }

      const dateDifference =
        getReleaseDateScore(b.releaseDate) - getReleaseDateScore(a.releaseDate);

      if (dateDifference !== 0) return dateDifference;

      return getTrackPriorityScore(a) - getTrackPriorityScore(b);
    });
  }, [filteredReleases, userLikes, isLoggedIn]);

  // No sales/play ranking is claimed until real statistics exist.
  // The right sidebar simply shows unique individual songs from the catalogue.
  const sidebarIndividualTracks = useMemo(() => {
    return extractedTracks.slice(0, 6);
  }, [extractedTracks]);

  // Featured banner = a PROJECT/RELEASE, never an individual song.
  // Once Music Admin stores `featured: true`, that choice wins.
  // Until then, the newest non-single release is used automatically.
  const featuredRelease = useMemo(() => {
    const projects = releases.filter(
      (release) =>
        release.type === "album" ||
        release.type === "ep" ||
        release.type === "mixtape" ||
        release.type === "compilation" ||
        release.type === "project" ||
        !release.type
    );

    const explicitlyFeatured = projects.find((release) => release.featured);

    if (explicitlyFeatured) {
      return explicitlyFeatured;
    }

    return [...projects].sort(
      (a, b) =>
        getReleaseDateScore(b.releaseDate) -
        getReleaseDateScore(a.releaseDate)
    )[0] || null;
  }, [releases]);

  // Navigation handlers for row pagination (4 items step)
  const handleNext = (currentOffset: number, setOffset: (val: number) => void, totalLength: number, step = 4) => {
    if (currentOffset + step < totalLength) {
      setOffset(currentOffset + step);
    }
  };

  const handlePrev = (currentOffset: number, setOffset: (val: number) => void, step = 4) => {
    if (currentOffset - step >= 0) {
      setOffset(currentOffset - step);
    }
  };

  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-24 pt-20 relative font-mono"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068302/WEBSITE_BACKGROUND_GREEN_brf8gl.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      {/* 1. HEADER */}
      <header className="w-full bg-black/80 border-b-4 border-black backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8 text-center">
          <h1 className="font-raf text-4xl md:text-6xl tracking-wider uppercase text-white">
            RAF MUSIC STORE
          </h1>
          <p className="mt-3 text-[10px] sm:text-xs md:text-sm text-white/80 font-bold">
            Browse RAF By Design releases, projects and individual tracks, with featured music and catalogue search.
          </p>
        </div>
      </header>

      {/* 2. SEARCH BAR SECTION */}
      <div className="w-full bg-black/90 border-b-4 border-black sticky top-16 z-30 backdrop-blur-md py-4">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="SEARCH ALBUMS, PROJECTS, ARTISTS, OR TRACKS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-emerald-500/60 text-white placeholder-zinc-400 px-10 py-3 rounded-lg text-sm font-bold uppercase focus:outline-none focus:border-emerald-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
            <span className="absolute left-3.5 top-3.5 text-emerald-400 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-zinc-300 hover:text-white text-sm font-black uppercase bg-zinc-800 px-2 py-0.5 rounded"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FEATURED PROJECT / RELEASE BANNER */}
      {featuredRelease && (
        <section className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 pt-6 relative z-10">
          <Link
            href={`/music/${featuredRelease.releaseId || featuredRelease.id}`}
            className="group flex md:grid md:grid-cols-[220px_1fr] overflow-hidden bg-black/85 backdrop-blur-md border-2 md:border-4 border-black rounded-xl md:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-emerald-500 transition-all min-h-[138px] md:min-h-0"
          >
            <div className="w-[38%] aspect-square flex-shrink-0 bg-zinc-950 border-r-2 md:w-[220px] md:h-[220px] md:border-r-4 border-black overflow-hidden">
              <SafeImage
                src={sanitizeCloudinaryUrl(featuredRelease.coverUrl, "")}
                alt={featuredRelease.title}
                className="group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-2.5 sm:p-4 md:p-8 flex flex-col justify-center min-w-0">
              <h2 className="font-raf text-xs sm:text-xl md:text-3xl uppercase tracking-wide text-emerald-400 border-b border-zinc-800 md:border-b-2 pb-1 sm:pb-2 md:pb-3 mb-1.5 sm:mb-3 md:mb-4">
                Featured Release
              </h2>

              <h3 className="font-raf text-sm sm:text-2xl md:text-5xl text-white uppercase group-hover:text-emerald-400 transition-colors line-clamp-2">
                {featuredRelease.title}
              </h3>

              <p className="text-[9px] sm:text-xs md:text-sm text-zinc-300 font-bold mt-1 sm:mt-2 line-clamp-1">
                {featuredRelease.artist}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-2 sm:mt-4 md:mt-5">
                <span className="text-emerald-400 font-black text-xs sm:text-base md:text-lg">
                  £{(featuredRelease.price || 0).toFixed(2)}
                </span>

                <span className="bg-zinc-900 group-hover:bg-emerald-500 group-hover:text-black text-emerald-400 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md md:rounded-lg border border-black md:border-2 font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase transition-colors">
                  VIEW RELEASE →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* EXPANDED DESKTOP CONTAINER: MAX-W-[1800PX] */}
      <div className="max-w-[1800px] mx-auto px-2.5 sm:px-4 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 relative z-10">

        {/* 3. LEFT FILTER SIDEBAR */}
        <aside className="order-3 lg:order-1 lg:col-span-3 xl:col-span-2 space-y-3 lg:space-y-6">
          <div className="bg-black/85 backdrop-blur-md border-2 lg:border-4 border-black p-3 lg:p-5 rounded-xl lg:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between gap-2 lg:gap-4 border-b border-zinc-800 lg:border-b-2 pb-2 lg:pb-3">
              <h3 className="font-raf text-sm lg:text-xl text-emerald-400 uppercase tracking-wide">
                FILTER MUSIC
              </h3>
              <button
                onClick={() => {
                  setSelectedGenre("ALL");
                  setSelectedType("ALL");
                  setMaxPrice(25);
                  setSearchQuery("");
                }}
                className="text-[9px] lg:text-xs text-zinc-300 hover:text-emerald-400 uppercase font-black underline"
              >
                RESET
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-[10px] lg:text-sm font-black text-white uppercase block">
                RELEASE TYPE
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "ALL", label: "ALL" },
                  { id: "projects", label: "PROJECTS" },
                  { id: "singles", label: "SINGLES" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`py-1 px-1 text-[9px] lg:py-1.5 lg:text-xs font-black uppercase rounded border border-black transition-all ${
                      selectedType === type.id
                        ? "bg-emerald-500 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-zinc-900 text-zinc-300 hover:bg-emerald-950 hover:text-emerald-300"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="space-y-2">
              <label className="text-[10px] lg:text-sm font-black text-white uppercase block">
                GENRE
              </label>
              <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible lg:max-h-48 lg:overflow-y-auto pr-1 pb-1 lg:pb-0">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`shrink-0 lg:w-full text-left px-2 lg:px-3 py-1 lg:py-1.5 rounded text-[9px] lg:text-xs font-bold uppercase border border-black transition-all flex items-center justify-between gap-2 ${
                      selectedGenre === g
                        ? "bg-emerald-500 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span>{g}</span>
                    {selectedGenre === g && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-1.5 lg:space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between items-center text-[9px] lg:text-xs font-bold">
                <span className="text-zinc-300 uppercase">MAX PRICE</span>
                <span className="text-emerald-400 font-black">£{maxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* 5. CENTER CONTENT AREA */}
        <section className="order-1 lg:order-2 lg:col-span-5 xl:col-span-7 space-y-5 lg:space-y-10">

          {/* ROW A: RECENTLY ADDED */}
          <FadeIn>
            <div className="bg-black/85 backdrop-blur-md border-2 sm:border-4 border-black p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 sm:space-y-5">
              <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800 sm:border-b-2 pb-2 sm:pb-3">
                <h3 className="font-raf text-base sm:text-2xl uppercase tracking-wide text-emerald-400">
                  RECENTLY ADDED
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrev(recentOffset, setRecentOffset, 4)}
                    disabled={recentOffset === 0}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleNext(recentOffset, setRecentOffset, filteredReleases.length, 4)}
                    disabled={recentOffset + 4 >= filteredReleases.length}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setShowAllRecent(!showAllRecent)}
                    className="hidden sm:block px-3 py-1 bg-emerald-500 text-black text-xs font-black uppercase rounded border border-black hover:bg-emerald-400 ml-1"
                  >
                    {showAllRecent ? "Collapse" : "View More"}
                  </button>
                </div>
              </div>

              <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory sm:snap-none">
                {(showAllRecent
                  ? filteredReleases
                  : filteredReleases.slice(recentOffset, recentOffset + 4)
                ).map((release) => (
                  <div
                    key={release.id}
                    className="group min-w-[190px] w-[190px] sm:min-w-0 sm:w-auto snap-start bg-zinc-950 rounded-lg sm:rounded-xl border border-zinc-800 sm:border-2 hover:border-emerald-500 transition-all flex flex-col justify-between overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div>
                      <div className="aspect-square relative border-b-2 border-black overflow-hidden">
                        <SafeImage
                          src={sanitizeCloudinaryUrl(release.coverUrl, "")}
                          alt={release.title}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                        {release.badge && (
                          <span className="absolute top-2 left-2 bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {release.badge}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 bg-black/90 text-emerald-400 font-black text-xs px-2 py-1 rounded border border-black">
                          £{(release.price || 9.99).toFixed(2)}
                        </span>
                      </div>

                      <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1">
                        <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                          {release.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-300 line-clamp-1">{release.artist}</p>
                        {release.genre && (
                          <span className="inline-block text-[9px] sm:text-xs text-emerald-400 uppercase font-black tracking-wider">
                            {release.genre}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 pt-0 sm:p-3 sm:pt-0">
                      <Link
                        href={`/music/${release.releaseId || release.id}`}
                        className="w-full py-1.5 sm:py-2 bg-zinc-900 hover:bg-emerald-500 text-emerald-400 hover:text-black text-center text-[10px] sm:text-xs font-black uppercase rounded-md sm:rounded-lg border border-black sm:border-2 transition-all block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ROW B: PROJECTS */}
          <FadeIn>
            <div className="bg-black/85 backdrop-blur-md border-2 sm:border-4 border-black p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800 sm:border-b-2 pb-2 sm:pb-3">
                <h3 className="font-raf text-base sm:text-2xl uppercase tracking-wide text-emerald-400">
                  PROJECTS
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrev(projectOffset, setProjectOffset, 4)}
                    disabled={projectOffset === 0}
                    className="px-2 py-0.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleNext(projectOffset, setProjectOffset, projectList.length, 4)}
                    disabled={projectOffset + 4 >= projectList.length}
                    className="px-2 py-0.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="hidden sm:block px-2.5 py-1 bg-emerald-500 text-black text-xs font-black uppercase rounded border border-black hover:bg-emerald-400 ml-1"
                  >
                    {showAllProjects ? "Collapse" : "View More"}
                  </button>
                </div>
              </div>

              <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory sm:snap-none">
                {(showAllProjects
                  ? projectList
                  : projectList.slice(projectOffset, projectOffset + 4)
                ).map((release) => (
                  <div
                    key={release.id}
                    className="group min-w-[190px] w-[190px] sm:min-w-0 sm:w-auto snap-start bg-zinc-950 rounded-lg sm:rounded-xl border border-black sm:border-2 overflow-hidden hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square relative border-b border-black">
                        <SafeImage
                          src={sanitizeCloudinaryUrl(release.coverUrl, "")}
                          alt={release.title}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/90 text-emerald-400 font-black text-[10px] px-1.5 py-0.5 rounded border border-black">
                          £{(release.price || 9.99).toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 space-y-0.5">
                        <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1 group-hover:text-emerald-400">
                          {release.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1">{release.artist}</p>
                      </div>
                    </div>
                    <div className="p-2 pt-0 sm:p-2.5 sm:pt-0">
                      <Link
                        href={`/music/${release.releaseId || release.id}`}
                        className="w-full py-1 sm:py-1.5 bg-zinc-900 hover:bg-emerald-500 text-emerald-400 hover:text-black text-center text-[10px] sm:text-xs font-black uppercase rounded border border-black block"
                      >
                        OPEN
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ROW C: INDIVIDUAL TRACKS */}
          <FadeIn>
            <div className="bg-black/85 backdrop-blur-md border-2 sm:border-4 border-black p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800 sm:border-b-2 pb-2 sm:pb-3">
                <div>
                  <h3 className="font-raf text-base sm:text-2xl uppercase tracking-wide text-emerald-400">
                    INDIVIDUAL TRACKS
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrev(trackOffset, setTrackOffset, 4)}
                    disabled={trackOffset === 0}
                    className="px-2 py-0.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleNext(trackOffset, setTrackOffset, extractedTracks.length, 4)}
                    disabled={trackOffset + 4 >= extractedTracks.length}
                    className="px-2 py-0.5 sm:py-1 bg-zinc-900 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-black rounded text-[10px] sm:text-xs font-black disabled:opacity-30"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setShowAllTracks(!showAllTracks)}
                    className="hidden sm:block px-2.5 py-1 bg-emerald-500 text-black text-xs font-black uppercase rounded border border-black hover:bg-emerald-400 ml-1"
                  >
                    {showAllTracks ? "Collapse" : "View More"}
                  </button>
                </div>
              </div>

              <div className="flex sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory sm:snap-none">
                {(showAllTracks
                  ? extractedTracks
                  : extractedTracks.slice(trackOffset, trackOffset + 4)
                ).map((track) => (
                  <div
                    key={track.id}
                    className="group min-w-[190px] w-[190px] sm:min-w-0 sm:w-auto snap-start bg-zinc-950 rounded-lg sm:rounded-xl border border-black sm:border-2 overflow-hidden hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square relative border-b border-black">
                        <SafeImage
                          src={sanitizeCloudinaryUrl(track.coverUrl, "")}
                          alt={track.title}
                        />
                        <button
                          onClick={() =>
                            setActiveTrackPlaying(activeTrackPlaying === track.id ? null : track.id)
                          }
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-emerald-400 text-3xl font-bold"
                        >
                          {activeTrackPlaying === track.id ? "⏸" : "▶"}
                        </button>
                        {/* Displays the individual track's distinct price */}
                        <span className="absolute bottom-1 right-1 bg-black/90 text-emerald-400 font-black text-[10px] px-1.5 py-0.5 rounded border border-black">
                          £{(track.price || 1.29).toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 space-y-0.5">
                        <h4 className="font-black text-xs sm:text-sm text-white line-clamp-1 group-hover:text-emerald-400">
                          {track.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1">{track.artist}</p>
                      </div>
                    </div>
                    <div className="p-2 pt-0 sm:p-2.5 sm:pt-0">
                      <button className="w-full py-1 sm:py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-center text-[10px] sm:text-xs font-black uppercase rounded border border-black block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        BUY SONG (£{(track.price || 1.29).toFixed(2)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </section>

        {/* 4. RIGHT SIDEBAR: UNIQUE INDIVIDUAL SONGS */}
        <aside className="hidden lg:block lg:order-3 lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-black/85 backdrop-blur-md border-2 lg:border-4 border-black p-3 lg:p-5 rounded-xl lg:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3 lg:space-y-4">
            <div className="border-b-2 border-zinc-800 pb-3">
              <div className="text-center">
                <h3 className="font-raf text-base lg:text-xl text-emerald-400 uppercase tracking-wide">
                  INDIVIDUAL TRACKS
                </h3>
              </div>
            </div>

            {sidebarIndividualTracks.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-sm text-zinc-300 font-bold uppercase">
                  No individual track data available yet.
                </p>
              </div>
            ) : (
              <div className="flex lg:block gap-2.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 space-y-0 lg:space-y-2.5 snap-x snap-mandatory lg:snap-none">
                {sidebarIndividualTracks.map((track) => (
                  <div
                    key={`${track.id}-${track.releaseId || ""}`}
                    className="group min-w-[220px] lg:min-w-0 snap-start bg-zinc-950 p-1.5 lg:p-2 rounded-lg lg:rounded-xl border border-zinc-800 hover:border-emerald-500 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <div className="w-9 h-9 lg:w-11 lg:h-11 rounded border border-black overflow-hidden flex-shrink-0 relative">
                        <SafeImage
                          src={sanitizeCloudinaryUrl(track.coverUrl, "")}
                          alt={track.title}
                        />

                        <button
                          onClick={() =>
                            setActiveTrackPlaying(
                              activeTrackPlaying === track.id ? null : track.id
                            )
                          }
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-emerald-400 text-xs"
                        >
                          {activeTrackPlaying === track.id ? "⏸" : "▶"}
                        </button>
                      </div>

                      <div className="overflow-hidden min-w-0">
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-emerald-400">
                          {track.title}
                        </h4>

                        <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1">
                          {track.artist}
                        </p>

                        {track.albumTitle && (
                          <p className="text-xs text-zinc-400 line-clamp-1 uppercase mt-1">
                            From {track.albumTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="block text-xs text-emerald-400 font-black">
                        £{(track.price || 1.29).toFixed(2)}
                      </span>

                      {track.releaseId ? (
                        <Link
                          href={`/music/${track.releaseId}`}
                          className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-black hover:bg-emerald-400 font-black text-xs uppercase rounded border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                          VIEW
                        </Link>
                      ) : (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-500 font-black text-xs uppercase rounded border border-black">
                          TRACK
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>
    </main>
  );
}
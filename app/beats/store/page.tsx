"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAudioStore, Track } from "@/lib/audioStore";
import {
  Play,
  Pause,
  Music,
  Download,
  Search,
  RotateCcw,
  ExternalLink,
  Filter,
  CheckCircle2,
  X,
  Eye
} from "lucide-react";
// ========================================================
// R2 CLOUDFLARE CONFIGURATION
// ========================================================
const R2_BASE_URL = "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev";
const getDynamicAudioUrl = (title: string): string => {
  const cleanTitle = title.trim();
  return `${R2_BASE_URL}/${encodeURIComponent(cleanTitle)}.mp3`;
};
const getDynamicArtworkUrl = (title: string, customUrl?: string | null): string => {
  if (customUrl && customUrl.trim() !== "") return customUrl;
  return "/images/mascotmonored.png";
};
// ========================================================
// CLOUDINARY .DOCX CONTRACT FILE URLS & BANNER IMAGES
// ========================================================
const LEASING_CONTRACT_DOCX = "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Lease_26_jmadfr.docx";
const EXCLUSIVE_CONTRACT_DOCX = "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Exclu_26_jeufuz.docx";
// Primary Unversioned URLs
const LEASING_BANNER_IMG = "https://res.cloudinary.com/dcrkpsnn9/image/upload/Leasing_yyc6oc.png";
const EXCLUSIVE_BANNER_IMG = "https://res.cloudinary.com/dcrkpsnn9/image/upload/Exclusive_itamrd.png";
const getOfficeViewerUrl = (url: string) => `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
// ========================================================
// RESILIENT BANNER IMAGE COMPONENT WITH AUTO-FALLBACK
// ========================================================
function LicenseBannerImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const handleError = () => {
    // If unversioned fails, try versioned URL fallback before showing text card
    if (!imgSrc.includes("v1784068")) {
      if (title.toLowerCase().includes("lease")) {
        setImgSrc("https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068291/Leasing_yyc6oc.png");
      } else {
        setImgSrc("https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068287/Exclusive_itamrd.png");
      }
    } else {
      setHasError(true);
    }
  };
  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-red-950/40 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed border-red-600/40 rounded-lg">
        <span className="text-red-500 font-raf text-lg uppercase tracking-wider mb-1">
          {title}
        </span>
        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
          [License Terms & Conditions]
        </span>
      </div>
    );
  }
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover/img:scale-105"
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}
// ========================================================
// SAFE IMAGE COMPONENT FOR BEATS
// ========================================================
function SafeImage({ src, alt, ...props }: any) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center border-b-4 border-black">
        <span className="text-red-500 text-[10px] font-mono uppercase tracking-widest mb-1 font-black">
          RAF MEDIA PENDING
        </span>
        <p className="text-[9px] text-zinc-500 line-clamp-2 px-2 italic font-mono">{alt}</p>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      className={`${props.className || "object-cover"} w-full h-full`}
      loading="lazy"
    />
  );
}
type Beat = {
  id: string;
  title: string;
  genre: string;
  bpm?: number | null;
  key?: string | null;
  artworkUrl?: string | null;
  frontCoverUrl?: string | null;
  backCoverUrl?: string | null;
  backgroundUrl?: string | null;
  audioUrl?: string | null;
  price?: number | null;
  plays?: number;
  tags?: string[] | string | null;
};
// ========================================================
// ENGINE FALLBACK TRACKS
// ========================================================
const FALLBACK_BEATS: Beat[] = [
  {
    id: "fallback-1",
    title: "Vanguard Studio Track",
    genre: "Hip Hop",
    bpm: 94,
    key: "D Minor",
    artworkUrl: "/images/mascotmonored.png",
    frontCoverUrl: "/images/mascotmonored.png",
    backCoverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    price: 29.99,
    plays: 4210
  },
  {
    id: "fallback-2",
    title: "Redline Instrumental",
    genre: "Trap",
    bpm: 140,
    key: "G Major",
    artworkUrl: "/images/mascotmonored.png",
    frontCoverUrl: "/images/mascotmonored.png",
    backCoverUrl: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    price: 34.99,
    plays: 8930
  },
  {
    id: "fallback-3",
    title: "Apex Horizon",
    genre: "Boom Bap",
    bpm: 88,
    key: "A Minor",
    artworkUrl: "/images/mascotmonored.png",
    frontCoverUrl: "/images/mascotmonored.png",
    backCoverUrl: null,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    price: 24.99,
    plays: 3120
  },
  {
    id: "fallback-4",
    title: "Cybernetic Drift",
    genre: "Drill",
    bpm: 142,
    key: "C Minor",
    artworkUrl: "/images/mascotmonored.png",
    frontCoverUrl: "/images/mascotmonored.png",
    backCoverUrl: null,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    price: 39.99,
    plays: 6540
  }
];
export default function BeatStorePage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  // SEARCH & FILTER PARAMETERS
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [keyFilter, setKeyFilter] = useState("All");
  const [maxBpm, setMaxBpm] = useState<number>(180);
  const [sortBy, setSortBy] = useState<string>("newest");
  // LIGHTBOX MODAL FOR CONTRACT IMAGES
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const playTrack = useAudioStore((state) => state.playTrack);
  const playing = useAudioStore((state) => state.playing);
  const setPlaying = useAudioStore((state) => state.setPlaying);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const currentTrack = queue[currentIndex];
  useEffect(() => {
    async function fetchBeats() {
      try {
        const res = await fetch("/api/beats");
        if (!res.ok) throw new Error("Failed to fetch beats");
        const data = await res.json();
        const rawBeats = Array.isArray(data)
          ? data
          : data?.beats && Array.isArray(data.beats)
          ? data.beats
          : data?.data && Array.isArray(data.data)
          ? data.data
          : null;
        if (rawBeats && rawBeats.length > 0) {
          const normalizedData = rawBeats.map((beat: any, idx: number) => ({
            ...beat,
            frontCoverUrl: beat.frontCoverUrl || beat.artworkUrl,
            backCoverUrl: beat.backCoverUrl || null,
            backgroundUrl: beat.backgroundUrl || beat.backCoverUrl || null,
            artworkUrl: getDynamicArtworkUrl(beat.title, beat.frontCoverUrl || beat.artworkUrl),
            audioUrl: beat.audioUrl && beat.audioUrl.trim() !== "" ? beat.audioUrl : getDynamicAudioUrl(beat.title),
            tags: Array.isArray(beat.tags)
              ? beat.tags
              : typeof beat.tags === "string"
              ? beat.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
              : typeof beat.tag === "string" && beat.tag.trim()
              ? [beat.tag.trim()]
              : [],
            plays: beat.plays || Math.floor(1200 + (idx * 840) % 7000)
          }));
          setBeats(normalizedData);
        } else {
          setBeats(FALLBACK_BEATS);
        }
      } catch (err) {
        console.error("API Fetch Error - Initializing Fallback Catalog Layout:", err);
        setBeats(FALLBACK_BEATS);
      } finally {
        setLoading(false);
      }
    }
    fetchBeats();
  }, []);
  const genres = ["All", ...Array.from(new Set(beats.map((beat) => beat.genre).filter(Boolean)))];
  const tags = [
    "All",
    ...Array.from(
      new Set(
        beats.flatMap((beat) =>
          Array.isArray(beat.tags)
            ? beat.tags
            : typeof beat.tags === "string"
            ? beat.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : []
        )
      )
    ),
  ];
  const keys = [
    "All",
    ...Array.from(
      new Set(
        beats
          .map((beat) => beat.key)
          .filter(
            (key): key is string =>
              typeof key === "string" && key.trim().length > 0
          )
      )
    ),
  ];
  // MULTI-PARAMETER FILTER & SORT ENGINE
  const filteredBeats = useMemo(() => {
    let list = beats.filter((beat) => {
      const beatTags = Array.isArray(beat.tags)
        ? beat.tags
        : typeof beat.tags === "string"
        ? beat.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        beat.title.toLowerCase().includes(searchTerm) ||
        (beat.genre || "").toLowerCase().includes(searchTerm) ||
        (beat.key || "").toLowerCase().includes(searchTerm) ||
        beatTags.some((tag) => tag.toLowerCase().includes(searchTerm));
      const matchesGenre = genreFilter === "All" || beat.genre === genreFilter;
      const matchesTag = tagFilter === "All" || beatTags.includes(tagFilter);
      const matchesKey = keyFilter === "All" || beat.key === keyFilter;
      const matchesBpm = !beat.bpm || beat.bpm <= maxBpm;
      return matchesSearch && matchesGenre && matchesTag && matchesKey && matchesBpm;
    });
    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "bpm-high") {
      list.sort((a, b) => (b.bpm || 0) - (a.bpm || 0));
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    }
    return list;
  }, [beats, search, genreFilter, tagFilter, keyFilter, maxBpm, sortBy]);
  const handlePlayToggle = (beat: Beat) => {
    if (!beat.audioUrl) return;
    const isCurrentTrack = currentTrack?.id === beat.id || currentTrack?.url === beat.audioUrl;
    if (isCurrentTrack) {
      setPlaying(!playing);
    } else {
      const trackPayload: Track = {
        id: beat.id,
        title: beat.title,
        subtitle: `${beat.bpm || 140} BPM â¢ ${beat.key || "C Minor"} â¢ ${beat.genre}`,
        url: beat.audioUrl,
        artwork: beat.frontCoverUrl || beat.artworkUrl || "/images/mascotmonored.png",
        type: "beat"
      };
      playTrack(trackPayload);
    }
  };
  const handleResetFilters = () => {
    setSearch("");
    setGenreFilter("All");
    setTagFilter("All");
    setKeyFilter("All");
    setMaxBpm(180);
    setSortBy("newest");
  };
  return (
    <main
      className="min-h-screen text-white overflow-hidden pb-32 pt-24 relative"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      <style>
        {`
          @font-face {
            font-family: "RAF Font Demo";
            src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          .font-raf {
            font-family: "RAF Font Demo", sans-serif;
          }
          .section-title-panel {
            background-color: #4b0505;
          }
        `}
      </style>
      {/* HEADER SECTION */}
      <section className="section-title-panel w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] border-y border-red-500/30 shadow-2xl shadow-red-950/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6 text-center">
          <h1 className="font-raf text-2xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">
            Beat Store
          </h1>
        </div>
      </section>
      {/* MAIN CONTAINER */}
      <section className="w-full max-w-[1800px] mx-auto px-2.5 sm:px-4 md:px-8 space-y-4 md:space-y-8 pt-4 md:pt-8 relative z-10">
        {/* TOP SEARCH BAR & SORT HEADER */}
        <div className="w-full rounded-xl md:rounded-2xl bg-black/90 backdrop-blur-md border-2 md:border-4 border-black p-2 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY INSTRUMENTAL TITLE, KEYWORD OR TAG..."
              className="w-full rounded-lg md:rounded-xl border border-zinc-800 md:border-2 bg-zinc-950/90 pl-10 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 text-white font-mono text-[10px] md:text-xs tracking-wider placeholder-zinc-500 outline-none focus:border-red-600 transition"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[9px] md:text-[10px] font-mono font-bold uppercase text-zinc-400 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-52 rounded-lg md:rounded-xl border border-zinc-800 md:border-2 bg-zinc-950 px-2.5 md:px-3 py-2 md:py-3 text-white font-mono text-[10px] md:text-xs font-bold uppercase outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="newest">Latest Releases</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bpm-high">BPM: Fast First</option>
            </select>
          </div>
        </div>
        {/* VIEW LICENSES SECTION */}
        <div className="w-full rounded-xl md:rounded-2xl bg-black/85 backdrop-blur-md border-2 md:border-4 border-black p-2 md:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-2 md:mb-4 border-b border-zinc-800 md:border-b-2 pb-1.5 md:pb-3 text-center">
            <h2 className="font-raf text-sm md:text-2xl uppercase tracking-wide text-white">
              View Licenses
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
            {/* LEASING BANNER CARD */}
            <div className="p-1.5 md:p-3 rounded-lg md:rounded-xl border border-zinc-800 md:border-2 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 md:gap-4">
              <div
                onClick={() => setSelectedImageModal(LEASING_BANNER_IMG)}
                className="w-full sm:w-72 h-14 md:h-28 rounded-md md:rounded-lg overflow-hidden border border-black md:border-2 flex-shrink-0 bg-zinc-900 flex items-center justify-center p-1 md:p-2 cursor-pointer group/img relative"
              >
                <LicenseBannerImage
                  src={LEASING_BANNER_IMG}
                  alt="Leasing Rights License"
                  title="Leasing License"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-white uppercase">
                  <Eye className="w-4 h-4 text-red-500" /> Preview
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={getOfficeViewerUrl(LEASING_CONTRACT_DOCX)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 md:px-3 py-1 md:py-2 bg-zinc-900 border border-black md:border-2 hover:bg-zinc-800 text-zinc-200 text-[8px] md:text-[10px] font-mono font-black uppercase rounded shadow flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3 text-red-500" />
                </a>
                <a
                  href={LEASING_CONTRACT_DOCX}
                  download
                  className="px-1.5 md:px-3 py-1 md:py-2 bg-red-600 border border-black md:border-2 hover:bg-red-500 text-white text-[8px] md:text-[10px] font-mono font-black uppercase rounded shadow flex items-center gap-1 active:translate-y-0.5"
                >
                  Download <Download className="w-3 h-3" />
                </a>
              </div>
            </div>
            {/* EXCLUSIVE BANNER CARD */}
            <div className="p-1.5 md:p-3 rounded-lg md:rounded-xl border border-zinc-800 md:border-2 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 md:gap-4">
              <div
                onClick={() => setSelectedImageModal(EXCLUSIVE_BANNER_IMG)}
                className="w-full sm:w-72 h-14 md:h-28 rounded-md md:rounded-lg overflow-hidden border border-black md:border-2 flex-shrink-0 bg-zinc-900 flex items-center justify-center p-1 md:p-2 cursor-pointer group/img relative"
              >
                <LicenseBannerImage
                  src={EXCLUSIVE_BANNER_IMG}
                  alt="Exclusive Rights License"
                  title="Exclusive License"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-white uppercase">
                  <Eye className="w-4 h-4 text-red-500" /> Preview
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={getOfficeViewerUrl(EXCLUSIVE_CONTRACT_DOCX)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 md:px-3 py-1 md:py-2 bg-zinc-900 border border-black md:border-2 hover:bg-zinc-800 text-zinc-200 text-[8px] md:text-[10px] font-mono font-black uppercase rounded shadow flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3 text-red-500" />
                </a>
                <a
                  href={EXCLUSIVE_CONTRACT_DOCX}
                  download
                  className="px-1.5 md:px-3 py-1 md:py-2 bg-red-600 border border-black md:border-2 hover:bg-red-500 text-white text-[8px] md:text-[10px] font-mono font-black uppercase rounded shadow flex items-center gap-1 active:translate-y-0.5"
                >
                  Download <Download className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* MAIN LAYOUT WITH LEFT SIDEBAR FILTERS */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-8 items-start w-full">
          {/* COMPACT MOBILE FILTERS */}
          <aside className="lg:hidden w-full rounded-xl bg-black/90 backdrop-blur-md border-2 border-black p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-red-500" />
                <h3 className="font-mono text-[10px] font-black uppercase text-white tracking-wider">
                  Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[9px] font-mono text-zinc-400 hover:text-red-500 transition flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-1.5 py-1.5 text-white font-mono text-[9px] font-bold uppercase outline-none focus:border-red-600"
                aria-label="Filter by genre"
              >
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-1.5 py-1.5 text-white font-mono text-[9px] font-bold uppercase outline-none focus:border-red-600"
                aria-label="Filter by tag"
              >
                {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <select
                value={keyFilter}
                onChange={(e) => setKeyFilter(e.target.value)}
                className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-1.5 py-1.5 text-white font-mono text-[9px] font-bold uppercase outline-none focus:border-red-600"
                aria-label="Filter by musical key"
              >
                {keys.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[9px] font-mono font-black uppercase text-zinc-400 whitespace-nowrap">Max BPM</span>
              <input
                type="range"
                min="70"
                max="180"
                step="5"
                value={maxBpm}
                onChange={(e) => setMaxBpm(Number(e.target.value))}
                className="min-w-0 flex-1 accent-red-600 cursor-pointer"
              />
              <span className="text-[9px] font-mono font-bold text-red-500 whitespace-nowrap">{maxBpm}</span>
            </div>
          </aside>
          {/* LEFT FILTER SIDEBAR */}
          <aside className="hidden lg:block w-full rounded-2xl bg-black/90 backdrop-blur-md border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 lg:sticky lg:top-28">
            <div className="border-b-2 border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-500" />
                <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider">
                  Filters & Categories
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] font-mono text-zinc-400 hover:text-red-500 transition flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            {/* GENRES FILTER */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 block">
                Genre
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {genres.map((g) => {
                  const isSelected = genreFilter === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenreFilter(g)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition flex items-center justify-between ${
                        isSelected
                          ? "bg-red-600 text-white border border-black shadow"
                          : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
                      }`}
                    >
                      <span>{g}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* TAG FILTER */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 block">
                Tag
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {tags.map((tag) => {
                  const isSelected = tagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition flex items-center justify-between ${
                        isSelected
                          ? "bg-red-600 text-white border border-black shadow"
                          : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* KEY FILTER */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 block">
                Musical Key
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {keys.map((k) => {
                  const isSelected = keyFilter === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKeyFilter(k)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition flex items-center justify-between ${
                        isSelected
                          ? "bg-red-600 text-white border border-black shadow"
                          : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-900"
                      }`}
                    >
                      <span>{k}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* MAX BPM SLIDER */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
                  Max Tempo
                </span>
                <span className="text-[10px] font-mono font-bold text-red-500">{maxBpm} BPM</span>
              </div>
              <input
                type="range"
                min="70"
                max="180"
                step="5"
                value={maxBpm}
                onChange={(e) => setMaxBpm(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </aside>
          {/* MAIN BEAT GRID SECTION */}
          <section className="w-full rounded-xl md:rounded-2xl bg-black/80 backdrop-blur-md border-2 md:border-4 border-black p-2 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="md:hidden mb-2 border-b border-black pb-1.5 text-center">
              <h2 className="font-raf text-xs uppercase tracking-wide text-white/80">
                Available Instrumentals
              </h2>
            </div>
            <div className="hidden md:block mb-6 border-b-4 border-black pb-4 text-center">
              <h2 className="font-raf text-2xl md:text-3xl tracking-wide text-white">
                Available Instrumentals
              </h2>
            </div>
            {loading ? (
              <div className="py-24 text-center text-zinc-400 font-mono text-xs">
                <div className="mx-auto h-8 w-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-4" />
                LOADING STORE CONTROLS...
              </div>
            ) : filteredBeats.length === 0 ? (
              <div className="rounded-xl border-4 border-black bg-zinc-900/50 p-8 text-center">
                <h3 className="text-lg font-black font-mono text-red-500 uppercase">
                  Zero Outputs Returned
                </h3>
                <p className="mt-2 text-zinc-400 text-xs font-mono">
                  Adjust parameter filters or search terms to clear matching indexes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredBeats.map((beat) => {
                  const isTrackCurrent = currentTrack?.id === beat.id || currentTrack?.url === beat.audioUrl;
                  const isTrackPlaying = isTrackCurrent && playing;
                  const cardBackgroundUrl = beat.backgroundUrl || beat.backCoverUrl || null;
                  const cardForegroundUrl = beat.frontCoverUrl || beat.artworkUrl || "/images/mascotmonored.png";
                  const dynamicCardBg = cardBackgroundUrl
                    ? {
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.82), rgba(0,0,0,0.96)), url('${cardBackgroundUrl}')`,
                        backgroundPosition: "center center",
                        backgroundSize: "cover"
                      }
                    : undefined;
                  return (
                    <article
                      key={beat.id}
                      style={dynamicCardBg}
                      className="group overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-4 border-black bg-black/60 shadow-md transition-all duration-300 hover:border-red-600 flex flex-row sm:flex-col justify-between relative min-h-[138px] sm:min-h-0"
                    >
                      {/* LAYERED BEAT CARD IMAGE: BACKGROUND + TRANSPARENT PNG FOREGROUND */}
                      <div className="relative w-[38%] aspect-square overflow-hidden bg-zinc-950 flex-shrink-0 border-r-2 border-black sm:w-full sm:aspect-square sm:border-r-0 sm:border-b-4">
                        {cardBackgroundUrl ? (
                          <img
                            src={cardBackgroundUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
                        )}
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-0 z-10 flex items-center justify-center p-1.5 sm:p-3">
                          <SafeImage
                            src={cardForegroundUrl}
                            alt={beat.title}
                            className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                        {/* PLAY TOGGLE OVERLAY */}
                        {beat.audioUrl && (
                          <div className="absolute inset-0 z-20 bg-black/25 sm:bg-black/45 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handlePlayToggle(beat)}
                              className="transform scale-95 group-hover:scale-100 transition p-2 sm:p-4 rounded-full bg-red-600 text-white border-2 border-black shadow-xl"
                            >
                              {isTrackPlaying ? (
                                <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      {/* BEAT CARD DETAILS */}
                      <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4 min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-red-500 font-mono truncate">
                              {beat.genre || "INSTRUMENTAL"}
                            </p>
                            {isTrackPlaying && (
                              <span className="text-[7px] sm:text-[9px] uppercase font-mono px-1.5 sm:px-2 py-0.5 bg-red-600/20 text-red-500 rounded border border-red-600/40 animate-pulse font-bold">
                                LIVE
                              </span>
                            )}
                          </div>
                          <Link href={`/beats/${beat.id}`} className="block hover:text-red-500 transition-colors">
                            <h3 className="font-raf text-sm sm:text-xl tracking-wide text-white mt-0.5 sm:mt-1 line-clamp-1">
                              {beat.title}
                            </h3>
                          </Link>
                          <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2 text-[8px] sm:text-[11px] font-mono text-zinc-400 border-t border-zinc-900/80 pt-1 sm:pt-2">
                            <span>{beat.bpm || "--"} BPM</span>
                            <span>{beat.key || "C MINOR"}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-3 pt-1 sm:pt-2 border-t border-zinc-900/80">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-base font-black font-mono text-white">
                              £{beat.price ? beat.price.toFixed(2) : "0.00"}
                            </span>
                            <Link
                              href={`/beats/${beat.id}`}
                              className="rounded bg-red-600 border border-black sm:border-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs font-mono font-black text-white hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-0.5"
                            >
                              VIEW BEAT
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-1 border-t border-zinc-900/60">
                            <Link
                              href={`/beats/${beat.id}?license=lease`}
                              aria-label={`Buy ${beat.title} with a leasing license`}
                              className="group/img relative aspect-[16/6] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 hover:border-red-600 transition"
                            >
                              <LicenseBannerImage
                                src={LEASING_BANNER_IMG}
                                alt={`Lease ${beat.title}`}
                                title="Leasing License"
                              />
                            </Link>
                            <Link
                              href={`/beats/${beat.id}?license=exclusive`}
                              aria-label={`Buy ${beat.title} with an exclusive license`}
                              className="group/img relative aspect-[16/6] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 hover:border-red-600 transition"
                            >
                              <LicenseBannerImage
                                src={EXCLUSIVE_BANNER_IMG}
                                alt={`Buy ${beat.title} exclusive`}
                                title="Exclusive License"
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
      {/* SYSTEM DECK PLAYER AT BOTTOM */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t-4 border-red-600 p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
              <div className={`p-3 rounded-xl bg-zinc-900 border-2 border-black text-red-500 flex-shrink-0 ${playing ? "animate-pulse" : ""}`}>
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono font-bold">
                  System Deck Link Active
                </p>
                <h4 className="text-sm font-black font-mono text-white tracking-tight truncate uppercase mt-0.5">
                  {currentTrack.title}
                </h4>
                <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5 uppercase">
                  {currentTrack.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="rounded-full bg-red-600 text-white border-2 border-black px-6 py-2.5 font-mono text-xs font-black uppercase hover:bg-red-500 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                {playing ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause Deck
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Resume Deck
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE LIGHTBOX PREVIEW MODAL */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-zinc-950 border-4 border-black rounded-2xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-500 text-white rounded-full border-2 border-black shadow transition active:translate-y-0.5 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full text-center mb-3">
              <h3 className="font-raf text-xl md:text-2xl text-white uppercase tracking-wide">
                {selectedImageModal === LEASING_BANNER_IMG ? "Leasing License Agreement" : "Exclusive Rights License"}
              </h3>
            </div>
            <div className="w-full max-h-[70vh] flex items-center justify-center bg-black/80 rounded-xl border-2 border-zinc-800 p-2 overflow-hidden">
              <img
                src={selectedImageModal}
                alt="License Banner Preview"
                className="max-w-full max-h-[65vh] object-contain rounded"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full">
              <a
                href={selectedImageModal}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 border-2 border-black hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-black uppercase rounded shadow flex items-center gap-2"
              >
                Open Full Image <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              </a>
              <a
                href={getOfficeViewerUrl(selectedImageModal === LEASING_BANNER_IMG ? LEASING_CONTRACT_DOCX : EXCLUSIVE_CONTRACT_DOCX)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 border-2 border-black hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-black uppercase rounded shadow flex items-center gap-2"
              >
                View Docx Contract <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              </a>
              <a
                href={selectedImageModal === LEASING_BANNER_IMG ? LEASING_CONTRACT_DOCX : EXCLUSIVE_CONTRACT_DOCX}
                download
                className="px-4 py-2 bg-red-600 border-2 border-black hover:bg-red-500 text-white text-xs font-mono font-black uppercase rounded shadow flex items-center gap-2 active:translate-y-0.5"
              >
                Download Docx <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAudioStore } from "@/lib/audioStore";

type Song = {
  id: string;
  title: string;
  duration?: number | null;
  audioUrl?: string | null;
  isrc?: string | null;
  trackNo?: number | null;
  price?: number | null;
  sellIndividually: boolean;
  artist?: { id: string; name: string } | null;
};

type MusicProduct = {
  id: string;
  releaseId: string;
  price: number;
  itemType: string;
  stock?: number | null;
  release: {
    id: string;
    title: string;
    type: string;
    coverUrl?: string | null;
    description?: string | null;
    genre?: string | null;
    catalogNo?: string | null;
    releaseDate?: string | null;
    featured?: boolean;
    artist?: { id: string; name: string } | null;
    songs: Song[];
  };
};

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPrice(value?: number | null) {
  return GBP.format(Number(value || 0));
}

function formatDuration(seconds?: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function normalizeArtist(value: any) {
  if (!value) return null;

  if (typeof value === "string") {
    return { id: "", name: value };
  }

  if (typeof value === "object" && value.name) {
    return {
      id: String(value.id || ""),
      name: String(value.name),
    };
  }

  return null;
}

function normalizeDuration(value: any) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.includes(":")) {
    const [minutes, seconds] = value.split(":").map(Number);

    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes * 60 + seconds;
    }
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function trackNumberFromAudioUrl(audioUrl?: string | null) {
  if (!audioUrl) return null;

  try {
    const decoded = decodeURIComponent(audioUrl);
    const fileName = decoded.split("/").pop() || "";
    const matches = [
      ...fileName.matchAll(/\s-\s0*(\d{1,3})\s/g),
    ];

    if (matches.length > 0) {
      const value = Number(matches[matches.length - 1][1]);
      return Number.isFinite(value) ? value : null;
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeSong(song: any, index: number): Song {
  return {
    id: String(song?.id || `track-${index + 1}`),
    title: String(song?.title || `Track ${index + 1}`),
    duration: normalizeDuration(song?.duration),
    audioUrl: song?.audioUrl || null,
    isrc: song?.isrc || null,
    trackNo: Number(song?.trackNo ?? index + 1),
    price:
      song?.price === null || song?.price === undefined
        ? null
        : Number(song.price),
    sellIndividually:
      song?.sellIndividually === null ||
      song?.sellIndividually === undefined
        ? song?.price !== null &&
          song?.price !== undefined &&
          Number(song.price) > 0
        : Boolean(song.sellIndividually),
    artist: normalizeArtist(song?.artist),
  };
}

function normalizeMusicProductResponse(
  data: any
): MusicProduct | null {
  const root = data?.data ?? data;

  if (!root || typeof root !== "object") {
    return null;
  }

  const productCandidate =
    root?.product ??
    root?.musicProduct ??
    (root?.release && root?.id ? root : null);

  const releaseCandidate =
    productCandidate?.release ??
    root?.release ??
    (root?.title ? root : null);

  if (!releaseCandidate || typeof releaseCandidate !== "object") {
    return null;
  }

  const songsSource = Array.isArray(releaseCandidate.songs)
    ? releaseCandidate.songs
    : Array.isArray(releaseCandidate.tracks)
      ? releaseCandidate.tracks
      : [];

  const releaseId = String(
    productCandidate?.releaseId ??
      releaseCandidate?.id ??
      root?.releaseId ??
      ""
  );

  const productId = String(
    productCandidate?.id ??
      root?.productId ??
      root?.musicProductId ??
      releaseId
  );

  if (!productId || !releaseId) {
    return null;
  }

  return {
    id: productId,
    releaseId,
    price: Number(
      productCandidate?.price ??
        root?.price ??
        releaseCandidate?.price ??
        0
    ),
    itemType: String(
      productCandidate?.itemType ??
        root?.itemType ??
        releaseCandidate?.itemType ??
        "DIGITAL"
    ),
    stock:
      productCandidate?.stock ??
      root?.stock ??
      releaseCandidate?.stock ??
      null,
    release: {
      id: releaseId,
      title: String(
        releaseCandidate?.title || "Untitled Release"
      ),
      type: String(releaseCandidate?.type || "Release"),
      coverUrl: releaseCandidate?.coverUrl || null,
      description:
        releaseCandidate?.description ??
        productCandidate?.description ??
        root?.description ??
        null,
      genre:
        releaseCandidate?.genre ??
        productCandidate?.genre ??
        root?.genre ??
        null,
      catalogNo:
        releaseCandidate?.catalogNo ??
        productCandidate?.catalogNo ??
        root?.catalogNo ??
        null,
      releaseDate:
        releaseCandidate?.releaseDate ??
        productCandidate?.releaseDate ??
        root?.releaseDate ??
        null,
      featured: Boolean(releaseCandidate?.featured),
      artist: normalizeArtist(releaseCandidate?.artist),
      songs: songsSource.map(normalizeSong),
    },
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-base font-bold text-white break-words">
        {value}
      </p>
    </div>
  );
}

export default function MusicReleaseDetailPage() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const playTrack = useAudioStore((state) => state.playTrack);

  const [product, setProduct] =
    useState<MusicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [addedTrackId, setAddedTrackId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadRelease() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/music/release/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "Failed to load release"
          );
        }

        const normalized =
          normalizeMusicProductResponse(data);

        if (!normalized?.release) {
          console.error(
            "Unexpected music release response:",
            data
          );

          throw new Error(
            "The release loaded, but its release details were missing from the API response."
          );
        }

        setProduct(normalized);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load release");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      loadRelease();
    }
  }, [params?.id]);

  const available = useMemo(() => {
    if (!product) return false;

    if (
      String(product.itemType).toUpperCase() !== "PHYSICAL"
    ) {
      return true;
    }

    return Number(product.stock || 0) > 0;
  }, [product]);

  function addReleaseToCart() {
    if (!product || !available) return;

    addToCart({
      id: product.id,
      type: "music",
      title: product.release.title,
      price: Number(product.price || 0),
      quantity: 1,
      image: product.release.coverUrl || undefined,
      itemType: product.itemType,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function addTrackToCart(song: Song) {
    if (!product) return;

    const trackPrice = Number(song.price ?? 0);
    const canBuyTrack =
      song.sellIndividually && trackPrice > 0;

    if (!canBuyTrack || trackPrice <= 0) return;

    addToCart({
      id: song.id,
      type: "music",
      title: `${song.title} — ${product.release.title}`,
      price: trackPrice,
      quantity: 1,
      image: product.release.coverUrl || undefined,

      // Retain the parent release/product references for the checkout layer.
      musicProductId: product.id,
      releaseId: product.releaseId,
      songId: song.id,
      purchaseType: "track",
    } as any);

    setAddedTrackId(song.id);

    window.setTimeout(
      () => setAddedTrackId(null),
      1800
    );
  }

  function playSongPreview(song: Song, songs: Song[]) {
    if (!product || !song.audioUrl) return;

    const previewQueue = songs
      .filter((queueSong) => Boolean(queueSong.audioUrl))
      .map((queueSong) => ({
        id: queueSong.id,
        url: String(queueSong.audioUrl),
        title: queueSong.title,
        artwork: product.release.coverUrl || undefined,
        subtitle: `${
          queueSong.artist?.name ||
          product.release.artist?.name ||
          "Unknown Artist"
        } — ${product.release.title}`,
      }));

    const selectedTrack = previewQueue.find(
      (queueTrack) => queueTrack.id === song.id
    );

    if (!selectedTrack) return;

    playTrack(selectedTrack, previewQueue);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white pt-32 px-6">
        <div className="max-w-7xl mx-auto text-center text-zinc-400">
          Loading release…
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-black text-white pt-32 px-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
          <h1 className="text-2xl font-black">
            Release not found
          </h1>

          <p className="mt-3 text-zinc-400">{error}</p>

          <Link
            href="/music"
            className="mt-6 inline-flex rounded-full bg-green-500 px-5 py-2.5 font-black text-black"
          >
            Back to Music
          </Link>
        </div>
      </main>
    );
  }

  const release = product.release;

  const isPhysical =
    String(product.itemType).toUpperCase() === "PHYSICAL";

  const orderedSongs = [...(release.songs || [])].sort(
    (a, b) => {
      const aFileNo =
        trackNumberFromAudioUrl(a.audioUrl);
      const bFileNo =
        trackNumberFromAudioUrl(b.audioUrl);

      const aTrack =
        aFileNo ??
        (a.trackNo !== null &&
        a.trackNo !== undefined
          ? Number(a.trackNo)
          : Number.MAX_SAFE_INTEGER);

      const bTrack =
        bFileNo ??
        (b.trackNo !== null &&
        b.trackNo !== undefined
          ? Number(b.trackNo)
          : Number.MAX_SAFE_INTEGER);

      return aTrack - bTrack;
    }
  );

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
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 pt-8 pb-24">
        <Link
          href="/music"
          className="inline-flex rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm font-bold text-white/80 hover:text-white hover:border-green-400 transition"
        >
          ← Back to Music
        </Link>

        <section className="mt-7 grid gap-8 lg:grid-cols-[420px_1fr] items-start">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border-2 border-green-500/25 bg-zinc-950 shadow-2xl">
              {release.coverUrl ? (
                <img
                  src={release.coverUrl}
                  alt={release.title}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-green-950 to-black text-6xl">
                  ♪
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                label="Format"
                value={product.itemType || "DIGITAL"}
              />

              <InfoCard
                label="Availability"
                value={
                  isPhysical
                    ? Number(product.stock || 0) > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"
                    : "Digital"
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-black/70 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black uppercase text-black">
                {release.type || "Release"}
              </span>

              {release.featured && (
                <span className="rounded-full border border-green-400/40 bg-green-950/60 px-3 py-1 text-xs font-black uppercase text-green-300">
                  Featured Project
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl sm:text-6xl font-black leading-tight">
              {release.title}
            </h1>

            <p className="mt-3 text-xl text-white/65">
              {release.artist?.name || "Unknown Artist"}
            </p>

            {release.description && (
              <p className="mt-7 text-base sm:text-lg leading-8 text-zinc-300 whitespace-pre-line">
                {release.description}
              </p>
            )}

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoCard
                label="Genre"
                value={
                  release.genre?.trim() || "Not provided"
                }
              />

              <InfoCard
                label="Release Date"
                value={formatDate(release.releaseDate)}
              />

              <InfoCard
                label="Catalogue No."
                value={
                  release.catalogNo?.trim() ||
                  "Not provided"
                }
              />

              <InfoCard
                label="Tracks"
                value={String(orderedSongs.length)}
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-white/10 pt-6">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-green-400 font-black">
                  {isPhysical
                    ? "Physical Release"
                    : "Full Digital Release"}
                </p>

                <p className="mt-1 text-3xl font-black">
                  {formatPrice(product.price)}
                </p>
              </div>

              <button
                type="button"
                disabled={!available}
                onClick={addReleaseToCart}
                className="rounded-full bg-green-500 px-7 py-3.5 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {!available
                  ? "Out of Stock"
                  : added
                    ? "Added to Cart ✓"
                    : isPhysical
                      ? "Buy Physical Release"
                      : "Buy Full Release"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-black/75 p-5 sm:p-8">
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-400">
              Release Audio
            </p>

            <h2 className="mt-1 text-3xl sm:text-4xl font-black">
              Track List
            </h2>
          </div>

          {orderedSongs.length ? (
            <div className="mt-5 divide-y divide-white/10">
              {orderedSongs.map((song, index) => (
                <article
                  key={song.id}
                  className="py-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[48px_1fr_auto] lg:items-center">
                    <div className="text-2xl font-black text-green-400 font-mono">
                      {String(
                        trackNumberFromAudioUrl(
                          song.audioUrl
                        ) ??
                          song.trackNo ??
                          index + 1
                      ).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-black">
                        {song.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
                        <span>
                          {song.artist?.name ||
                            release.artist?.name ||
                            "Artist"}
                        </span>

                        <span>
                          {formatDuration(song.duration)}
                        </span>

                        {song.isrc && (
                          <span className="font-mono">
                            ISRC: {song.isrc}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      {song.audioUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            playSongPreview(
                              song,
                              orderedSongs
                            )
                          }
                          className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-black uppercase text-white transition hover:border-green-400 hover:bg-white/10"
                        >
                          Play Preview
                        </button>
                      )}

                      {song.sellIndividually &&
                      Number(song.price ?? 0) > 0 ? (
                        <>
                          <p className="font-black text-green-300">
                            {formatPrice(song.price)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              addTrackToCart(song)
                            }
                            className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-black uppercase text-black transition hover:bg-green-400"
                          >
                            {addedTrackId === song.id
                              ? "Added ✓"
                              : "Buy Track"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-zinc-500">
              No tracks have been added to this release yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

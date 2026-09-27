"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type Song = {
  id: string;
  title: string;
  duration?: number;
  audioUrl?: string;
};

type Release = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  price: number;
  type?: "album" | "ep" | "single";
  description?: string;
  songs: Song[];
};

export default function ReleasePage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // ✅ IMPORTANT: new release API
        const res = await fetch(`/api/music/release/${id}`);
        const data = await res.json();
        setRelease(data);
      } catch (err) {
        console.error("Failed to load release:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  if (loading) {
    return <p className="text-white p-6">Loading release...</p>;
  }

  if (!release) {
    return <p className="text-white p-6">Release not found</p>;
  }

  // 🎧 preview player
  const play = (song: Song) => {
    if (!song.audioUrl) return;

    if (playing === song.id) {
      setPlaying(null);
      return;
    }

    const audio = new Audio(song.audioUrl);
    audio.play();
    setPlaying(song.id);

    audio.onended = () => setPlaying(null);
  };

  // 🛒 add full release
  const handleAddToCart = () => {
    addToCart({
      id: release.id,
      type: "music",
      title: release.title,
      price: release.price,
      quantity: 1,
      image: release.coverUrl,
    });
  };

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">

        {/* COVER */}
        <div>
          <img
            src={release.coverUrl}
            alt={release.title}
            className="w-full rounded-xl shadow-lg"
          />
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-4xl font-bold">{release.title}</h1>

          <p className="text-white/70 mt-2 text-lg">
            {release.artist}
          </p>

          {release.type && (
            <p className="text-gray-400 text-sm mt-1 uppercase">
              {release.type}
            </p>
          )}

          {release.description && (
            <p className="text-gray-300 mt-4">
              {release.description}
            </p>
          )}

          <p className="text-gray-200 mt-6 text-xl font-semibold">
            £{release.price.toFixed(2)}
          </p>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded w-full"
          >
            Add to Cart
          </button>

          {/* TRACKLIST */}
          {release.songs?.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">
                Tracklist
              </h2>

              <div className="space-y-2">
                {release.songs.map((song, i) => (
                  <div
                    key={song.id}
                    className="flex justify-between items-center bg-white/5 p-3 rounded"
                  >
                    <div>
                      <p>
                        {i + 1}. {song.title}
                      </p>
                    </div>

                    {song.audioUrl && (
                      <button
                        onClick={() => play(song)}
                        className="text-sm bg-white/10 px-3 py-1 rounded"
                      >
                        {playing === song.id ? "Pause" : "Preview"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
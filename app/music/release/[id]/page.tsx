"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type Song = {
  id: string;
  title: string;
  duration?: number;
};

type Release = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  type: string;
  description?: string;
  price: number;
  songs: Song[];
};

export default function ReleasePage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/music/release/${id}`);
      const data = await res.json();
      setRelease(data);
      setLoading(false);
    }

    if (id) load();
  }, [id]);

  if (loading) {
    return <div className="text-white p-6">Loading release...</div>;
  }

  if (!release) {
    return <div className="text-white p-6">Release not found</div>;
  }

  const handleAddAlbum = () => {
    addToCart({
      id: release.id,
      type: "music",
      title: release.title,
      price: release.price,
      quantity: 1,
      image: release.coverUrl,
      variant: "Full Release",
    });
  };

  return (
    <main className="min-h-screen text-white p-8">

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">

        {/* COVER */}
        <img
          src={release.coverUrl}
          className="w-full rounded-xl shadow-lg"
        />

        {/* INFO */}
        <div>
          <h1 className="text-4xl font-bold">{release.title}</h1>

          <p className="text-gray-300 mt-2">
            {release.artist}
          </p>

          <p className="text-gray-400 mt-4">
            {release.type.toUpperCase()}
          </p>

          <p className="mt-4 text-white/70">
            {release.description}
          </p>

          {/* PRICE */}
          <div className="mt-6 text-xl font-bold">
            £{release.price.toFixed(2)}
          </div>

          {/* ACTION */}
          <button
            onClick={handleAddAlbum}
            className="mt-6 bg-green-600 px-6 py-3 rounded w-full hover:bg-green-700"
          >
            Add Full Release
          </button>
        </div>
      </div>

      {/* TRACKLIST */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-4">Tracklist</h2>

        <div className="space-y-2">
          {release.songs.map((song, index) => (
            <div
              key={song.id}
              className="flex justify-between bg-black/40 p-3 rounded"
            >
              <span>
                {index + 1}. {song.title}
              </span>

              {song.duration && (
                <span className="text-gray-400">
                  {song.duration}s
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
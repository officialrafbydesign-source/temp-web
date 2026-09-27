"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then(setAlbums);
  }, []);

  return (
    <div className="min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Albums</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="bg-black/40 p-4 rounded-lg cursor-pointer"
            onClick={() =>
              router.push(`/music/albums/${album.id}`)
            }
          >
            <img
              src={album.coverUrl}
              className="w-full h-48 object-cover rounded"
            />

            <h2 className="mt-2 font-bold">
              {album.title}
            </h2>

            <p className="text-gray-300">
              {album.artist.name}
            </p>

            <p className="text-gray-400 text-sm">
              {album.songs.length} tracks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then((res) => res.json())
      .then(setAlbum);
  }, [id]);

  if (!album) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen text-white p-10">
      <div className="max-w-5xl mx-auto">

        <img
          src={album.coverUrl}
          className="w-full rounded-xl mb-6"
        />

        <h1 className="text-4xl font-bold">
          {album.title}
        </h1>

        <p className="text-gray-300 mb-6">
          {album.artist.name}
        </p>

        <h2 className="text-xl mb-3">Tracks</h2>

        <div className="space-y-3">
          {album.songs.map((song: any) => (
            <div
              key={song.id}
              className="bg-white/10 p-3 rounded"
            >
              {song.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
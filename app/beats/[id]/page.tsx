"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type License = {
  id: string;
  name: string;
  price: number;
};

type Beat = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  artworkUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  price: number;
  freeDownload: boolean;
  licenses: License[];
};

export default function BeatPage() {
  const { id } = useParams();
  const [beat, setBeat] = useState<Beat | null>(null);

  useEffect(() => {
    async function fetchBeat() {
      try {
        const res = await fetch(`/api/beats/${id}`);
        const data = await res.json();
        setBeat(data);
      } catch (error) {
        console.error("Error fetching beat:", error);
      }
    }
    fetchBeat();
  }, [id]);

  if (!beat) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{beat.title}</h1>
      <p className="text-gray-500 mb-2">Artist: {beat.artist}</p>
      <p className="text-gray-400 mb-4">Genre: {beat.genre}</p>

      {beat.artworkUrl && (
        <img src={beat.artworkUrl} alt={beat.title} className="w-full mb-4 rounded" />
      )}

      {beat.audioUrl && (
        <audio controls src={beat.audioUrl} className="w-full mb-4" />
      )}

      <p className="text-xl font-semibold mb-4">Base Price: £{beat.price / 100}</p>

      {/* Free Download Button */}
      {beat.freeDownload && beat.fileUrl && (
        <a
          href={beat.fileUrl}
          download
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mr-2"
        >
          Free Download
        </a>
      )}

      {/* Licenses Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-3">Available Licenses</h2>
        {beat.licenses.length === 0 && <p>No licenses available yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beat.licenses.map((license) => (
            <div
              key={license.id}
              className="border p-4 rounded hover:shadow-lg transition"
            >
              <h3 className="font-semibold">{license.name}</h3>
              <p className="mb-2">Price: £{license.price / 100}</p>
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

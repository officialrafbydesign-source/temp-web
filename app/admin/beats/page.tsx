"use client";

import { useEffect, useState } from "react";
import BeatCard from "@/components/BeatCard";

type Beat = {
  id: string;
  title: string;
  bpm: number;
  genre: string;
  artworkUrl: string;
  audioUrl: string;
  licenses: { id: string; name: string; price: number }[];
};

export default function BeatsAdminPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBeats() {
      try {
        const res = await fetch("/api/admin/beats");
        const data = await res.json();
        setBeats(data);
      } catch (err) {
        console.error("Failed to fetch beats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBeats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎵 Beats Admin</h1>

      {loading && <p>Loading beats...</p>}
      {!loading && beats.length === 0 && <p>No beats found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {beats.map((beat) => (
          <BeatCard key={beat.id} beat={beat} />
        ))}
      </div>
    </div>
  );
}

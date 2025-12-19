"use client";

import { useEffect, useState } from "react";
import BeatCard from "@/components/BeatCard";

type Beat = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  coverUrl: string;
  price: number;
  stock: number;
};

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);

  useEffect(() => {
    async function fetchBeats() {
      try {
        const res = await fetch("/api/beats");
        if (!res.ok) throw new Error("Failed to fetch beats");
        const data = await res.json();
        setBeats(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchBeats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}

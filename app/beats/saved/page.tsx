"use client";

import { useEffect, useState } from "react";
import BeatCard from "@/components/BeatCard";

type Beat = {
  id: string;
  title: string;
  genre?: string;
  audioUrl?: string | null;
};

export default function SavedBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("saved-beats");
    if (stored) setSavedIds(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!savedIds.length) return;

    fetch("/api/beats")
      .then((res) => res.json())
      .then((data) =>
        setBeats(data.filter((b: Beat) => savedIds.includes(b.id)))
      );
  }, [savedIds]);

  return (
    <div className="relative z-10 px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">
        Saved Beats
      </h1>

      {beats.length === 0 && (
        <p className="text-gray-300">No saved beats yet.</p>
      )}

      <div className="space-y-6">
        {beats.map((beat, i) => (
          <BeatCard key={beat.id} beat={beat} index={i} />
        ))}
      </div>
    </div>
  );
}

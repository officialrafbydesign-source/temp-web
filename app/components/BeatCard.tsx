"use client";

import { useAudioStore, Track } from "@/lib/audioStore";
import { useState } from "react";

type Beat = {
  id: string;
  title: string;
  genre?: string;
  audioUrl?: string | null;
};

type BeatCardProps = {
  beat: Beat;
  index: number;
};

export default function BeatCard({ beat, index }: BeatCardProps) {
  // Extract actions and states from the global Zustand engine
  const playTrack = useAudioStore((state) => state.playTrack);
  const playing = useAudioStore((state) => state.playing);
  const setPlaying = useAudioStore((state) => state.setPlaying);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);

  // Local state helper for the simple favorites toggle
  const [isSaved, setIsSaved] = useState(false);

  const currentTrack = queue[currentIndex];
  const isCurrentTrack = currentTrack?.id === beat.id || (beat.audioUrl && currentTrack?.url === beat.audioUrl);

  // Casing normalized (spaces removed to guarantee asset path resolution)
  const mascots = [
    "/images/mascotmonoblack.png",
    "/images/mascotmonored.png",
    "/images/mascotmonoyellow.png",
    "/images/mascotmonowhite.png",
  ];

  const mascot = mascots[index % mascots.length];

  const handlePlayClick = () => {
    if (!beat.audioUrl) return;

    if (isCurrentTrack) {
      setPlaying(!playing);
    } else {
      const trackPayload: Track = {
        id: beat.id,
        title: beat.title,
        subtitle: beat.genre || "Uncategorised Beat",
        url: beat.audioUrl,
        artwork: mascot,
        type: "beat"
      };
      playTrack(trackPayload);
    }
  };

  const share = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/beats/${beat.id}`
    );
    alert("Beat link copied to clipboard");
  };

  return (
    <div className={`bg-red-900/90 border rounded-xl p-4 shadow-lg mb-6 transition-colors duration-200 ${
      isCurrentTrack ? "border-yellow-400" : "border-red-700"
    }`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* IMAGE PLATE */}
        <div className="bg-red-700 rounded-lg w-full sm:w-[240px] h-[240px] flex items-center justify-center p-4 flex-shrink-0">
          <img
            src={mascot}
            alt={beat.title}
            className="max-h-[160px] object-contain select-none"
          />
        </div>

        {/* INFO PANEL */}
        <div className="flex-1 bg-red-800 border border-red-700 rounded-lg p-4 flex flex-col justify-between gap-4">
          <div>
            <h3 className={`text-xl font-bold truncate ${isCurrentTrack ? "text-yellow-400" : "text-white"}`}>
              {beat.title}
            </h3>
            <p className="text-red-200 text-sm font-mono mt-0.5">
              {beat.genre || "Uncategorised"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono font-bold uppercase">
            {beat.audioUrl && (
              <button
                onClick={handlePlayClick}
                className={`px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-1.5 ${
                  isCurrentTrack && playing
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] font-black"
                    : "bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
                }`}
              >
                {isCurrentTrack && playing ? "⏸ Pause" : "▶ Play"}
              </button>
            )}

            <button
              onClick={() => setIsSaved(!isSaved)}
              className="bg-black/70 border border-red-500 hover:border-red-400 text-white px-4 py-2 rounded transition"
            >
              {isSaved ? "♥ Saved" : "♡ Save"}
            </button>

            <button
              onClick={share}
              className="bg-black/70 border border-red-500 hover:border-red-400 text-white px-4 py-2 rounded transition"
            >
              Share
            </button>

            <a
              href={`/beats/${beat.id}`}
              className="bg-black/90 hover:bg-black text-white px-4 py-2 rounded border border-transparent hover:border-zinc-700 transition flex items-center"
            >
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useAudioStore, Track } from "@/lib/audioStore";

interface BeatCardProps {
  id: string;
  title: string;
  bpm: number;
  tags: string[];
  audioUrl: string;

  mascotImage?: string;
  backgroundImage?: string;
}

export default function BeatCard({
  id,
  title,
  bpm,
  tags,
  audioUrl,
  mascotImage,
  backgroundImage,
}: BeatCardProps) {
  const playTrack = useAudioStore((state) => state.playTrack);
  const playing = useAudioStore((state) => state.playing);
  const setPlaying = useAudioStore((state) => state.setPlaying);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);

  const currentTrack = queue[currentIndex];

  const isCurrentTrack =
    currentTrack?.id === id || currentTrack?.url === audioUrl;

  const handlePlayToggle = () => {
    if (isCurrentTrack) {
      setPlaying(!playing);
    } else {
      const trackPayload: Track = {
        id,
        title,
        subtitle: `${bpm} BPM • ${tags.join(", ")}`,
        url: audioUrl,
        artwork: mascotImage || "/images/mascotmonored.png",
        type: "beat",
      };

      playTrack(trackPayload);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition ${
        isCurrentTrack
          ? "border-red-900/60"
          : "border-zinc-800"
      }`}
    >
      {/* Background */}
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col items-center text-center">

        {/* Mascot */}
        <img
          src={mascotImage || "/images/mascotmonored.png"}
          alt={title}
          className="w-28 h-28 object-contain mb-5"
        />

        {/* Title */}
        <h3
          className={`text-xl font-black ${
            isCurrentTrack
              ? "text-red-500"
              : "text-white"
          }`}
        >
          {title}
        </h3>

        {/* BPM */}
        <p className="mt-1 text-sm text-zinc-300">
          {bpm} BPM
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-white/10 text-xs text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={handlePlayToggle}
          className={`mt-6 px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider transition ${
            isCurrentTrack && playing
              ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.45)]"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {isCurrentTrack && playing ? "Pause" : "Play Beat"}
        </button>
      </div>
    </div>
  );
}
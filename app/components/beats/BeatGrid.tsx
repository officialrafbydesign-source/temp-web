"use client";

import { useAudioStore, Track } from "@/lib/audioStore";
import { Play, Pause } from "lucide-react";

type Beat = {
  id: string;
  title: string;
  bpm: number;
  key: string;
  price: number;
  audioUrl?: string; // Target path for streaming
};

type BeatGridProps = {
  beats: Beat[];
};

const mascotColors = ["red", "yellow", "white", "black"];

function getMascot(index: number) {
  const color = mascotColors[index % mascotColors.length];
  return `/images/mascotmono${color}.png`;
}

export default function BeatGrid({ beats = [] }: BeatGridProps) {
  // Grab state slices and functions directly from our global Zustand audio core
  const playTrack = useAudioStore((state) => state.playTrack);
  const playing = useAudioStore((state) => state.playing);
  const setPlaying = useAudioStore((state) => state.setPlaying);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);

  const currentTrack = queue[currentIndex];

  const handlePlayToggle = (beat: Beat, mascot: string) => {
    const fallbackUrl = beat.audioUrl || `/audio/beats/${beat.id}.mp3`;
    const isCurrentTrack = currentTrack?.id === beat.id || currentTrack?.url === fallbackUrl;

    if (isCurrentTrack) {
      setPlaying(!playing);
    } else {
      const trackPayload: Track = {
        id: beat.id,
        title: beat.title,
        subtitle: `${beat.bpm} BPM • ${beat.key}`,
        url: fallbackUrl,
        artwork: mascot,
        type: "beat",
      };
      playTrack(trackPayload);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {beats.map((beat, index) => {
        const mascot = getMascot(index);
        const fallbackUrl = beat.audioUrl || `/audio/beats/${beat.id}.mp3`;

        // Evaluate play state globally against what's actually running in the player engine
        const isCurrentTrack = currentTrack?.id === beat.id || currentTrack?.url === fallbackUrl;
        const isPlaying = isCurrentTrack && playing;

        return (
          <div
            key={beat.id}
            className={`
              group
              relative
              bg-black/40
              border
              rounded-xl
              overflow-hidden
              transition-all
              duration-300
              ${isCurrentTrack
                ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : "border-red-900/40 hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(255,0,0,0.25)]"}
            `}
          >
            {/* Mascot Artwork */}
            <div className="relative aspect-square bg-black">
              <img
                src={mascot}
                alt={beat.title}
                className="
                  w-full
                  h-full
                  object-contain
                  p-6
                  opacity-90
                  group-hover:scale-105
                  transition-transform
                  duration-300
                  select-none
                "
              />

              {/* Play Button Overlay */}
              <button
                onClick={() => handlePlayToggle(beat, mascot)}
                className={`
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  transition-opacity
                  duration-200
                  ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              >
                <div className="
                  bg-black/70
                  backdrop-blur
                  rounded-full
                  p-4
                  border border-red-500/40
                  active:scale-95
                  transition-transform
                ">
                  {isPlaying ? (
                    <Pause className="text-white w-6 h-6" />
                  ) : (
                    <Play className="text-white w-6 h-6 ml-1" />
                  )}
                </div>
              </button>
            </div>

            {/* Beat Info */}
            <div className="p-4 space-y-2">
              <div className={`font-semibold truncate ${isCurrentTrack ? "text-red-400" : "text-white"}`}>
                {beat.title}
              </div>

              <div className="text-white/60 text-sm font-mono">
                {beat.bpm} BPM • {beat.key}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-red-400 font-semibold font-mono">
                  £{beat.price}
                </div>

                <button className="
                  text-xs
                  font-mono
                  border
                  border-red-500/50
                  px-3
                  py-1
                  rounded-md
                  hover:bg-red-500
                  hover:text-black
                  transition
                  font-bold
                ">
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
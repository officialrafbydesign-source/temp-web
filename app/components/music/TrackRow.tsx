"use client";

import { useAudioStore, Track } from "@/lib/audioStore";

interface TrackRowProps {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  artworkUrl: string;
  duration?: string;
  type?: "beat" | "music";
}

export default function TrackRow({ id, title, artist, audioUrl, artworkUrl, duration, type = "music" }: TrackRowProps) {
  // Extract actions and states from the global Zustand engine
  const playTrack = useAudioStore((state) => state.playTrack);
  const playing = useAudioStore((state) => state.playing);
  const setPlaying = useAudioStore((state) => state.setPlaying);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);

  const currentTrack = queue[currentIndex];

  // Robust match tracking across either matching ID string or identical URL source paths
  const isCurrentTrack = currentTrack?.id === id || currentTrack?.url === audioUrl;

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      // Toggle play/pause if this specific song is already loaded
      setPlaying(!playing);
    } else {
      // Package the data perfectly for the player context schema
      const trackPayload: Track = {
        id,
        title,
        subtitle: artist,
        url: audioUrl,
        artwork: artworkUrl || "/images/mascotmonored.png",
        type
      };

      playTrack(trackPayload);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border border-transparent transition group ${
        isCurrentTrack ? "bg-red-950/20 border-red-900/40" : "hover:bg-zinc-900/40 hover:border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Play/Pause Artwork Hover */}
        <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
          <img src={artworkUrl || "/images/mascotmonored.png"} alt={title} className="h-full w-full object-cover" />
          <button
            onClick={handlePlayClick}
            className={`absolute inset-0 flex items-center justify-center bg-black/60 transition ${
              isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="text-white text-lg transition transform active:scale-90 select-none">
              {isCurrentTrack && playing ? "⏸" : "▶"}
            </span>
          </button>
        </div>

        <div className="min-w-0">
          <h4 className={`font-bold text-sm truncate transition-colors ${isCurrentTrack ? "text-red-500" : "text-white"}`}>
            {title}
          </h4>
          <p className="text-xs text-zinc-400 truncate">{artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-zinc-500">
        {duration && <span>{duration}</span>}

        {/* Secondary Action Button */}
        <button
          onClick={handlePlayClick}
          className={`px-3 py-1.5 rounded-md font-bold transition text-[10px] uppercase tracking-wider ${
            isCurrentTrack && playing
              ? "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)] border border-red-600"
              : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-white hover:text-black hover:border-white"
          }`}
        >
          {isCurrentTrack && playing ? "Playing" : "Listen"}
        </button>
      </div>
    </div>
  );
}
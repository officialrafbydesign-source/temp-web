"use client";

import { useState, useRef, useEffect } from "react";

interface BeatPlayerProps {
  audioUrl: string;
}

export default function BeatPlayer({ audioUrl }: BeatPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setPlaying(false);

    return () => {
      audioRef.current?.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="w-full py-3 text-white bg-black rounded mt-2"
    >
      {playing ? "Pause Preview" : "Play Preview"}
    </button>
  );
}

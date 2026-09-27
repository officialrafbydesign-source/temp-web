"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

export type Track = {
  id: string;
  title: string;
  subtitle: string; // Artist name or beat genre
  audioUrl: string;
  imageUrl: string;
  type: "BEAT" | "MUSIC";
};

type AudioContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  trackList: Track[];
  progress: number;
  duration: number;
  seek: (time: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => nextTrack();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [trackList, currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (audioRef.current.src !== currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log("Autoplay block protection:", err));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  const playTrack = (track: Track, queue: Track[] = []) => {
    if (queue.length > 0) {
      setTrackList(queue);
    } else if (!trackList.some((t) => t.id === track.id)) {
      setTrackList([track]);
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    if (trackList.length <= 1 || !currentTrack) return;
    const currentIndex = trackList.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % trackList.length;
    setCurrentTrack(trackList[nextIndex]);
  };

  const prevTrack = () => {
    if (trackList.length <= 1 || !currentTrack) return;
    const currentIndex = trackList.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? trackList.length - 1 : currentIndex - 1;
    setCurrentTrack(trackList[prevIndex]);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlay, nextTrack, prevTrack, trackList, progress, duration, seek }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudioPlayer must be initialized inside an AudioProvider container");
  return context;
};
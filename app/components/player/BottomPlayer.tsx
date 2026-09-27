"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore, Track } from "@/lib/audioStore";

export default function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  const {
    queue,
    currentIndex,
    playing,
    volume,
    isMuted,
    isDockExpanded,
    repeatMode,
    isShuffleOn,
    activeTab,
    playNext,
    playPrev,
    setPlaying,
    setVolume,
    setMuted,
    setDockExpanded,
    setRepeatMode,
    toggleShuffle,
    setActiveTab,
    removeFromQueue,
  } = useAudioStore();

  const track: Track | undefined = queue[currentIndex];

  // Prevent NextJS dynamic layout hydration mismatches
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Synchronize dynamic track instances
  useEffect(() => {
    if (!audioRef.current || !hasMounted) return;

    if (track) {
      const isSameSource = audioRef.current.src === track.url;
      if (!isSameSource) {
        audioRef.current.src = track.url;
        audioRef.current.load();
      }

      if (playing) {
        audioRef.current.play().catch(() => setPlaying(false));
      }
    } else {
      audioRef.current.pause();
    }
  }, [track, hasMounted]);

  // Synchronize execution play states
  useEffect(() => {
    if (!audioRef.current || !track) return;
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  // Handle precise programmatic gain control configurations
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync Global Media Session Interoperability
  useEffect(() => {
    if ("mediaSession" in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.subtitle || "RAF By Design",
        artwork: [{ src: track.artwork || "/images/mascotmonored.png", sizes: "512x512", type: "image/png" }],
      });

      navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
      navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    }
  }, [track]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!hasMounted) return null;

  return (
    <>
      {track && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
        />
      )}

      {/* COMPACT FLOATING LAUNCH DOCK BUTTON */}
      {!isDockExpanded && (
        <button
          onClick={() => setDockExpanded(true)}
          className="fixed bottom-6 left-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-black text-2xl text-white shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all hover:scale-105 active:scale-95 hover:border-white/80"
        >
          {playing ? (
            <div className="flex gap-0.5 items-end justify-center h-5">
              <span className="w-1 bg-white animate-[bounce_1s_infinite_100ms] h-3" />
              <span className="w-1 bg-white animate-[bounce_1s_infinite_300ms] h-5" />
              <span className="w-1 bg-white animate-[bounce_1s_infinite_200ms] h-4" />
            </div>
          ) : (
            "🎵"
          )}
        </button>
      )}

      {/* FULL EXPANDABLE FLOATING INTERACTIVE FRAMEWORK DOCK */}
      <div
        className={`fixed top-28 left-3 sm:left-4 bottom-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] rounded-2xl border-4 border-black bg-black/95 text-white [font-family:Arial,Helvetica,sans-serif] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col overflow-hidden ${
          isDockExpanded ? "translate-x-0 opacity-100" : "-translate-x-[470px] opacity-0 pointer-events-none"
        }`}
      >
        {/* COLLAPSIBLE TOGGLE TOP BAR */}
        <div className="flex items-center justify-between border-b-4 border-black px-5 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${playing ? "bg-white animate-pulse" : "bg-white/40"}`} />
            <span className="font-mono text-xs uppercase font-black tracking-widest text-white">MUSIC PLAYER</span>
          </div>
          <button
            onClick={() => setDockExpanded(false)}
            className="text-white hover:bg-zinc-800 transition text-xs uppercase font-bold bg-black px-3 py-1.5 rounded border-2 border-black"
          >
            Collapse ✕
          </button>
        </div>

        {/* TRACK PROFILE LAYOUT DISPLAY */}
        <div className="p-5 flex flex-col items-center text-center border-b-4 border-black bg-zinc-950/40">
          <div className="relative h-36 w-36 mb-4 rounded-2xl overflow-hidden border-4 border-black shadow-inner bg-black">
            <img
              src={track?.artwork || "/images/mascotmonored.png"}
              alt={track?.title || "No track loaded"}
              className="h-full w-full object-cover"
            />
          </div>
          <h4 className="font-mono font-black text-base sm:text-lg uppercase tracking-tight w-full truncate px-3 text-white">
            {track?.title || "SYSTEM IDLE"}
          </h4>
          <p className="text-xs sm:text-sm text-white/80 truncate w-full px-5 mt-1 font-bold">
            {track?.subtitle || "Awaiting Selection"}
          </p>
        </div>

        {/* CONTROLLER SELECTION NAVIGATION TABS */}
        <div className="flex bg-black text-xs font-black border-b-4 border-black">
          {(["beats", "music", "queue"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-center border-b-4 uppercase transition ${
                activeTab === tab ? "border-white text-white bg-zinc-900/40" : "border-transparent text-white/80 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB WORKSPACE INNER PANELS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/20">
          {activeTab === "queue" ? (
            queue.length === 0 ? (
              <p className="text-white/70 text-xs text-center pt-12 uppercase font-bold tracking-wider">Queue sequence empty</p>
            ) : (
              queue.map((t, idx) => (
                <div
                  key={`${t.url}-${idx}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left group transition ${
                    idx === currentIndex ? "bg-red-950/30 border-red-600" : "bg-black border-black hover:border-zinc-800"
                  }`}
                >
                  <img src={t.artwork || "/images/mascotmonored.png"} className="h-12 w-12 rounded-lg object-cover border border-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-mono font-bold truncate ${idx === currentIndex ? "text-red-500" : "text-white"}`}>{t.title}</p>
                    <p className="text-xs text-white/70 truncate font-bold mt-0.5">{t.subtitle || "RAF By Design"}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(t.url);
                    }}
                    className="text-white/70 hover:text-white text-base px-1.5 opacity-0 group-hover:opacity-100 transition font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            )
          ) : (
            <div className="text-center pt-12 text-white/80 text-xs p-5 space-y-3 uppercase font-bold leading-relaxed">
              <p>Tracks load directly into queue from the beats or music product dashboard interactions.</p>
            </div>
          )}
        </div>

        {/* MASTER CONSOLE BOTTOM MIXER CONTROLS */}
        <div className="bg-zinc-950 p-5 border-t-4 border-black space-y-4">
          {/* TRACK SEEK BAR */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-xs text-white font-bold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* PLAYER ACTIONS BUTTON MATRICES */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={toggleShuffle}
              className={`text-base text-white transition ${isShuffleOn ? "drop-shadow-[0_0_5px_white]" : "opacity-80 hover:opacity-100"}`}
              title="Shuffle"
            >
              🔀
            </button>

            <button onClick={playPrev} className="text-sm text-white font-bold transition hover:opacity-80">
              PREV
            </button>

            <button
              onClick={() => setPlaying(!playing)}
              className="h-14 w-14 rounded-full bg-red-600 border-2 border-black text-black flex items-center justify-center font-black text-lg transition hover:scale-105 active:scale-95 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              {playing ? "⏸" : "▶"}
            </button>

            <button onClick={playNext} className="text-sm text-white font-bold transition hover:opacity-80">
              NEXT
            </button>

            <button
              onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")}
              className={`text-base text-white transition rounded relative px-1 font-bold ${
                repeatMode !== "off" ? "font-black drop-shadow-[0_0_5px_white]" : "opacity-80 hover:opacity-100"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              🔁{repeatMode === "one" && <span className="absolute -top-1 -right-1 text-[7px] bg-white text-black rounded-full px-0.5 scale-75">1</span>}
            </button>
          </div>

          {/* VOLUME INTERACTION SLIDER CONTROLLER */}
          <div className="flex items-center gap-3 pt-1 px-2">
            <button onClick={() => setMuted(!isMuted)} className="text-base text-white transition hover:opacity-80">
              {isMuted || volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : "🔊"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setMuted(false);
              }}
              className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}

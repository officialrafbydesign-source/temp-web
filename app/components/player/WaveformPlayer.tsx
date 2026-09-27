"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function WaveformPlayer({ audioUrl }: { audioUrl: string }) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<any>(null);

  useEffect(() => {

    if (!containerRef.current) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#aa0000",
      progressColor: "#ff0000",
      height: 80,
      barWidth: 3,
    });

    waveRef.current.load(audioUrl);

    return () => {
      waveRef.current.destroy();
    };

  }, [audioUrl]);

  return (
    <div className="space-y-4">

      <div ref={containerRef} />

      <button
        onClick={() => waveRef.current.playPause()}
        className="ui-btn"
      >
        Play / Pause
      </button>

    </div>
  );
}
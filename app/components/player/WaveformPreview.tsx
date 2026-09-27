"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

type Props = {
  audioUrl?: string;
  autoPlay?: boolean;
};

export default function WaveformPreview({ audioUrl, autoPlay }: Props) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<any>(null);

  useEffect(() => {

    if (!containerRef.current || !audioUrl) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#770000",
      progressColor: "#ff0000",
      height: 60,
      barWidth: 2,
    });

    waveRef.current.load(audioUrl);

    return () => {
      waveRef.current?.destroy();
    };

  }, [audioUrl]);

  useEffect(() => {
    if (!waveRef.current) return;

    if (autoPlay) {
      waveRef.current.play();
    } else {
      waveRef.current.pause();
    }
  }, [autoPlay]);

  return <div ref={containerRef} className="w-full" />;
}
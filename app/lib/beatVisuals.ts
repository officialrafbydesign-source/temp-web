// app/lib/beatVisuals.ts

export type BeatVisual = {
  mascotSrc: string;
  plateColor: string;
};

const VISUALS: BeatVisual[] = [
  {
    // Red mascot → blue plate
    mascotSrc: "/images/mascotmonored.png",
    plateColor: "#0b3c5d", // deep contrasting blue
  },
  {
    // Black mascot → white plate
    mascotSrc: "/images/mascotmonoblack.png",
    plateColor: "#ffffff",
  },
  {
    // White mascot → dark grey plate
    mascotSrc: "/images/mascotmonowhite.png",
    plateColor: "#2a2a2a",
  },
  {
    // Yellow mascot → green plate
    mascotSrc: "/images/mascotmonoyellow.png",
    plateColor: "#1f6b3a", // rich contrasting green
  },
];

export function getBeatVisuals(index: number): BeatVisual {
  return VISUALS[index % VISUALS.length];
}

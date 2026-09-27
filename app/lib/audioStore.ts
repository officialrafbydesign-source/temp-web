import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  artwork: string;
  type: "beat" | "music" | "playlist";
}

interface AudioState {
  queue: Track[];
  shuffledQueue: Track[];
  currentIndex: number;
  playing: boolean;
  volume: number;
  isMuted: boolean;
  isDockExpanded: boolean;
  repeatMode: "off" | "all" | "one";
  isShuffleOn: boolean;
  activeTab: "beats" | "music" | "queue";

  // Navigation & Core Controls
  setQueue: (tracks: Track[], index?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playTrack: (track: Track) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentIndex: (index: number) => void;
  playNext: () => void;
  playPrev: () => void;

  // Audio Preferences
  setVolume: (vol: number) => void;
  setMuted: (muted: boolean) => void;
  setDockExpanded: (expanded: boolean) => void;
  setRepeatMode: (mode: "off" | "all" | "one") => void;
  toggleShuffle: () => void;
  setActiveTab: (tab: "beats" | "music" | "queue") => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      queue: [],
      shuffledQueue: [],
      currentIndex: -1,
      playing: false,
      volume: 0.8,
      isMuted: false,
      isDockExpanded: false,
      repeatMode: "off",
      isShuffleOn: false,
      activeTab: "beats",

      setQueue: (tracks, index = 0) => {
        const isShuffleOn = get().isShuffleOn;
        let shuffled = [...tracks];
        let targetIndex = index;

        if (isShuffleOn) {
          // Keep current playing track at front, shuffle remaining elements
          const current = tracks[index];
          const remaining = tracks.filter((_, i) => i !== index);
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          shuffled = current ? [current, ...remaining] : remaining;
          targetIndex = 0;
        }

        set({
          queue: tracks,
          shuffledQueue: shuffled,
          currentIndex: targetIndex,
          playing: true,
        });
      },

      addToQueue: (track) => {
        const { queue, shuffledQueue } = get();
        if (queue.some((t) => t.id === track.id)) return;
        set({
          queue: [...queue, track],
          shuffledQueue: [...shuffledQueue, track],
          currentIndex: queue.length === 0 ? 0 : get().currentIndex,
        });
      },

      removeFromQueue: (trackId) => {
        const { queue, shuffledQueue, currentIndex } = get();
        const activeQueue = get().isShuffleOn ? shuffledQueue : queue;
        const currentTrack = activeQueue[currentIndex];

        const nextQueue = queue.filter((t) => t.id !== trackId);
        const nextShuffled = shuffledQueue.filter((t) => t.id !== trackId);

        const newActiveQueue = get().isShuffleOn ? nextShuffled : nextQueue;
        let nextIndex = newActiveQueue.findIndex((t) => t.id === currentTrack?.id);
        if (nextIndex === -1) nextIndex = Math.max(0, currentIndex - 1);

        set({
          queue: nextQueue,
          shuffledQueue: nextShuffled,
          currentIndex: nextQueue.length === 0 ? -1 : nextIndex,
          playing: nextQueue.length === 0 ? false : get().playing,
        });
      },

      clearQueue: () => set({ queue: [], shuffledQueue: [], currentIndex: -1, playing: false }),

      playTrack: (track) => {
        const { queue, isShuffleOn } = get();
        const existingIndex = queue.findIndex((t) => t.id === track.id);

        if (existingIndex !== -1) {
          const activeQueue = isShuffleOn ? get().shuffledQueue : queue;
          const activeIndex = activeQueue.findIndex((t) => t.id === track.id);
          set({ currentIndex: activeIndex, playing: true });
        } else {
          const newQueue = [...queue, track];
          set({
            queue: newQueue,
            shuffledQueue: isShuffleOn ? [track, ...get().shuffledQueue] : newQueue,
            currentIndex: isShuffleOn ? 0 : newQueue.length - 1,
            playing: true,
          });
        }
      },

      setPlaying: (playing) => set({ playing }),
      setCurrentIndex: (currentIndex) => set({ currentIndex }),

      playNext: () => {
        const { currentIndex, queue, shuffledQueue, repeatMode, isShuffleOn } = get();
        const activeQueue = isShuffleOn ? shuffledQueue : queue;
        if (activeQueue.length === 0) return;

        if (repeatMode === "one") {
          // Force a small change trip to trigger audio element restart
          set({ playing: false });
          setTimeout(() => set({ playing: true }), 10);
          return;
        }

        let nextIndex = currentIndex + 1;
        if (nextIndex >= activeQueue.length) {
          if (repeatMode === "all") {
            nextIndex = 0;
          } else {
            set({ playing: false });
            return;
          }
        }
        set({ currentIndex: nextIndex, playing: true });
      },

      playPrev: () => {
        const { currentIndex, queue, shuffledQueue, repeatMode, isShuffleOn } = get();
        const activeQueue = isShuffleOn ? shuffledQueue : queue;
        if (activeQueue.length === 0) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          if (repeatMode === "all") {
            prevIndex = activeQueue.length - 1;
          } else {
            prevIndex = 0; // Boundary clamp
          }
        }
        set({ currentIndex: prevIndex, playing: true });
      },

      setVolume: (volume) => set({ volume }),
      setMuted: (isMuted) => set({ isMuted }),
      setDockExpanded: (isDockExpanded) => set({ isDockExpanded }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),

      toggleShuffle: () => {
        const { isShuffleOn, queue, currentIndex, shuffledQueue } = get();
        if (isShuffleOn) {
          // Re-indexing into natural layout
          const currentTrack = shuffledQueue[currentIndex];
          const naturalIndex = queue.findIndex((t) => t.id === currentTrack?.id);
          set({ isShuffleOn: false, currentIndex: naturalIndex >= 0 ? naturalIndex : 0 });
        } else {
          // Build random shuffle order
          const currentTrack = queue[currentIndex];
          const remaining = queue.filter((_, i) => i !== currentIndex);
          for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
          }
          const nextShuffled = currentTrack ? [currentTrack, ...remaining] : remaining;
          set({ isShuffleOn: true, shuffledQueue: nextShuffled, currentIndex: 0 });
        }
      },

      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "raf-audio-preferences",
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        isDockExpanded: state.isDockExpanded,
        repeatMode: state.repeatMode,
        isShuffleOn: state.isShuffleOn,
      }),
    }
  )
);
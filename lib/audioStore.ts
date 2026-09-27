import {
  create,
} from "zustand";

export type TrackType =
  | "beat"
  | "music";

export type Track = {
  url: string;
  title: string;
  artwork?: string;
  subtitle?: string;
  id?: string;
  type?: TrackType;
};

type RepeatMode =
  | "off"
  | "all"
  | "one";

type ActiveTab =
  | "beats"
  | "music"
  | "queue";

type AudioState = {
  queue: Track[];
  currentIndex: number;
  playing: boolean;
  volume: number;
  isMuted: boolean;
  isDockExpanded: boolean;
  repeatMode: RepeatMode;
  isShuffleOn: boolean;
  activeTab: ActiveTab;

  playTrack: (
    track: Track,
    customQueue?: Track[]
  ) => void;

  playNext: () => void;
  playPrev: () => void;
  pause: () => void;

  setPlaying: (
    playing: boolean
  ) => void;

  closeDock: () => void;

  setVolume: (
    volume: number
  ) => void;

  setMuted: (
    muted: boolean
  ) => void;

  setDockExpanded: (
    expanded: boolean
  ) => void;

  setRepeatMode: (
    mode: RepeatMode
  ) => void;

  toggleShuffle: () => void;

  setActiveTab: (
    tab: ActiveTab
  ) => void;

  removeFromQueue: (
    trackUrl: string
  ) => void;
};

export const useAudioStore =
  create<AudioState>(
    (set, get) => ({
      queue: [],
      currentIndex: 0,
      playing: false,
      volume: 0.8,
      isMuted: false,
      isDockExpanded: false,
      repeatMode: "off",
      isShuffleOn: false,
      activeTab: "queue",

      playTrack: (
        track,
        customQueue
      ) => {
        if (
          customQueue &&
          customQueue.length > 0
        ) {
          const index =
            customQueue.findIndex(
              (
                queueTrack
              ) =>
                queueTrack.url ===
                track.url
            );

          set({
            queue:
              customQueue,

            currentIndex:
              index === -1
                ? 0
                : index,

            playing:
              true,
          });

          return;
        }

        const {
          queue,
        } = get();

        const existingIndex =
          queue.findIndex(
            (
              queueTrack
            ) =>
              queueTrack.url ===
              track.url
          );

        if (
          existingIndex !== -1
        ) {
          set({
            currentIndex:
              existingIndex,

            playing:
              true,
          });

          return;
        }

        set({
          queue: [
            ...queue,
            track,
          ],

          currentIndex:
            queue.length,

          playing:
            true,
        });
      },

      playNext: () => {
        const {
          queue,
          currentIndex,
          repeatMode,
        } = get();

        if (
          queue.length === 0
        ) {
          return;
        }

        if (
          repeatMode ===
          "one"
        ) {
          set({
            playing:
              false,
          });

          window.setTimeout(
            () =>
              set({
                playing:
                  true,
              }),
            10
          );

          return;
        }

        let nextIndex =
          currentIndex + 1;

        if (
          nextIndex >=
          queue.length
        ) {
          if (
            repeatMode ===
            "all"
          ) {
            nextIndex = 0;
          } else {
            set({
              playing:
                false,
            });

            return;
          }
        }

        set({
          currentIndex:
            nextIndex,

          playing:
            true,
        });
      },

      playPrev: () => {
        const {
          queue,
          currentIndex,
          repeatMode,
        } = get();

        if (
          queue.length === 0
        ) {
          return;
        }

        let previousIndex =
          currentIndex - 1;

        if (
          previousIndex < 0
        ) {
          if (
            repeatMode ===
            "all"
          ) {
            previousIndex =
              queue.length -
              1;
          } else {
            previousIndex =
              0;
          }
        }

        set({
          currentIndex:
            previousIndex,

          playing:
            true,
        });
      },

      pause: () =>
        set({
          playing:
            false,
        }),

      setPlaying: (
        playing
      ) =>
        set({
          playing,
        }),

      closeDock: () =>
        set({
          queue: [],
          currentIndex: 0,
          playing: false,
          isDockExpanded:
            false,
          activeTab:
            "queue",
        }),

      setVolume: (
        volume
      ) =>
        set({
          volume:
            Math.min(
              1,
              Math.max(
                0,
                volume
              )
            ),
        }),

      setMuted: (
        isMuted
      ) =>
        set({
          isMuted,
        }),

      setDockExpanded: (
        isDockExpanded
      ) =>
        set({
          isDockExpanded,
        }),

      setRepeatMode: (
        repeatMode
      ) =>
        set({
          repeatMode,
        }),

      setActiveTab: (
        activeTab
      ) =>
        set({
          activeTab,
        }),

      toggleShuffle:
        () => {
          const {
            isShuffleOn,
            queue,
            currentIndex,
          } = get();

          if (
            queue.length <= 1
          ) {
            return;
          }

          if (
            isShuffleOn
          ) {
            set({
              isShuffleOn:
                false,
            });

            return;
          }

          const currentTrack =
            queue[
              currentIndex
            ];

          const remaining =
            queue.filter(
              (
                _track,
                index
              ) =>
                index !==
                currentIndex
            );

          for (
            let index =
              remaining.length -
              1;
            index > 0;
            index--
          ) {
            const randomIndex =
              Math.floor(
                Math.random() *
                  (index +
                    1)
              );

            [
              remaining[
                index
              ],
              remaining[
                randomIndex
              ],
            ] = [
              remaining[
                randomIndex
              ],
              remaining[
                index
              ],
            ];
          }

          set({
            queue:
              currentTrack
                ? [
                    currentTrack,
                    ...remaining,
                  ]
                : remaining,

            currentIndex:
              0,

            isShuffleOn:
              true,
          });
        },

      removeFromQueue: (
        trackUrl
      ) => {
        const {
          queue,
          currentIndex,
          playing,
        } = get();

        const currentTrack =
          queue[
            currentIndex
          ];

        const nextQueue =
          queue.filter(
            (track) =>
              track.url !==
              trackUrl
          );

        let nextIndex =
          nextQueue.findIndex(
            (track) =>
              track.url ===
              currentTrack?.url
          );

        if (
          nextIndex === -1
        ) {
          nextIndex =
            Math.max(
              0,
              currentIndex -
                1
            );
        }

        set({
          queue:
            nextQueue,

          currentIndex:
            nextQueue.length ===
            0
              ? 0
              : nextIndex,

          playing:
            nextQueue.length ===
            0
              ? false
              : playing,
        });
      },
    })
  );
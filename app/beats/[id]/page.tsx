"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  type Track,
  useAudioStore,
} from "@/lib/audioStore";

import PlaylistPanel from "@/components/player/PlaylistPanel";
import LicenseCard from "@/components/LicenseCard";
import FreeDownloadGate from "@/components/FreeDownloadGate";

import {
  Pause,
  Play,
} from "lucide-react";

const BEATS_BACKGROUND_IMG =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg";

function getLicenseKind(
  name: string
): "lease" | "exclusive" {
  return name
    .toLowerCase()
    .includes("exclu")
    ? "exclusive"
    : "lease";
}

type License = {
  id: string;
  name: string;
  price: number | string;
};

type Beat = {
  id: string;
  title: string;
  genre: string;
  artworkUrl?: string;
  audioUrl?: string;
  youtubeUrl?: string;
  freeDownload: boolean;
  bpm?: number;
  key?: string;
  licenses?: License[];
};

export default function BeatPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const id =
    params?.id as string;

  const [
    beat,
    setBeat,
  ] = useState<Beat | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    requestedLicense,
    setRequestedLicense,
  ] = useState<
    "lease" | "exclusive" | null
  >(null);

  const playTrack =
    useAudioStore(
      (state) =>
        state.playTrack
    );

  const playing =
    useAudioStore(
      (state) =>
        state.playing
    );

  const setPlaying =
    useAudioStore(
      (state) =>
        state.setPlaying
    );

  const queue =
    useAudioStore(
      (state) =>
        state.queue
    );

  const currentIndex =
    useAudioStore(
      (state) =>
        state.currentIndex
    );

  const currentTrack =
    queue[currentIndex];

  const isCurrentTrack =
    currentTrack?.id === id ||
    Boolean(
      beat?.audioUrl &&
        currentTrack?.url ===
          beat.audioUrl
    );

  const isPlaying =
    isCurrentTrack &&
    playing;

  useEffect(() => {
    async function fetchBeat() {
      try {
        const response =
          await fetch(
            `/api/beats/${encodeURIComponent(
              id
            )}`
          );

        if (!response.ok) {
          throw new Error(
            "Beat not found"
          );
        }

        const data =
          await response.json();

        setBeat(data);
      } catch (error) {
        console.error(
          "Failed to load beat:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBeat();
    }
  }, [id]);

  useEffect(() => {
    if (
      !beat ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const license =
      new URLSearchParams(
        window.location.search
      ).get("license");

    if (
      license === "lease" ||
      license ===
        "exclusive"
    ) {
      setRequestedLicense(
        license
      );

      window.setTimeout(
        () => {
          const target =
            document.querySelector(
              `[data-license-kind="${license}"]`
            );

          target?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "center",
          });
        },
        150
      );
    }
  }, [beat]);

  const beatsBackgroundStyle =
    {
      backgroundImage:
        `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.85)), url('${BEATS_BACKGROUND_IMG}')`,

      backgroundAttachment:
        "fixed",

      backgroundPosition:
        "center center",

      backgroundSize:
        "cover",
    } as const;

  if (loading) {
    return (
      <main
        className="min-h-screen text-white flex items-center justify-center"
        style={
          beatsBackgroundStyle
        }
      >
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />

          <p className="text-white/60">
            Loading beat...
          </p>
        </div>
      </main>
    );
  }

  if (!beat) {
    return (
      <main
        className="min-h-screen text-white flex items-center justify-center px-6"
        style={
          beatsBackgroundStyle
        }
      >
        <div className="max-w-md text-center space-y-5">
          <h1 className="text-3xl font-black">
            Beat not found
          </h1>

          <p className="text-white/60">
            This beat may have
            been removed or is
            temporarily
            unavailable.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/beats/store"
              )
            }
            className="rounded-full bg-red-600 px-6 py-3 font-bold hover:bg-red-500 transition"
          >
            Back to Beat Store
          </button>
        </div>
      </main>
    );
  }

  const artwork =
    beat.artworkUrl ||
    "/images/mascotmonored.png";

  const licenses =
    beat.licenses || [];

  const handleGlobalPlayToggle =
    () => {
      if (!beat.audioUrl) {
        return;
      }

      if (isCurrentTrack) {
        setPlaying(
          !playing
        );

        return;
      }

      const trackPayload: Track =
        {
          id:
            beat.id,

          title:
            beat.title,

          subtitle:
            `${beat.bpm || 140} BPM • ${
              beat.key ||
              "C Minor"
            } • ${beat.genre}`,

          url:
            beat.audioUrl,

          artwork,

          type:
            "beat",
        };

      playTrack(
        trackPayload
      );
    };

  return (
    <main
      className="min-h-screen text-white"
      style={
        beatsBackgroundStyle
      }
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 pb-20">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/beats/store"
            )
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition"
        >
          ← Back to Beat Store
        </button>

        <div className="grid xl:grid-cols-[1fr_340px] gap-8 lg:gap-10">
          <section className="space-y-8">
            <div className="grid lg:grid-cols-[430px_1fr] gap-8 items-start">
              <div className="sticky top-24">
                <div className="relative overflow-hidden rounded-[2rem] border border-red-500/40 bg-black/60 shadow-2xl shadow-red-950/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-black" />

                  <img
                    src={
                      artwork
                    }
                    alt={
                      beat.title
                    }
                    className="relative w-full aspect-square object-contain p-7 select-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-red-500/30 bg-black/55 p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                      Beat
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70">
                      {
                        beat.genre
                      }
                    </span>

                    {beat.freeDownload && (
                      <span className="rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold text-green-300">
                        Free Download
                        Available
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                    {
                      beat.title
                    }
                  </h1>

                  <p className="mt-4 max-w-xl text-white/60">
                    Preview the
                    beat, choose a
                    license, or
                    grab the free
                    download if
                    available.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    {beat.freeDownload &&
                      beat.audioUrl && (
                        <a
                          href="#free-download"
                          className="rounded-full border border-white/15 bg-white/10 px-6 py-3 font-black hover:bg-white/15 transition text-sm tracking-wide"
                        >
                          Free
                          Download
                        </a>
                      )}
                  </div>
                </div>

                {beat.audioUrl && (
                  <div className="rounded-[2rem] border border-red-500/30 bg-black/55 p-6 shadow-xl">
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-black">
                          Audio
                          Preview
                        </h2>

                        <p className="text-sm text-white/50 truncate">
                          {isPlaying
                            ? "Now streaming preview engine..."
                            : "Click to stream directly to global media bar."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleGlobalPlayToggle
                        }
                        aria-label={
                          isPlaying
                            ? "Pause beat preview"
                            : "Play beat preview"
                        }
                        className={`p-4 rounded-full border transition-all duration-200 active:scale-95 ${
                          isPlaying
                            ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            : "bg-white text-black border-white hover:bg-zinc-200"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {beat.youtubeUrl && (
                  <div className="rounded-[2rem] border border-red-500/30 bg-black/55 p-4 shadow-xl">
                    <iframe
                      title={`${beat.title} video`}
                      className="w-full aspect-video rounded-2xl"
                      src={
                        beat.youtubeUrl
                      }
                      allowFullScreen
                    />
                  </div>
                )}

                {beat.freeDownload &&
                  beat.audioUrl && (
                    <div
                      id="free-download"
                      className="rounded-[2rem] border border-red-500/30 bg-black/55 p-6 shadow-xl"
                    >
                      <div className="mb-5">
                        <h2 className="text-2xl font-black">
                          Free
                          Download
                        </h2>

                        <p className="mt-2 text-sm text-white/55">
                          Unlock a
                          free
                          version
                          of this
                          beat for
                          preview,
                          writing,
                          or
                          non-commercial
                          use.
                        </p>
                      </div>

                      <FreeDownloadGate
                        beatId={
                          beat.id
                        }
                        downloadUrl={
                          beat.audioUrl
                        }
                      />
                    </div>
                  )}
              </div>
            </div>

            <section
              id="licenses"
              className="rounded-[2rem] border border-red-500/30 bg-black/55 p-6 sm:p-8 shadow-xl"
            >
              <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-red-400 font-mono">
                    Licensing
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Available
                    Licenses
                  </h2>
                </div>

                <p className="max-w-md text-sm text-white/50">
                  Pick the
                  license that
                  fits your
                  release. You
                  can upgrade
                  later if your
                  project grows.
                </p>
              </div>

              {licenses.length >
              0 ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    {licenses.map(
                      (
                        license
                      ) => {
                        const licenseKind =
                          getLicenseKind(
                            license.name
                          );

                        return (
                          <div
                            key={
                              license.id
                            }
                            data-license-kind={
                              licenseKind
                            }
                            className={
                              requestedLicense ===
                              licenseKind
                                ? "rounded-[2rem] ring-4 ring-red-600 ring-offset-4 ring-offset-black/60"
                                : ""
                            }
                          >
                            <LicenseCard
                              beat={{
                                id:
                                  beat.id,

                                title:
                                  beat.title,

                                artworkUrl:
                                  beat.artworkUrl,
                              }}
                              license={
                                license
                              }
                              type={
                                licenseKind
                              }
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60 font-mono text-sm">
                  No licenses are
                  available for
                  this beat yet.
                </div>
              )}
            </section>
          </section>

          <aside className="xl:sticky xl:top-24 h-fit">
            <PlaylistPanel />
          </aside>
        </div>
      </div>
    </main>
  );
}
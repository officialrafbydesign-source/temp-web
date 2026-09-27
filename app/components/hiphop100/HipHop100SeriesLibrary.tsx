"use client";

import { useState } from "react";
import Link from "next/link";
import HipHop100Background from "@/components/hiphop100/HipHop100Background";

export type HipHop100Episode = {
  id: string;
  episodeLabel: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
};

export type HipHop100Series = {
  id: string;
  title: string;
  description: string;
  episodes: HipHop100Episode[];
};

type Props = {
  pageTitle: string;
  pageDescription: string;
  series: HipHop100Series[];
};

export default function HipHop100SeriesLibrary({
  pageTitle,
  pageDescription,
  series,
}: Props) {
  const [openSeriesId, setOpenSeriesId] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);

  function toggleSeries(seriesId: string) {
    setOpenSeriesId((current) => {
      const next = current === seriesId ? null : seriesId;

      if (next !== current) {
        setActiveEpisodeId(null);
      }

      return next;
    });
  }

  return (
    <main className="min-h-screen relative bg-black text-white overflow-hidden pt-24 pb-24">
      <HipHop100Background />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
        <Link
          href="/clothing/hiphop100"
          className="inline-flex px-4 py-2 bg-black/90 border-2 border-amber-400 rounded-lg font-mono text-xs font-black uppercase text-amber-400 hover:bg-amber-400 hover:text-black transition"
        >
          ← BACK TO HIPHOP100
        </Link>

        <section className="mt-6 bg-black/90 border-2 border-white rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="font-mono text-xs text-amber-400 font-black uppercase tracking-widest">
            HIPHOP100 MEDIA
          </p>

          <h1 className="font-hiphop100 text-4xl sm:text-6xl uppercase mt-1">
            {pageTitle}
          </h1>

          <p className="font-mono text-sm text-zinc-300 leading-7 mt-4 max-w-4xl mx-auto">
            {pageDescription}
          </p>
        </section>

        <div className="mt-8 space-y-6">
          {series.map((seriesItem) => {
            const isOpen = openSeriesId === seriesItem.id;
            const activeEpisode =
              seriesItem.episodes.find(
                (episode) => episode.id === activeEpisodeId
              ) || null;

            return (
              <section
                key={seriesItem.id}
                className="overflow-hidden rounded-2xl border-2 border-white/20 bg-black/90 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <button
                  type="button"
                  onClick={() => toggleSeries(seriesItem.id)}
                  className="w-full px-5 py-5 sm:px-7 sm:py-6 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-5">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                        Series
                      </p>

                      <h2 className="font-hiphop100 mt-1 text-3xl sm:text-4xl uppercase text-white">
                        {seriesItem.title}
                      </h2>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[10px] sm:text-xs font-black uppercase text-zinc-400">
                        {seriesItem.episodes.length} Episodes
                      </p>

                      <span className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-zinc-950 text-xl text-white">
                        {isOpen ? "⌃" : "⌄"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 min-h-[56px] max-w-5xl">
                    {seriesItem.description && (
                      <p className="font-mono text-sm leading-7 text-zinc-300">
                        {seriesItem.description}
                      </p>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 bg-[#090909] px-4 py-5 sm:px-6 sm:py-6">
                    {activeEpisode && (
                      <div className="mb-7 grid gap-5 rounded-2xl border border-white/10 bg-black p-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.4fr)]">
                        <div className="overflow-hidden rounded-xl bg-black">
                          <video
                            key={activeEpisode.id}
                            controls
                            preload="metadata"
                            playsInline
                            poster={activeEpisode.thumbnailUrl}
                            className="aspect-video w-full bg-black object-contain"
                          >
                            <source
                              src={activeEpisode.videoUrl}
                              type="video/mp4"
                            />
                            Your browser does not support video playback.
                          </video>
                        </div>

                        <div className="flex flex-col justify-center">
                          <p className="font-mono text-xs font-black uppercase tracking-widest text-amber-400">
                            {activeEpisode.episodeLabel}
                          </p>

                          <h3 className="font-hiphop100 mt-2 text-3xl uppercase text-white">
                            {activeEpisode.title}
                          </h3>

                          <p className="font-mono mt-3 text-sm leading-6 text-zinc-400">
                            {activeEpisode.subtitle}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {seriesItem.episodes.map((episode) => {
                        const selected = activeEpisodeId === episode.id;

                        return (
                          <button
                            key={episode.id}
                            type="button"
                            onClick={() => setActiveEpisodeId(episode.id)}
                            className={`group overflow-hidden rounded-xl border text-left transition ${
                              selected
                                ? "border-amber-400 bg-zinc-900"
                                : "border-white/10 bg-zinc-950 hover:border-white/35"
                            }`}
                          >
                            <div className="relative aspect-video overflow-hidden bg-black">
                              {episode.thumbnailUrl ? (
                                <img
                                  src={episode.thumbnailUrl}
                                  alt={episode.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover opacity-95 transition group-hover:scale-[1.02]"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-4 text-center">
                                  <span className="font-mono text-xs font-black uppercase tracking-wide text-zinc-400">
                                    THUMBNAIL COMING SOON
                                  </span>
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                              <span className="absolute left-3 top-3 rounded bg-black/80 px-2 py-1 font-mono text-xs font-black text-white">
                                {episode.episodeLabel}
                              </span>

                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/55 text-lg text-white backdrop-blur-sm">
                                  ▶
                                </span>
                              </span>
                            </div>

                            <div className="p-4">
                              <h3 className="line-clamp-2 font-mono text-sm font-black text-white">
                                {episode.title}
                              </h3>

                              <p className="mt-2 line-clamp-2 font-mono text-xs leading-5 text-zinc-400">
                                {episode.subtitle}
                              </p>

                              <p className="mt-3 font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
                                Select Episode
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

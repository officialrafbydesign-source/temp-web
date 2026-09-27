"use client";

import { useState } from "react";
import Link from "next/link";

export type RafShowcaseItem = {
  id: string;
  label?: string;
  title: string;
  subtitle?: string;
  description?: string;
  youtubeId?: string;
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  tags?: string[];
};

export type RafShowcaseCollection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  items: RafShowcaseItem[];
};

type Props = {
  collections: RafShowcaseCollection[];
};

export default function RafShowcaseLibrary({ collections }: Props) {
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(
    collections[0]?.id || null
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  function toggleCollection(collectionId: string) {
    setOpenCollectionId((current) => {
      const next = current === collectionId ? null : collectionId;

      if (next !== current) {
        setActiveItemId(null);
      }

      return next;
    });
  }

  return (
    <div className="space-y-6">
      {collections.map((collection) => {
        const isOpen = openCollectionId === collection.id;
        const activeItem =
          collection.items.find((item) => item.id === activeItemId) || null;

        return (
          <section
            key={collection.id}
            className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <button
                type="button"
                onClick={() => toggleCollection(collection.id)}
                className="flex-1 px-5 py-5 sm:px-7 sm:py-6 text-left transition hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] text-red-600">
                      {collection.eyebrow}
                    </p>

                    <h2 className="font-raf mt-1 text-3xl sm:text-4xl lg:text-5xl uppercase text-black">
                      {collection.title}
                    </h2>

                    <div className="mt-4 min-h-[52px] max-w-5xl">
                      <p className="font-mono text-xs sm:text-sm leading-6 text-zinc-600">
                        {collection.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] sm:text-xs font-black uppercase text-zinc-500">
                      {collection.items.length}{" "}
                      {collection.items.length === 1 ? "Item" : "Items"}
                    </p>

                    <span className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-black text-xl text-white">
                      {isOpen ? "⌃" : "⌄"}
                    </span>
                  </div>
                </div>
              </button>

              {collection.href && collection.hrefLabel && (
                <div className="flex items-center border-t-2 border-black bg-zinc-100 px-5 py-4 lg:w-[220px] lg:border-l-2 lg:border-t-0">
                  <Link
                    href={collection.href}
                    className="w-full rounded-lg border-2 border-black bg-black px-4 py-3 text-center font-mono text-[10px] font-black uppercase text-white transition hover:bg-red-600"
                  >
                    {collection.hrefLabel} →
                  </Link>
                </div>
              )}
            </div>

            {isOpen && (
              <div className="border-t-4 border-black bg-zinc-950 px-4 py-5 sm:px-6 sm:py-6">
                {activeItem && (
                  <SelectedProject item={activeItem} />
                )}

                {collection.items.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {collection.items.map((item) => {
                      const selected = activeItemId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveItemId(item.id)}
                          className={`group overflow-hidden rounded-xl border-2 text-left transition ${
                            selected
                              ? "border-red-500 bg-zinc-900"
                              : "border-white/10 bg-black hover:border-white/40"
                          }`}
                        >
                          <ProjectThumbnail item={item} />

                          <div className="p-4">
                            {item.label && (
                              <p className="font-mono text-[10px] font-black uppercase tracking-widest text-red-500">
                                {item.label}
                              </p>
                            )}

                            <h3 className="mt-1 line-clamp-2 font-mono text-sm font-black uppercase text-white">
                              {item.title}
                            </h3>

                            {item.subtitle && (
                              <p className="mt-2 line-clamp-2 font-mono text-xs leading-5 text-zinc-400">
                                {item.subtitle}
                              </p>
                            )}

                            <p className="mt-3 font-mono text-[10px] font-black uppercase tracking-widest text-red-500">
                              View Project
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 bg-black p-7 text-center">
                    <p className="font-mono text-xs font-black uppercase text-zinc-500">
                      Portfolio items will be added here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SelectedProject({ item }: { item: RafShowcaseItem }) {
  return (
    <div className="mb-7 grid gap-5 rounded-2xl border-2 border-white/10 bg-black p-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.45fr)]">
      <div className="overflow-hidden rounded-xl bg-zinc-950">
        {item.youtubeId ? (
          <iframe
            key={item.id}
            src={`https://www.youtube.com/embed/${item.youtubeId}`}
            title={item.title}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : item.videoUrl ? (
          <video
            key={item.id}
            controls
            preload="metadata"
            playsInline
            className="aspect-video w-full bg-black object-contain"
          >
            <source src={item.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        ) : item.audioUrl ? (
          <div className="flex min-h-[260px] items-center justify-center p-6">
            <audio key={item.id} controls className="w-full max-w-2xl">
              <source src={item.audioUrl} />
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-video w-full object-contain"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-zinc-900 p-8 text-center">
            <p className="font-mono text-xs font-black uppercase tracking-widest text-zinc-500">
              Media / Project Preview To Be Added
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center p-2 sm:p-4">
        {item.label && (
          <p className="font-mono text-xs font-black uppercase tracking-widest text-red-500">
            {item.label}
          </p>
        )}

        <h3 className="font-raf mt-2 text-3xl sm:text-4xl uppercase text-white">
          {item.title}
        </h3>

        {item.subtitle && (
          <p className="font-mono mt-3 text-sm leading-6 text-zinc-400">
            {item.subtitle}
          </p>
        )}

        {item.description && (
          <p className="font-mono mt-4 border-t border-white/10 pt-4 text-xs leading-6 text-zinc-300">
            {item.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-white/15 bg-zinc-900 px-2.5 py-1 font-mono text-[9px] font-black uppercase text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectThumbnail({ item }: { item: RafShowcaseItem }) {
  if (item.youtubeId) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <img
          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
        />
        <ThumbnailOverlay />
      </div>
    );
  }

  if (item.videoUrl) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          src={`${item.videoUrl}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
        />
        <ThumbnailOverlay />
      </div>
    );
  }

  if (item.imageUrl) {
    return (
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
        />
        <ThumbnailOverlay />
      </div>
    );
  }

  if (item.audioUrl) {
    return (
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
        <span className="font-raf text-4xl text-white/75">AUDIO</span>
        <ThumbnailOverlay />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-800 to-black p-4 text-center">
      <p className="font-mono text-[10px] font-black uppercase tracking-widest text-white/40">
        Project Preview Pending
      </p>
    </div>
  );
}

function ThumbnailOverlay() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/55 text-lg text-white backdrop-blur-sm">
          ▶
        </span>
      </span>
    </>
  );
}

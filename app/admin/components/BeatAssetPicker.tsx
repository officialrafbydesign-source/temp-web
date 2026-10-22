"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BeatAssetFolder, BeatAssetImage, BeatAssetPage } from "@/lib/beatAssetImages";

const pages = new Map<string, { expires: number; data: BeatAssetPage }>();
const requests = new Map<string, Promise<BeatAssetPage>>();
export async function loadBeatAssetPage(folder: BeatAssetFolder, nextCursor = "", refresh = false): Promise<BeatAssetPage> {
  const key = `${folder}:${nextCursor}`;
  if (refresh) for (const existing of pages.keys()) if (existing.startsWith(`${folder}:`)) pages.delete(existing);
  const cached = pages.get(key);
  if (!refresh && cached && cached.expires > Date.now()) return cached.data;
  const active = requests.get(key);
  if (active) return active;
  const task = (async () => {
    const params = new URLSearchParams({ folder });
    if (nextCursor) {
      const separator = nextCursor.indexOf(":");
      params.set("mode", nextCursor.slice(0, separator));
      params.set("cursor", nextCursor.slice(separator + 1));
    }
    if (refresh) params.set("refresh", "1");
    const response = await fetch(`/api/admin/beats/assets?${params}`, { credentials: "include", cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.images)) throw new Error(data.error || "Unable to load image choices.");
    pages.set(key, { data, expires: Date.now() + 5 * 60000 });
    return data as BeatAssetPage;
  })();
  requests.set(key, task);
  try { return await task; } finally { requests.delete(key); }
}

export default function BeatAssetPicker({ initialFolder, title, currentValue, onChoose, onClose, onFullLibrary }: {
  initialFolder: BeatAssetFolder; title: string; currentValue?: string;
  onChoose: (url: string) => void; onClose: () => void; onFullLibrary: (path: string) => void;
}) {
  const [folder, setFolder] = useState(initialFolder);
  const [images, setImages] = useState<BeatAssetImage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [path, setPath] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  async function load(cursor = "", refresh = false) {
    const ticket = ++generation.current;
    setBusy(true); setError("");
    try {
      const data = await loadBeatAssetPage(folder, cursor, refresh);
      if (ticket !== generation.current) return;
      setImages((current) => cursor ? [...new Map([...current, ...data.images].map((image) => [image.id, image])).values()] : data.images);
      setNextCursor(data.nextCursor); setPath(data.folderPath);
    } catch (error) {
      if (ticket === generation.current) setError(error instanceof Error ? error.message : "Unable to load images.");
    } finally { if (ticket === generation.current) setBusy(false); }
  }
  useEffect(() => {
    setImages([]); setNextCursor(null); setPath(""); setQuery("");
    void load();
    return () => { generation.current++; };
  }, [folder]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const matches = images.filter((image) => `${image.name} ${image.publicId}`.toLowerCase().includes(query.trim().toLowerCase()));
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); onClose(); }
          if (event.key === "Tab") {
            const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href]') || []);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }} className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-2xl outline-none">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-xs text-zinc-600">Click an image to use it. Save the beat changes when you finish.</p></div>
          <button type="button" onClick={onClose} aria-label="Close image choices" className="rounded-lg border px-3 py-2 font-bold">Close</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b bg-zinc-50 p-4">
          {(["backgrounds", "logos"] as const).map((key) => <button type="button" key={key} aria-pressed={folder === key}
            onClick={() => setFolder(key)} className={`rounded-lg px-4 py-2 text-sm font-bold ${folder === key ? "bg-zinc-900 text-white" : "border border-zinc-300 bg-white"}`}>{key === "backgrounds" ? "Background Beats" : "Logos"}</button>)}
          <label className="min-w-0 flex-1 basis-48 text-xs font-bold"><span className="sr-only">Search loaded images</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search loaded images" className="w-full rounded-lg border border-zinc-300 p-2 text-sm font-normal" /></label>
          <button type="button" disabled={busy} onClick={() => void load("", true)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Refresh folder</button>
        </div>
        <div className="min-h-32 overflow-y-auto p-4" aria-busy={busy}>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {!busy && !error && !matches.length && <p className="py-8 text-center text-sm text-zinc-600">{images.length ? "No matching loaded images." : `No public images found in ${path || (folder === "backgrounds" ? "Background Beats" : "Logos")}. Check the folder name in Cloudinary or use the full library.`}</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {matches.map((image) => <button type="button" key={image.id} onClick={() => onChoose(image.url)} aria-label={`Use ${image.name}`}
              aria-pressed={currentValue === image.url} className={`min-w-0 rounded-xl border-2 p-2 text-left hover:border-emerald-600 focus-visible:outline-emerald-700 ${currentValue === image.url ? "border-emerald-600 bg-emerald-50" : "border-zinc-200"}`}>
              <div className="flex h-28 items-center justify-center rounded-lg bg-zinc-200"><img src={image.thumbnail} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" onError={(event) => { if (event.currentTarget.src !== image.url) event.currentTarget.src = image.url; }} /></div>
              <p className="mt-2 break-words text-xs font-bold">{image.name}</p>
              {currentValue === image.url && <span className="text-xs text-emerald-800">Current image</span>}
            </button>)}
          </div>
          {busy && <p role="status" className="py-6 text-center text-sm text-zinc-600">Loading images...</p>}
          {nextCursor && <button type="button" disabled={busy} onClick={() => void load(nextCursor)} className="mt-4 w-full rounded-lg border border-zinc-300 p-3 text-sm font-bold disabled:opacity-40">Load more images</button>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-zinc-50 p-4 text-xs text-zinc-600">
          <p>{images.length} image(s) loaded{nextCursor ? " · More available" : ""}</p>
          <button type="button" onClick={() => onFullLibrary(path || (folder === "backgrounds" ? "Background Beats" : "Logos"))} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-bold text-zinc-900">Open full Cloudinary library</button>
        </div>
      </div>
    </div>, document.body);
}

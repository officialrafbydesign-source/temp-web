"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { videoEmbedUrl, type HubExtra } from "@/lib/musicHub";

function ExtraCard({ item, returnTo }: { item: HubExtra; returnTo: string }) {
  const [loadVideo, setLoadVideo] = useState(false);
  const embed = item.url ? videoEmbedUrl(item.url) : null;
  const accessLabel = item.access === "public" ? "Free" : item.access === "members" ? "Free for members" : "Included with release";
  return <article className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/90">
    {item.previewImageUrl && <img src={item.previewImageUrl} alt="" loading="lazy" className="aspect-video w-full object-cover" />}
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/10 px-3 py-1">{accessLabel}</span>{item.rafOnly && <span className="rounded-full bg-emerald-400 px-3 py-1 text-black">Only on RAF</span>}</div>
      {item.seriesTitle && <p className="mt-4 text-sm font-bold text-emerald-300">{item.seriesTitle}{item.episodeNo ? ` · Episode ${item.episodeNo}` : ""}</p>}
      <h3 className="mt-3 text-2xl font-black">{item.title}</h3>
      {item.description && <p className="mt-3 whitespace-pre-line leading-7 text-zinc-300">{item.description}</p>}
      {item.allowed && item.url ? <div className="mt-5">
        {(item.kind === "video" || item.kind === "episode") && (embed ? (
          loadVideo ? <iframe title={item.title} src={embed} className="aspect-video w-full rounded-lg border-0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button type="button" onClick={() => setLoadVideo(true)} className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-5 py-6 text-left"><span className="font-bold text-emerald-300">Play video →</span><span className="mt-1 block text-xs text-zinc-400">Loads the external video player when selected.</span></button>
        ) : <video controls preload="none" poster={item.previewImageUrl || undefined} src={item.url} className="max-h-[650px] w-full rounded-lg" />)}
        {item.kind === "audio" && <audio controls preload="none" src={item.url} className="w-full" aria-label={item.title} />}
        {item.kind === "artwork" && <a href={item.url} target="_blank" rel="noopener noreferrer" className="block"><img src={item.url} alt={item.title} loading="lazy" className="max-h-[700px] w-full rounded-lg object-contain" /><span className="mt-3 inline-block font-bold text-emerald-300 underline">Open artwork ↗</span></a>}
        {item.kind === "download" && <a href={item.url} className="inline-flex rounded-full bg-emerald-400 px-5 py-3 font-bold text-black">Download</a>}
      </div> : <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-zinc-300">{item.access === "members" ? "Sign in with a verified account to access this free extra." : "Available with the full release. Sign in using the account or email used for your purchase."}</p>
        {item.signedIn ? (item.access === "members" ? <Link className="mt-3 inline-block font-bold text-emerald-300 underline" href="/resend-verification">Verify your email</Link> : item.releaseId && <Link className="mt-3 inline-block font-bold text-emerald-300 underline" href={`/music/${encodeURIComponent(item.releaseId)}`}>View release →</Link>) : <div className="mt-3 flex flex-wrap gap-4"><Link className="font-bold text-emerald-300 underline" href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link><Link className="font-bold text-white underline" href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>Create free account</Link></div>}
      </div>}
      {item.releaseId && item.releaseTitle && <Link href={`/music/${encodeURIComponent(item.releaseId)}`} className="mt-5 inline-block text-sm text-zinc-400 underline">From {item.releaseTitle}</Link>}
    </div>
  </article>;
}

export default function MusicExtras({ releaseId, artistId, initialItems, returnTo, title = "Explore more" }: { releaseId?: string; artistId?: string; initialItems?: HubExtra[]; returnTo: string; title?: string }) {
  const [items, setItems] = useState<HubExtra[]>(initialItems || []);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("All");
  useEffect(() => {
    if (initialItems) { setItems(initialItems); return; }
    const controller = new AbortController();
    const query = new URLSearchParams(releaseId ? { releaseId } : { artistId: artistId || "" });
    fetch(`/api/music/extras?${query}`, { cache: "no-store", signal: controller.signal }).then(async response => { if (!response.ok) throw new Error(); setItems(await response.json()); }).catch(error => { if (error.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [releaseId, artistId, initialItems]);
  if (error) return <p role="alert" className="mt-8 text-zinc-400">Additional content could not be loaded. Refresh to try again.</p>;
  if (!items.length) return null;
  const groups = ["All", ...Array.from(new Set(items.map(item => item.seriesTitle || (item.kind === "episode" ? "Episodes" : item.kind === "video" ? "Videos" : item.kind === "audio" ? "Audio" : item.kind === "artwork" ? "Artwork" : "Downloads"))))];
  const visible = filter === "All" ? items : items.filter(item => (item.seriesTitle || (item.kind === "episode" ? "Episodes" : item.kind === "video" ? "Videos" : item.kind === "audio" ? "Audio" : item.kind === "artwork" ? "Artwork" : "Downloads")) === filter);
  return <section className="mt-12" aria-label={title}>
    <h2 className="font-raf text-3xl uppercase sm:text-4xl">{title}</h2>
    {groups.length > 2 && <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter content">{groups.map(group => <button key={group} type="button" onClick={() => setFilter(group)} aria-pressed={filter === group} className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === group ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/20 bg-black text-white"}`}>{group}</button>)}</div>}
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">{visible.map(item => <ExtraCard key={item.id} item={item} returnTo={returnTo} />)}</div>
  </section>;
}

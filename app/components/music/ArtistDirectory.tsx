"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Artist = { id: string; name: string; slug: string | null; imageUrl: string | null; biography: string | null; releaseCount: number };
export default function ArtistDirectory({ compact = false }: { compact?: boolean }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/music/artists", { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error();
      setArtists(await response.json()); setStatus("ready");
    }).catch(error => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);
  const visible = artists.filter(artist => artist.name.toLowerCase().includes(query.trim().toLowerCase()));
  if (compact && status === "ready" && !artists.length) return null;
  return <section aria-labelledby={compact ? "shop-artists" : "artists-heading"} className="rounded-2xl border border-emerald-500/25 bg-black/80 p-5 sm:p-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Music, films &amp; more</p><h2 id={compact ? "shop-artists" : "artists-heading"} className="mt-2 font-raf text-3xl uppercase sm:text-4xl">Explore artists</h2></div>
      {compact ? <Link href="/music/artists" className="font-bold text-emerald-300 underline underline-offset-4">All artists →</Link> : <label className="text-sm">Find an artist<input value={query} onChange={event => setQuery(event.target.value)} className="mt-1 block w-full rounded-lg border border-white/25 bg-zinc-950 px-4 py-2" type="search" /></label>}
    </div>
    {status === "loading" && <p role="status" className="mt-5 text-zinc-400">Loading artists…</p>}
    {status === "error" && <p role="alert" className="mt-5 text-zinc-300">Artists could not be loaded. Please refresh to try again.</p>}
    {status === "ready" && !visible.length && <p className="mt-5 text-zinc-400">{query ? "No artists match your search." : "Artist pages are coming soon."}</p>}
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {(compact ? visible.slice(0, 4) : visible).map(artist => <Link key={artist.id} href={`/music/artists/${encodeURIComponent(artist.slug || artist.id)}`} className="group overflow-hidden rounded-xl border border-white/15 bg-zinc-950 transition hover:border-emerald-400 focus-visible:outline-emerald-300">
        {artist.imageUrl ? <img src={artist.imageUrl} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-emerald-950/40 font-raf text-5xl text-emerald-300">{artist.name.slice(0, 2)}</div>}
        <div className="p-4"><h3 className="text-xl font-black group-hover:text-emerald-300">{artist.name}</h3><p className="mt-1 text-sm text-zinc-400">{artist.releaseCount} {artist.releaseCount === 1 ? "release" : "releases"}</p></div>
      </Link>)}
    </div>
  </section>;
}

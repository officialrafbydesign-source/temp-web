"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAudioStore } from "@/lib/audioStore";
import { musicTrackPath } from "@/lib/musicTrackLinks";
import { musicFileSize, type MusicDownloadChoice } from "@/lib/musicDownloadFiles";

export type TrackPageActionData = {
  id: string; title: string; audioUrl: string | null; artistName: string;
  price: number | null; sellIndividually: boolean;
  release: { id: string; title: string; coverUrl: string | null };
  product: { id: string; price: number; itemType: string; stock: number | null };
};
type Access = { signedIn: boolean; owned: boolean; downloadHref: string | null; releaseDownloadHref: string | null; trackDownloads?: MusicDownloadChoice[]; releaseDownloads?: MusicDownloadChoice[]; ownsRelease?: boolean };
const gbp = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
const button = "inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-base font-bold";

export default function TrackPageActions({ track }: { track: TrackPageActionData }) {
  const { addToCart } = useCart();
  const playTrack = useAudioStore(state => state.playTrack);
  const pause = useAudioStore(state => state.pause);
  const isPlaying = useAudioStore(state => state.playing && state.queue[state.currentIndex]?.url === track.audioUrl);
  const [access, setAccess] = useState<Access | null>(null);
  const [accessError, setAccessError] = useState(false);
  const [added, setAdded] = useState("");
  const trackPurchase = track.sellIndividually && Number(track.price) > 0;
  const physical = track.product.itemType.toUpperCase() === "PHYSICAL";
  const releaseAvailable = !physical || Number(track.product.stock) > 0;

  useEffect(() => {
    const controller = new AbortController();
    setAccess(null); setAccessError(false); setAdded("");
    fetch(`/api/music/tracks/${encodeURIComponent(track.id)}/access`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to check downloads");
        setAccess(await response.json());
      }).catch(error => { if (error.name !== "AbortError") setAccessError(true); });
    return () => controller.abort();
  }, [track.id]);

  function play() {
    if (!track.audioUrl) return;
    if (isPlaying) { pause(); return; }
    const item = { id: track.id, type: "music" as const, url: track.audioUrl, title: track.title, subtitle: track.artistName, artwork: track.release.coverUrl || undefined };
    playTrack(item, [item]);
  }

  function buyTrack() {
    if (!trackPurchase) return;
    addToCart({ id: track.id, type: "music", title: `${track.title} — ${track.release.title}`, price: Number(track.price), quantity: 1, image: track.release.coverUrl || undefined, musicProductId: track.product.id, releaseId: track.release.id, songId: track.id, purchaseType: "track" });
    setAdded("Track added to your cart.");
  }

  function buyRelease() {
    if (!releaseAvailable) return;
    addToCart({ id: track.product.id, type: "music", title: track.release.title, price: track.product.price, quantity: 1, image: track.release.coverUrl || undefined, itemType: track.product.itemType });
    setAdded("Release added to your cart.");
  }

  return <div className="mt-7 space-y-6">
    <section aria-label="Play this track" className="space-y-3">
      <button type="button" onClick={play} disabled={!track.audioUrl} aria-pressed={isPlaying} className={`${button} w-full border border-white/25 bg-white/10 hover:bg-white/15 disabled:opacity-50 sm:w-auto`}>
        {isPlaying ? "Pause" : "Play track"}
      </button>
      {!track.audioUrl && <p className="text-sm text-zinc-400">Audio has not been added yet.</p>}
    </section>

    <section aria-label="Buy and download" className="space-y-4 border-t border-white/15 pt-6">
      <h2 className="text-xl font-bold">Buy &amp; download</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {access?.trackDownloads?.map(file => <a key={file.format} href={file.url} className={`${button} bg-emerald-400 text-black hover:bg-emerald-300`}>Download {file.label}{file.bytes ? ` · ${musicFileSize(file.bytes)}` : ""}</a>)}
        {access?.releaseDownloads?.map(file => <a key={file.format} href={file.url} className={`${button} border border-emerald-400/50 text-emerald-200 hover:bg-emerald-950`}>Download {file.label}{file.bytes ? ` · ${musicFileSize(file.bytes)}` : ""}</a>)}
        {!access?.owned && trackPurchase && <button type="button" onClick={buyTrack} className={`${button} bg-emerald-400 text-black hover:bg-emerald-300`}>Buy track · {gbp(Number(track.price))}</button>}
        {!access?.ownsRelease && <button type="button" onClick={buyRelease} disabled={!releaseAvailable} className={`${button} border border-white/25 hover:bg-white/10 disabled:opacity-50`}>
          {!releaseAvailable ? "Physical release out of stock" : `${physical ? "Buy physical release" : "Buy full release"} · ${gbp(track.product.price)}`}
        </button>}
      </div>
      {!trackPurchase && !access?.owned && <p className="text-sm leading-6 text-zinc-300">This track is available with the full release.</p>}
      {!access && !accessError && <p role="status" className="text-sm text-zinc-400">Checking your downloads…</p>}
      {access && !access.signedIn && <p className="text-sm leading-6 text-zinc-300">Already purchased? <Link href={`/login?returnTo=${encodeURIComponent(musicTrackPath(track.id))}`} className="font-bold text-emerald-200 underline underline-offset-4">Sign in to download</Link>.</p>}
      {access?.signedIn && !access.owned && <p className="text-sm leading-6 text-zinc-300">After checkout, your downloads are available here and in your account.</p>}
      {access?.owned && !access.trackDownloads?.length && !access.releaseDownloads?.length && <p role="status" className="text-sm leading-6 text-zinc-300">Your purchase is recorded. The download file has not been added yet. <Link href="/account/orders" className="underline">View your order</Link>.</p>}
      {accessError && <p role="status" className="text-sm leading-6 text-zinc-300">Your downloads could not be checked. <Link href="/account/orders" className="font-bold text-emerald-200 underline">Open your account</Link> or reload this page.</p>}
      {added && <p role="status" className="text-base text-emerald-200">{added} <Link href="/cart" className="font-bold underline">Go to checkout</Link></p>}
    </section>
  </div>;
}

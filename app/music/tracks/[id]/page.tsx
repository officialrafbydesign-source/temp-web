import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MusicHubFrame from "@/components/music/MusicHubFrame";
import TrackPageActions from "@/components/music/TrackPageActions";
import TrackShareLinks from "@/components/music/TrackShareLinks";
import { getPublicMusicTrack } from "@/lib/musicTracksServer";
import { hubLinks } from "@/lib/musicHub";
import { MUSIC_SITE_ORIGIN, musicTrackUrl } from "@/lib/musicTrackLinks";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ download?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const track = await getPublicMusicTrack(id);
  if (!track) return { title: "Track unavailable | RAF By Design", robots: { index: false, follow: false } };
  const title = `${track.title} — ${track.artist.name}`;
  const description = `Listen to ${track.title} by ${track.artist.name}, from ${track.release.title}. Play the track and find available purchase and download options at RAF By Design.`;
  const url = musicTrackUrl(track.id);
  const images = track.release.coverUrl ? [{ url: new URL(track.release.coverUrl, MUSIC_SITE_ORIGIN).href, alt: `${track.release.title} artwork` }] : [];
  return {
    title: `${title} | RAF By Design`, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "RAF By Design", type: "music.song", images },
    twitter: { card: "summary_large_image", title, description, images: images.map(image => image.url) },
  };
}

export default async function MusicTrackPage({ params, searchParams }: Props) {
  const { id } = await params;
  const track = await getPublicMusicTrack(id);
  if (!track?.release.product) notFound();
  const product = track.release.product;
  const { download } = await searchParams;
  const downloadMessage = download === "purchase-required" ? "Sign in with the account used for your purchase, or buy this track below."
    : download === "pending" ? "Your purchase is recorded, but the download file is not available yet."
    : download === "unavailable" ? "The download could not be prepared. Please try again or open your account." : "";
  const links = hubLinks(track.release.standardLinks);
  const artist = track.artist;
  const releaseHref = `/music/${encodeURIComponent(track.release.id)}`;
  const duration = track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}` : null;

  return <MusicHubFrame>
    <nav aria-label="Music navigation" className="mb-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-300">
      <Link href="/music" className="underline underline-offset-4 hover:text-white">Music shop</Link>
      <Link href={releaseHref} className="underline underline-offset-4 hover:text-white">{track.release.title}</Link>
    </nav>
    <article className="mx-auto grid max-w-5xl items-start gap-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="mx-auto w-full max-w-[10rem] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 sm:max-w-xs md:max-w-md">
        {track.release.coverUrl ? <img src={track.release.coverUrl} alt={`${track.release.title} artwork`} className="aspect-square w-full object-cover" />
          : <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-emerald-950 to-black text-7xl text-emerald-300" aria-label="No artwork added">♪</div>}
      </div>
      <div className="min-w-0 rounded-2xl border border-emerald-400/25 bg-black/75 p-5 sm:p-7">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Track</p>
        <h1 className="mt-3 break-words text-3xl font-black leading-tight sm:text-5xl">{track.title}</h1>
        <p className="mt-3 text-xl text-zinc-300">{artist.isProfilePublished
          ? <Link href={`/music/artists/${encodeURIComponent(artist.slug || artist.id)}`} className="underline underline-offset-4 hover:text-emerald-200">{artist.name}</Link>
          : artist.name}</p>
        <p className="mt-3 text-base leading-7 text-zinc-400">From <Link href={releaseHref} className="text-zinc-200 underline underline-offset-4">{track.release.title}</Link>{duration ? ` · ${duration}` : ""}</p>
        {downloadMessage && <p role="status" className="mt-5 rounded-lg border border-amber-300/40 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">{downloadMessage}</p>}
        <TrackPageActions track={{ id: track.id, title: track.title, audioUrl: track.audioUrl, artistName: artist.name, price: track.price, sellIndividually: track.sellIndividually, release: { id: track.release.id, title: track.release.title, coverUrl: track.release.coverUrl }, product }} />
        {links.length > 0 && <nav aria-label="Other listening options" className="mt-7 border-t border-white/15 pt-6">
          <h2 className="text-base font-bold">{track.release._count.songs === 1 ? "Listen / watch elsewhere" : "Listen to the full release elsewhere"}</h2>
          <div className="mt-3 flex flex-wrap gap-3">{links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/25 px-4 py-3 text-sm font-bold hover:border-emerald-300">{link.label}</a>)}</div>
        </nav>}
        <div className="mt-7 border-t border-white/15 pt-6">
          <h2 className="mb-3 text-base font-bold">Share this track</h2>
          <TrackShareLinks id={track.id} />
        </div>
      </div>
    </article>
  </MusicHubFrame>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { hubLinks } from "@/lib/musicHub";
import { getHubExtras, PUBLIC_ARTIST_SELECT } from "@/lib/musicHubServer";
import MusicHubFrame from "@/components/music/MusicHubFrame";
import MusicExtras from "@/components/music/MusicExtras";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
async function findArtist(slug: string) {
  return prisma.artist.findFirst({ where: { isProfilePublished: true, OR: [{ id: slug }, { slug }] }, select: PUBLIC_ARTIST_SELECT });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await findArtist((await params).slug);
  return { title: artist ? `${artist.name} | RAF By Design` : "Artist | RAF By Design", description: artist?.biography?.slice(0, 160) || "Music, videos and releases on RAF By Design." };
}
export default async function ArtistPage({ params }: Props) {
  const artist = await findArtist((await params).slug);
  if (!artist) notFound();
  const [releases, extras] = await Promise.all([
    prisma.release.findMany({ where: { artistId: artist.id, product: { is: PUBLIC_CATALOGUE_WHERE } }, select: { id: true, title: true, type: true, coverUrl: true, releaseDate: true, product: { select: { price: true } } }, orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }] }),
    getHubExtras({ artistId: artist.id }),
  ]);
  const links = hubLinks(artist.links);
  const profileImage = artist.imageUrl || releases.find(release => release.coverUrl)?.coverUrl;
  return <MusicHubFrame>
    <Link href="/music/artists" className="mb-7 inline-block font-bold text-emerald-300">← All artists</Link>
    <header className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-black/85">
      {artist.bannerUrl && <img src={artist.bannerUrl} alt="" className="max-h-80 w-full object-cover" />}
      <div className="grid gap-6 p-6 sm:p-9 md:grid-cols-[190px_1fr]">
        {profileImage ? <img src={profileImage} alt={artist.name} className="aspect-square w-full max-w-[190px] rounded-2xl object-cover" /> : <div className="flex aspect-square w-full max-w-[190px] items-center justify-center rounded-2xl bg-emerald-950/50 font-raf text-6xl text-emerald-300">{artist.name.slice(0, 2)}</div>}
        <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">RAF By Design · Artist</p><h1 className="mt-3 font-raf text-5xl uppercase sm:text-7xl">{artist.name}</h1>{artist.biography && <p className="mt-5 max-w-3xl whitespace-pre-line leading-8 text-zinc-300">{artist.biography}</p>}
          <nav aria-label={`${artist.name} links`} className="mt-5 flex flex-wrap gap-3">{links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:border-emerald-400">{link.label} ↗</a>)}</nav>
        </div>
      </div>
    </header>
    <section className="mt-12" aria-labelledby="artist-releases"><h2 id="artist-releases" className="font-raf text-3xl uppercase sm:text-4xl">Music &amp; releases</h2>
      {releases.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{releases.map(release => <Link key={release.id} href={`/music/${encodeURIComponent(release.id)}`} className="group overflow-hidden rounded-xl border border-white/15 bg-black/80 hover:border-emerald-400">
        {release.coverUrl ? <img src={release.coverUrl} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-emerald-950/50" />}
        <div className="p-4"><p className="text-xs font-bold uppercase text-emerald-400">{release.type}</p><h3 className="mt-2 text-lg font-black group-hover:text-emerald-300">{release.title}</h3><p className="mt-2 text-sm text-zinc-300">{Number(release.product?.price) === 0 ? "Free" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(release.product?.price || 0)}</p></div>
      </Link>)}</div> : <p className="mt-5 text-zinc-400">Releases will appear here when they are available.</p>}
    </section>
    <MusicExtras initialItems={extras} returnTo={`/music/artists/${encodeURIComponent(artist.slug || artist.id)}`} title="Videos, artwork & more" />
  </MusicHubFrame>;
}

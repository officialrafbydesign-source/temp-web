import type { Metadata } from "next";
import Link from "next/link";
import ArtistDirectory from "@/components/music/ArtistDirectory";
import MusicHubFrame from "@/components/music/MusicHubFrame";
export const metadata: Metadata = { title: "Artists | RAF By Design", description: "Explore music, videos and releases from artists working with RAF By Design." };
export default function ArtistsPage() {
  return <MusicHubFrame><Link href="/music" className="mb-7 inline-block font-bold text-emerald-300">← Music Shop</Link><ArtistDirectory /></MusicHubFrame>;
}

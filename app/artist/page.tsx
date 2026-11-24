import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import MusicHubFrame from "@/components/music/MusicHubFrame";
import ArtistWorkspace from "@/components/music/ArtistWorkspace";
export const dynamic = "force-dynamic";
export default async function ArtistDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=%2Fartist");
  return <MusicHubFrame><Link href="/account/orders" className="font-bold text-emerald-300">← My account</Link><h1 className="mt-6 font-raf text-4xl uppercase sm:text-5xl">Artist dashboard</h1><ArtistWorkspace /></MusicHubFrame>;
}

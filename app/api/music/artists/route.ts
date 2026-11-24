import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { hubJson, hubError, PUBLIC_ARTIST_SELECT } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      where: { isProfilePublished: true },
      select: { ...PUBLIC_ARTIST_SELECT, releases: { where: { product: { is: PUBLIC_CATALOGUE_WHERE } }, select: { id: true, coverUrl: true } } },
      orderBy: { name: "asc" },
    });
    return hubJson(artists.map(artist => ({ ...artist, imageUrl: artist.imageUrl || artist.releases.find(release => release.coverUrl)?.coverUrl || null, releaseCount: artist.releases.length, releases: undefined })));
  } catch (error) { return hubError(error); }
}

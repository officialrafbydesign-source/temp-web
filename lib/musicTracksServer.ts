import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { musicTrackPath } from "@/lib/musicTrackLinks";
import { chooseMusicFile, musicDownloadChoices } from "@/lib/musicDownloadFiles";

// Select public fields explicitly. Private download keys never enter page props.
export const getPublicMusicTrack = cache(async (id: string) => {
  return prisma.song.findFirst({
    where: { id, release: { product: { is: PUBLIC_CATALOGUE_WHERE } } },
    select: {
      id: true, title: true, audioUrl: true, duration: true, isrc: true,
      trackNo: true, price: true, sellIndividually: true,
      artist: { select: { id: true, name: true, slug: true, isProfilePublished: true } },
      release: {
        select: {
          id: true, title: true, coverUrl: true, genre: true, releaseDate: true,
          standardLinks: true, _count: { select: { songs: true } },
          product: { select: { id: true, price: true, itemType: true, stock: true } },
        },
      },
    },
  });
});

export type PublicMusicTrack = NonNullable<Awaited<ReturnType<typeof getPublicMusicTrack>>>;

function privateDownloadKey(value: string | null | undefined) {
  const key = value?.trim().replace(/^\/+/, "");
  return key && !/^https?:\/\//i.test(key) ? key : null;
}

// This result is server-only: callers must not serialize trackFileKey.
export async function getMusicTrackPurchase(userId: string, songId: string) {
  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: {
      id: true, fileUrl: true, downloadFiles: true,
      release: { select: { product: { select: { id: true, itemType: true, fileUrl: true, downloadFiles: true } } } },
    },
  });
  if (!song) return null;

  const product = song.release.product;
  const digitalProduct = product && product.itemType.toUpperCase() !== "PHYSICAL" ? product : null;
  const items = await prisma.orderItem.findMany({
    where: {
      productType: "music",
      productId: { in: [song.id, ...(digitalProduct ? [digitalProduct.id] : [])] },
      order: { is: { userId, status: { in: ["paid", "processing", "shipped", "delivered"] } } },
    },
    select: { id: true, orderId: true, productId: true },
    orderBy: { createdAt: "desc" },
    distinct: ["productId"],
    take: 2,
  });
  if (!items.length) return null;

  const releaseItem = digitalProduct ? items.find(item => item.productId === digitalProduct.id) : null;
  const trackFileKey = privateDownloadKey(song.fileUrl);
  const releaseDownloadHref = releaseItem && privateDownloadKey(digitalProduct?.fileUrl)
    ? `/api/account/orders/${encodeURIComponent(releaseItem.orderId)}/items/${encodeURIComponent(releaseItem.id)}/download`
    : null;

  const trackBase = `/api/music/tracks/${encodeURIComponent(songId)}/download`;
  const trackDownloads = musicDownloadChoices(song.downloadFiles, song.fileUrl, "track", trackBase);
  const releaseBase = releaseItem ? `/api/account/orders/${encodeURIComponent(releaseItem.orderId)}/items/${encodeURIComponent(releaseItem.id)}/download` : null;
  const releaseDownloads = releaseBase ? musicDownloadChoices(digitalProduct?.downloadFiles, digitalProduct?.fileUrl, "release", releaseBase) : [];

  return {
    trackFileKey,
    downloadHref: trackFileKey ? `/api/music/tracks/${encodeURIComponent(songId)}/download` : null,
    releaseDownloadHref,
    trackDownloads,
    releaseDownloads,
    ownsRelease: Boolean(releaseItem),
    resolveTrackFile: (format?: string | null) => chooseMusicFile(song.downloadFiles, song.fileUrl, "track", format),
    returnTo: musicTrackPath(songId),
  };
}

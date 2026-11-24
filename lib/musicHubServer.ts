import "server-only";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { canAccessExtra, MusicInputError, type HubExtra, type SubmissionData } from "@/lib/musicHub";

export const PUBLIC_SONG_SELECT = {
  id: true, title: true, duration: true, audioUrl: true, isrc: true,
  trackNo: true, price: true, sellIndividually: true, artistId: true, releaseId: true,
} as const;
export const PUBLIC_ARTIST_SELECT = {
  id: true, name: true, slug: true, biography: true, imageUrl: true, bannerUrl: true,
  links: true, isProfilePublished: true,
} as const;

export function hubJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function hubError(error: unknown) {
  if (error instanceof MusicInputError) return hubJson({ error: error.message }, 400);
  if (error instanceof SyntaxError) return hubJson({ error: "Invalid JSON request." }, 400);
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") return hubJson({ error: "That name or page address is already in use." }, 409);
  console.error("Music hub request failed:", error instanceof Error ? error.name : "UnknownError");
  return hubJson({ error: "The music update could not be completed. Please try again." }, 500);
}

export async function getArtistAccess(artistId: string, requireAgreement = true) {
  const user = await getCurrentUser();
  if (!user) return { response: hubJson({ error: "Sign in to continue." }, 401) } as const;
  if (!user.emailVerifiedAt) return { response: hubJson({ error: "Verify your email to continue." }, 403) } as const;
  const access = await prisma.artistAccess.findUnique({ where: { artistId_userId: { artistId, userId: user.id } } });
  if (!access?.isActive) return { response: hubJson({ error: "Artist access is not available for this account." }, 403) } as const;
  if (requireAgreement && !access.agreementAcceptedAt) return { response: hubJson({ error: "Read and accept your artist agreement first." }, 403) } as const;
  return { user, access } as const;
}

export async function validateArtistFiles(data: SubmissionData, accessId: string, client: Pick<Prisma.TransactionClient, "artistUpload"> = prisma) {
  const checks: { fileKey?: string; id?: string; purpose: string }[] = [];
  if (data.fileUrl) checks.push({ fileKey: data.fileUrl, purpose: "download" });
  const imageId = data.coverUrl?.match(/^\/api\/music\/artist-media\/([a-z0-9_-]+)$/)?.[1];
  if (imageId) checks.push({ id: imageId, purpose: "artwork" });
  for (const track of data.tracks) {
    if (track.fileUrl) checks.push({ fileKey: track.fileUrl, purpose: "download" });
    const previewId = track.audioUrl?.match(/^\/api\/music\/artist-media\/([a-z0-9_-]+)$/)?.[1];
    if (previewId) checks.push({ id: previewId, purpose: "preview" });
  }
  for (const check of checks) {
    if (!await client.artistUpload.findFirst({ where: { accessId, ...check }, select: { id: true } })) {
      throw new MusicInputError("Use files uploaded through your own artist account. A file belongs to another account or could not be found.");
    }
  }
}

export async function ownsMusicRelease(user: SessionUser | null, releaseId: string | null) {
  if (!user?.emailVerifiedAt || !releaseId) return false;
  const product = await prisma.musicProduct.findUnique({ where: { releaseId }, select: { id: true } });
  if (!product) return false;
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ userId: user.id }, { userId: null, email: { equals: user.email, mode: "insensitive" } }],
      status: { in: ["paid", "processing", "shipped", "delivered"] },
      AND: [{ OR: [
        { items: { some: { productType: "music", productId: product.id } } },
        { productType: "music", productId: product.id, items: { none: {} } },
      ] }],
    }, select: { id: true },
  });
  return Boolean(order);
}

export const publicExtrasWhere: Prisma.MusicExtraWhereInput = {
  isPublished: true,
  artist: { isProfilePublished: true },
  OR: [{ releaseId: null }, { release: { product: { is: PUBLIC_CATALOGUE_WHERE } } }],
};

export async function getHubExtras(where: { artistId?: string; releaseId?: string }): Promise<HubExtra[]> {
  const [rows, user] = await Promise.all([
    prisma.musicExtra.findMany({ where: { ...publicExtrasWhere, ...where }, include: { release: { select: { title: true } } }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    getCurrentUser(),
  ]);
  const ownership = new Map<string, boolean>();
  await Promise.all([...new Set(rows.filter(row => row.access === "purchase").map(row => row.releaseId).filter((id): id is string => Boolean(id)))].map(async id => {
    ownership.set(id, await ownsMusicRelease(user, id));
  }));
  return rows.map(row => {
    const allowed = canAccessExtra(row.access, Boolean(user?.emailVerifiedAt), ownership.get(row.releaseId || "") || false, user?.role === "admin" && Boolean(user.emailVerifiedAt));
    return {
      id: row.id, title: row.title, description: row.description, kind: row.kind, access: row.access,
      rafOnly: row.rafOnly, previewImageUrl: row.previewImageUrl, seriesTitle: row.seriesTitle,
      episodeNo: row.episodeNo, releaseId: row.releaseId, releaseTitle: row.release?.title || null,
      allowed, signedIn: Boolean(user),
      url: allowed ? (row.fileKey ? `/api/music/extras/${encodeURIComponent(row.id)}/media` : row.url) : null,
    };
  });
}

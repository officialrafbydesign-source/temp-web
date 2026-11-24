import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { hubJson, hubError } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const upload = await prisma.artistUpload.findUnique({ where: { id }, include: { access: { select: { userId: true, isActive: true, agreementAcceptedAt: true } } } });
    if (!upload || upload.purpose === "download") return hubJson({ error: "Preview not found." }, 404);
    const user = await getCurrentUser();
    const owner = Boolean(user?.emailVerifiedAt && upload.access.userId === user.id && upload.access.isActive && upload.access.agreementAcceptedAt);
    const admin = Boolean(user?.emailVerifiedAt && user.role === "admin");
    if (!owner && !admin) {
      const mediaUrl = `/api/music/artist-media/${id}`;
      const published = upload.purpose === "preview"
        ? await prisma.song.findFirst({ where: { audioUrl: mediaUrl, release: { product: { is: PUBLIC_CATALOGUE_WHERE } } }, select: { id: true } })
        : await prisma.release.findFirst({ where: { coverUrl: mediaUrl, product: { is: PUBLIC_CATALOGUE_WHERE } }, select: { id: true } });
      if (!published) return hubJson({ error: "Preview not found." }, 404);
    }
    const { getPresignedMediaUrl } = await import("@/lib/r2");
    const response = NextResponse.redirect(await getPresignedMediaUrl(upload.fileKey), 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) { return hubError(error); }
}

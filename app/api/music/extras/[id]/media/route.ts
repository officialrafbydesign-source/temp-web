import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessExtra } from "@/lib/musicHub";
import { hubJson, hubError, ownsMusicRelease, publicExtrasWhere } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const extra = await prisma.musicExtra.findFirst({ where: { id, ...publicExtrasWhere } });
    if (!extra?.fileKey) return hubJson({ error: "Content not found." }, 404);
    const user = await getCurrentUser();
    const owns = extra.access === "purchase" && await ownsMusicRelease(user, extra.releaseId);
    if (!canAccessExtra(extra.access, Boolean(user?.emailVerifiedAt), owns, user?.role === "admin" && Boolean(user.emailVerifiedAt))) {
      return hubJson({ error: extra.access === "members" ? "A verified member account is required." : "Purchase this release to access this extra." }, user ? 403 : 401);
    }
    const { getPresignedMediaUrl } = await import("@/lib/r2");
    const url = await getPresignedMediaUrl(extra.fileKey, extra.kind === "download");
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) { return hubError(error); }
}

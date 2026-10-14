import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";

export type CatalogueKind = "beats" | "clothing" | "music";

export async function catalogueAdminAction(req: Request, kind: string, id: string) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;
  if (!["beats", "clothing", "music"].includes(kind) || !id.trim() || id.length > 200) {
    return NextResponse.json({ error: "Invalid catalogue item." }, { status: 400 });
  }
  let isPublished = false;
  if (req.method === "PATCH") {
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as { isPublished?: unknown }).isPublished !== "boolean") {
      return NextResponse.json({ error: "Choose whether this item should be shown in the shop." }, { status: 400 });
    }
    isPublished = (body as { isPublished: boolean }).isPublished;
  } else if (req.method !== "DELETE") {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }
  try {
    const data = req.method === "DELETE"
      ? { isPublished: false, deletedAt: new Date() }
      : { isPublished };
    const where = { id, deletedAt: null };
    // Never delete licences, tracks, variants or order records. Customers retain
    // purchased downloads while the item disappears from admin and public lists.
    let result: { count: number };
    if (kind === "beats") {
      if (isPublished) {
        const beat = await prisma.beat.findFirst({ where, select: { isAvailable: true, exclusiveSoldAt: true } });
        if (!beat) return NextResponse.json({ error: "Beat not found." }, { status: 404 });
        if (!beat.isAvailable || beat.exclusiveSoldAt) {
          return NextResponse.json({ error: "This beat is unavailable or has been sold exclusively. It cannot be put back in the shop." }, { status: 409 });
        }
      }
      result = await prisma.beat.updateMany({
        where: isPublished ? { ...where, isAvailable: true, exclusiveSoldAt: null } : where,
        data,
      });
    } else if (kind === "clothing") {
      result = await prisma.product.updateMany({ where, data });
    } else {
      result = await prisma.musicProduct.updateMany({ where, data });
    }
    if (!result.count) return NextResponse.json({ error: "Item not found or no longer available. Refresh the admin page." }, { status: 404 });
    return NextResponse.json({ success: true, id, isPublished, deleted: req.method === "DELETE" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Catalogue action failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "The catalogue change could not be saved. Please try again." }, { status: 500 });
  }
}

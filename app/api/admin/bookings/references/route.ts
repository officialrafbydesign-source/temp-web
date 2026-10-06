import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { getAdminReferenceUrl } from "@/lib/privateReference";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  const params = new URL(req.url).searchParams;
  const kind = params.get("kind");
  const id = params.get("id");
  const index = Number(params.get("index") || "0");
  if (!id || id.length > 100 || !["music", "design"].includes(kind || "") ||
      !Number.isInteger(index) || index < 0 || index > 20) {
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }
  try {
    const stored = kind === "music"
      ? (await prisma.booking.findUnique({ where: { id }, select: { referenceFileUrl: true } }))?.referenceFileUrl
      : (await prisma.designEnquiry.findUnique({ where: { id }, select: { fileUrls: true } }))?.fileUrls[index];
    if (!stored) return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    const response = NextResponse.redirect(getAdminReferenceUrl(stored));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("Admin booking reference error:", error);
    return NextResponse.json({ error: "Reference could not be opened" }, { status: 500 });
  }
}

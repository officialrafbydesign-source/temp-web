import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { musicDownloadChoices } from "@/lib/musicDownloadFiles";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ signedIn: false, owned: false, downloads: [] }, { headers });
    const { id } = await params;
    const product = await prisma.musicProduct.findFirst({ where: { OR: [{ id }, { releaseId: id }] }, select: { id: true, itemType: true, fileUrl: true, downloadFiles: true } });
    if (!product || product.itemType.toUpperCase() === "PHYSICAL") return NextResponse.json({ signedIn: true, owned: false, downloads: [] }, { headers });
    const item = await prisma.orderItem.findFirst({ where: { productType: "music", productId: product.id, order: { is: { userId: user.id, status: { in: ["paid", "processing", "shipped", "delivered"] } } } }, select: { id: true, orderId: true }, orderBy: { createdAt: "desc" } });
    const downloads = item ? musicDownloadChoices(product.downloadFiles, product.fileUrl, "release", `/api/account/orders/${encodeURIComponent(item.orderId)}/items/${encodeURIComponent(item.id)}/download`) : [];
    return NextResponse.json({ signedIn: true, owned: Boolean(item), downloads }, { headers });
  } catch (error) {
    console.error("Release downloads could not be checked:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Your downloads could not be checked." }, { status: 500, headers });
  }
}

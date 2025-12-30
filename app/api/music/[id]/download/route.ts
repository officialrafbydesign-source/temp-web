// app/api/music/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { logDownload } from "@/lib/downloadLogger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const userEmail = req.headers.get("x-user-email");

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.musicProduct.findUnique({
    where: { id: productId },
    include: { song: true, variants: true },
  });

  if (!product || !product.fileUrl) {
    return NextResponse.json(
      { error: "Music product not found" },
      { status: 404 }
    );
  }

  // Check user has purchased this product
  const order = await prisma.order.findFirst({
    where: {
      productId,
      productType: "music",
      userEmail,
      status: "paid",
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Purchase required" },
      { status: 403 }
    );
  }

  const format = req.nextUrl.searchParams.get("format") ?? "mp3";

  const variant = product.variants.find(
    (v) => v.format?.toLowerCase() === format.toLowerCase()
  );

  if (!variant) {
    return NextResponse.json(
      { error: "Format not available" },
      { status: 404 }
    );
  }

  // 🔹 LOG DOWNLOAD
  await logDownload({
    productId,
    userEmail,
    ip:
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown",
    type: "music",
  });

  // Read file and send as response
  const fileBuffer = fs.readFileSync(product.fileUrl);
  const filename = `${product.song.title}.${format}`;

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


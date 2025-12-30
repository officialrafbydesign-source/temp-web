import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import { logDownload } from "@/lib/downloadLogger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beatId } = await params;
  const userEmail = req.headers.get("x-user-email");

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const beat = await prisma.beat.findUnique({
    where: { id: beatId },
  });

  if (!beat || !beat.fileUrl) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 });
  }

  // Check user has purchased a license
  const order = await prisma.beatOrder.findFirst({
    where: {
      beatId,
      user: { email: userEmail },
      status: "paid",
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  // 🔹 LOG DOWNLOAD (paid beats have no watermark)
  await logDownload({
    beatId,
    userEmail,
    ip:
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown",
    type: "beat",
  });

  const fileBuffer = fs.readFileSync(beat.fileUrl);
  const filename = `${beat.title}.mp3`;

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

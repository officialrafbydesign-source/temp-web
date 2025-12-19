import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tagBeatMetadata } from "@/lib/audio/tagBeatMetadata";
import { logDownload } from "@/lib/downloadLogger";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const beatId = params.id;
  const userEmail = req.headers.get("x-user-email") ?? "anonymous";

  const beat = await prisma.beat.findUnique({
    where: { id: beatId },
  });

  if (!beat) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 });
  }

  if (!beat.freeDownload) {
    return NextResponse.json({ error: "Free download not allowed for this beat" }, { status: 403 });
  }

  if (!beat.fileUrl) {
    return NextResponse.json({ error: "Audio file unavailable" }, { status: 404 });
  }

  // Tag the beat with watermark + metadata
  const taggedFilePath = await tagBeatMetadata({
    inputPath: beat.fileUrl,
    metadata: {
      freeDownload: true,
      user_email: userEmail,
      beat_id: beatId,
      downloaded_at: new Date().toISOString(),
    },
    watermarkPath: path.join(process.cwd(), "lib/audio/your-tag-file.mp3"),
  });

  // 🔹 LOG DOWNLOAD
  await logDownload({
    beatId,
    userEmail,
    ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown",
    type: "beat",
  });

  const fileBuffer = fs.readFileSync(taggedFilePath);
  const filename = `${beat.title}-free.mp3`;

  const response = new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });

  setTimeout(() => fs.unlink(taggedFilePath, () => {}), 10_000);

  return response;
}

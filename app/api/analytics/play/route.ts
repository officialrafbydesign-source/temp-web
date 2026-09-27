import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { beatId } = await req.json();

  await prisma.downloadLog.create({
    data: {
      beatId,
      type: "play",
    },
  });

  return NextResponse.json({ ok: true });
}

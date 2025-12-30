// app/api/admin/beats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beats = await prisma.beat.findMany({
    include: { licenses: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(beats);
}

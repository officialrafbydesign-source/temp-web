import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: any } // <- relax type here for Vercel build
) {
  const { id } = context.params; // id is still accessible

  try {
    const beat = await prisma.beat.findUnique({
      where: { id },
      include: { licenses: true },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    return NextResponse.json(beat);
  } catch (error) {
    console.error("Error fetching beat:", error);
    return NextResponse.json({ error: "Failed to fetch beat" }, { status: 500 });
  }
}

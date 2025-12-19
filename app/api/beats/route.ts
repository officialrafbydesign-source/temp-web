import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // your prisma client

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const beat = await prisma.beat.findUnique({
      where: { id },
      include: { licenses: true }, // Include licenses
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

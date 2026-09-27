import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+ requires awaiting params
    const { id } = await params;

    const beat = await prisma.beat.findUnique({
      where: { id },
      include: {
        licenses: true,
      },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    return NextResponse.json(beat);
  } catch (error) {
    console.error("Error fetching beat:", error);
    return NextResponse.json(
      { error: "Failed to fetch beat" },
      { status: 500 }
    );
  }
}
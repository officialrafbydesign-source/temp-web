import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing release ID" },
        { status: 400 }
      );
    }

    // Existing music links may contain either a product ID or a release ID.
    const product = await prisma.musicProduct.findFirst({
      where: {
        OR: [{ id }, { releaseId: id }],
      },
      select: {
        id: true,
        releaseId: true,
        price: true,
        itemType: true,
        stock: true,
        release: {
          select: {
            id: true,
            title: true,
            type: true,
            coverUrl: true,
            description: true,
            genre: true,
            catalogNo: true,
            releaseDate: true,
            featured: true,
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
            songs: {
              orderBy: { trackNo: "asc" },
              select: {
                id: true,
                title: true,
                duration: true,
                audioUrl: true,
                isrc: true,
                trackNo: true,
                price: true,
                sellIndividually: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Release not found" },
        { status: 404 }
      );
    }

    // The paid full-release download file is intentionally excluded.
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/music/release/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to load release" },
      { status: 500 }
    );
  }
}
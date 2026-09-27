import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.musicProduct.findMany({
      include: {
        release: {
          include: {
            artist: true,
            songs: {
              orderBy: { trackNo: "asc" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = products.map((product) => ({
      id: product.id,
      releaseId: product.release.id,

      title: product.release.title,
      artist: product.release.artist?.name ?? "Unknown Artist",

      coverUrl: product.release.coverUrl,
      bannerUrl: product.release.coverUrl,

      type: product.release.type,

      // Controls the large Featured Release banner on /music
      featured: product.release.featured,

      price: product.price,
      itemType: product.itemType,
      stock: product.stock ?? null,
      fileUrl: product.fileUrl,

      genre: product.release.genre,
      upc: product.release.upc,
      tuneCode: product.release.tuneCode,
      catalogNo: product.release.catalogNo,
      releaseDate: product.release.releaseDate,
      description: product.release.description,

      songCount: product.release.songs?.length ?? 0,

      // Individual songs used by /music
      songs: product.release.songs,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("RELEASES API ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Failed to fetch releases",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Not implemented. Use admin music-products route.",
    },
    { status: 405 }
  );
}
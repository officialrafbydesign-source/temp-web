import { PUBLIC_CATALOGUE_WHERE, isPublicCatalogueItem } from "@/lib/catalogueVisibility";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PUBLIC_SONG_SELECT } from "@/lib/musicHubServer";

export async function GET() {
  try {
    const [beats, musicProducts, products] = await Promise.all([
      prisma.beat.findMany({
        where: { ...PUBLIC_CATALOGUE_WHERE, isAvailable: true },
        take: 4,
        include: {
          licenses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.musicProduct.findMany({
        where: PUBLIC_CATALOGUE_WHERE,
        take: 3,
        include: {
          release: {
            include: {
              artist: true,
              songs: {
                select: PUBLIC_SONG_SELECT,
                orderBy: {
                  trackNo: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.findMany({
        where: PUBLIC_CATALOGUE_WHERE,
        take: 3,
        include: {
          variants: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      beats,
      music: musicProducts.map(({ fileUrl, ...product }) => ({ ...product, downloadAvailable: Boolean(fileUrl) })),
      clothing: products,
    });
  } catch (error) {
    console.error("Homepage API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load homepage content",
      },
      {
        status: 500,
      }
    );
  }
}

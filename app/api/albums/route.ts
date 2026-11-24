import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";

export async function GET() {
  try {
    const albums =
      await prisma.release.findMany({
        where: {
          type: "album",
          product: { is: PUBLIC_CATALOGUE_WHERE },
        },

        include: {
          artist: true,

          songs: {
            select: {
              id: true,
              title: true,
              duration: true,
              audioUrl: true,
              isrc: true,
              trackNo: true,
              price: true,
              sellIndividually:
                true,
              artistId: true,
              releaseId: true,
              createdAt: true,
            },

            orderBy: {
              trackNo:
                "asc",
            },
          },
        },

        orderBy: [
          {
            releaseDate:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],
      });

    return NextResponse.json(
      albums
    );
  } catch (error) {
    console.error(
      "GET /api/albums error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch albums",
      },
      {
        status: 500,
      }
    );
  }
}

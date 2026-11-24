import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE } from "@/lib/catalogueVisibility";
import { PUBLIC_SONG_SELECT } from "@/lib/musicHubServer";

type AlbumRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: AlbumRouteContext
) {
  try {
    const { id } = await params;

    const album =
      await prisma.release.findFirst({
        where: {
          id,
          type: "album",
          product: { is: PUBLIC_CATALOGUE_WHERE },
        },

        include: {
          artist: true,
          songs: {
            select: PUBLIC_SONG_SELECT,
            orderBy: {
              trackNo: "asc",
            },
          },
          product: { select: { id: true, releaseId: true, price: true, itemType: true, stock: true } },
        },
      });

    if (!album) {
      return NextResponse.json(
        {
          error: "Album not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error(
      "GET /api/albums/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch album",
      },
      {
        status: 500,
      }
    );
  }
}

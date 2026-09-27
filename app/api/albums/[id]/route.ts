import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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
        },

        include: {
          artist: true,
          songs: {
            orderBy: {
              trackNo: "asc",
            },
          },
          product: true,
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
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type MusicRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: MusicRouteContext
) {
  try {
    const { id } =
      await params;

    const product =
      await prisma.musicProduct.findUnique({
        where: {
          id,
        },

        include: {
          release: {
            include: {
              artist: true,

              songs: {
                orderBy: {
                  trackNo:
                    "asc",
                },
              },
            },
          },
        },
      });

    if (product) {
      return NextResponse.json({
        id:
          product.id,

        releaseId:
          product.release.id,

        title:
          product.release.title,

        artist:
          product.release.artist
            ?.name ||
          "Unknown Artist",

        price:
          product.price,

        coverUrl:
          product.release.coverUrl,

        itemType:
          product.itemType,

        stock:
          product.stock ??
          null,

        downloadAvailable:
          Boolean(
            product.fileUrl
          ),

        songs:
          product.release.songs,
      });
    }

    const release =
      await prisma.release.findUnique({
        where: {
          id,
        },

        include: {
          artist: true,

          songs: {
            orderBy: {
              trackNo:
                "asc",
            },
          },

          product:
            true,
        },
      });

    if (
      !release ||
      !release.product
    ) {
      return NextResponse.json(
        {
          error:
            "Music product or release not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id:
        release.product.id,

      releaseId:
        release.id,

      title:
        release.title,

      artist:
        release.artist?.name ||
        "Unknown Artist",

      price:
        release.product.price,

      coverUrl:
        release.coverUrl,

      itemType:
        release.product.itemType,

      stock:
        release.product.stock ??
        null,

      downloadAvailable:
        Boolean(
          release.product.fileUrl
        ),

      songs:
        release.songs,
    });
  } catch (error) {
    console.error(
      "GET /api/music/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch release",
      },
      {
        status: 500,
      }
    );
  }
}
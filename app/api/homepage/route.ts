import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [beats, musicProducts, products] = await Promise.all([
      prisma.beat.findMany({
        take: 4,
        include: {
          licenses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.musicProduct.findMany({
        take: 3,
        include: {
          release: {
            include: {
              artist: true,
              songs: {
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
      music: musicProducts,
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
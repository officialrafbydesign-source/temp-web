import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cleans Cloudinary Console URLs if passed, otherwise returns the clean public URL
function cleanCloudinaryUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const strUrl = url.toString().trim();
  if (strUrl.includes("res-console.cloudinary.com")) {
    const segments = strUrl.split("/");
    const cloudName = segments[3];
    const drilldownIndex = segments.indexOf("drilldown");
    const assetIdentifier = drilldownIndex > 1 ? segments[drilldownIndex - 1] : "";
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${assetIdentifier}`;
    }
  }
  return strUrl;
}

function safeNumber(value: any): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toDecimalNumber(value: any): number | null {
  const num = safeNumber(value);
  if (num === null) return null;
  return Math.round(num * 100) / 100;
}

function extractArtistName(artist: any): string {
  const rawArtist = typeof artist === "string" ? artist : artist?.name || "";
  return rawArtist.trim();
}

function normaliseTracks(tracks: any[], artistId: string) {
  if (!Array.isArray(tracks)) return [];

  return tracks
    .filter((t: any) => t && (t.title || t.fileUrl))
    .map((t: any, index: number) => ({
      title: t.title || `Track ${index + 1}`,
      audioUrl: cleanCloudinaryUrl(t.fileUrl),
      isrc: t.isrc || null,
      trackNo: safeNumber(t.trackNo) ?? index + 1,
      duration: safeNumber(t.duration) ? Math.round(Number(t.duration)) : null,
      price: toDecimalNumber(t.price),
      sellIndividually: Boolean(t.sellIndividually),
      artist: {
        connect: { id: artistId },
      },
    }));
}

export async function GET() {
  try {
    const products = await prisma.musicProduct.findMany({
      include: {
        release: {
          include: {
            artist: true,
            songs: { orderBy: { trackNo: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET music products error:", err);
    return NextResponse.json({ error: "Failed to fetch music products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      artist,
      price,
      stock,
      coverUrl,
      type,
      musicType,
      genre,
      upc,
      tuneCode,
      releaseDate,
      catalogNo,
      description,
      albumZipUrl,
      tracks,
    } = body;

    const cleanedCoverUrl = cleanCloudinaryUrl(coverUrl);

    if (!title || !artist || price === undefined || !cleanedCoverUrl || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const artistName = extractArtistName(artist);
    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      const artistRecord = await tx.artist.upsert({
        where: { name: artistName },
        update: {},
        create: { name: artistName },
      });

      const release = await tx.release.create({
        data: {
          title,
          type: (musicType || "mixtape").toUpperCase() as any, // Adjusted to match typical Prisma Enum formats
          coverUrl: cleanedCoverUrl,
          description: description || null,
          genre: genre || null,
          upc: upc || null,
          tuneCode: tuneCode || null,
          catalogNo: catalogNo || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          artistId: artistRecord.id,
          songs: {
            create: normaliseTracks(tracks, artistRecord.id),
          },
        },
      });

      return tx.musicProduct.create({
        data: {
          releaseId: release.id,
          price: toDecimalNumber(price) ?? 0,
          itemType: type,
          stock: type === "PHYSICAL" ? Number(stock || 0) : null,
          fileUrl: cleanCloudinaryUrl(albumZipUrl) || null,
        },
        include: {
          release: {
            include: {
              artist: true,
              songs: { orderBy: { trackNo: "asc" } },
            },
          },
        },
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("POST music product error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create music product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      artist,
      price,
      stock,
      coverUrl,
      type,
      musicType,
      genre,
      upc,
      tuneCode,
      releaseDate,
      catalogNo,
      description,
      albumZipUrl,
      tracks,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const artistName = extractArtistName(artist);
    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    const existingProduct = await prisma.musicProduct.findUnique({
      where: { id },
      include: { release: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cleanedCoverUrl = cleanCloudinaryUrl(coverUrl) || existingProduct.release.coverUrl;

    const product = await prisma.$transaction(async (tx) => {
      const artistRecord = await tx.artist.upsert({
        where: { name: artistName },
        update: {},
        create: { name: artistName },
      });

      await tx.song.deleteMany({
        where: { releaseId: existingProduct.releaseId },
      });

      await tx.release.update({
        where: { id: existingProduct.releaseId },
        data: {
          title,
          type: (musicType || "mixtape").toUpperCase() as any,
          coverUrl: cleanedCoverUrl,
          description: description || null,
          genre: genre || null,
          upc: upc || null,
          tuneCode: tuneCode || null,
          catalogNo: catalogNo || null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          artistId: artistRecord.id,
          songs: {
            create: normaliseTracks(tracks, artistRecord.id),
          },
        },
      });

      return tx.musicProduct.update({
        where: { id },
        data: {
          price: toDecimalNumber(price) ?? 0,
          itemType: type,
          stock: type === "PHYSICAL" ? Number(stock || 0) : null,
          fileUrl: cleanCloudinaryUrl(albumZipUrl) || null,
        },
        include: {
          release: {
            include: {
              artist: true,
              songs: { orderBy: { trackNo: "asc" } },
            },
          },
        },
      });
    });

    return NextResponse.json(product);
  } catch (err: any) {
    console.error("PUT music product error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update music product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const product = await prisma.musicProduct.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.musicProduct.delete({ where: { id } });

      const remainingProducts = await tx.musicProduct.count({
        where: { releaseId: product.releaseId },
      });

      if (remainingProducts === 0) {
        await tx.song.deleteMany({ where: { releaseId: product.releaseId } });
        await tx.release.delete({ where: { id: product.releaseId } });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE music product error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete music product" },
      { status: 500 }
    );
  }
}
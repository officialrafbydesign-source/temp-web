import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const musicItems = await prisma.musicProduct.findMany({
      include: {
        song: true, // assuming you have a `song` relation in your musicProduct model
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(musicItems);
  } catch (err) {
    console.error("Failed to fetch music products:", err);
    return NextResponse.json({ error: "Failed to fetch music products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, artist, price, stock, coverUrl, songId } = await req.json();

    const product = await prisma.musicProduct.create({
      data: {
        title,
        artist,
        price,
        stock,
        coverUrl,
        song: { connect: { id: songId } }, // Assuming song is a related model
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Failed to create music product:", err);
    return NextResponse.json({ error: "Failed to create music product" }, { status: 500 });
  }
}

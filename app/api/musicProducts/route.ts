import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
 // Ensure prisma client is correctly imported

// GET: Fetch all music products
export async function GET() {
  try {
    const products = await prisma.musicProduct.findMany({
      orderBy: { createdAt: "desc" }, // Order by newest first
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Failed to fetch music products:", err);
    return NextResponse.json(
      { error: "Failed to fetch music products" },
      { status: 500 }
    );
  }
}

// POST: Add a new music product
export async function POST(req: Request) {
  try {
    const { title, artist, price, stock, coverUrl, type } = await req.json();

    // Validate required fields
    if (!title || !artist || !price || !coverUrl || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If type is physical, stock must be provided
    if (type === "physical" && stock === undefined) {
      return NextResponse.json(
        { error: "Stock is required for physical products" },
        { status: 400 }
      );
    }

    // Create the new music product
    const product = await prisma.musicProduct.create({
      data: {
        title,
        artist,
        price,
        stock: type === "physical" ? stock : 0, // Only set stock if physical
        coverUrl,
        type, // Either "physical" or "digital"
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Failed to create music product:", err);
    return NextResponse.json(
      { error: "Failed to create music product" },
      { status: 500 }
    );
  }
}

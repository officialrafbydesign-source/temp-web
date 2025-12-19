import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: fetch all products
export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true }, // include sizes/colors
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

// POST: add a new product
export async function POST(req: Request) {
  try {
    const { name, price, imageUrl, variants } = await req.json();

    const product = await prisma.product.create({
      data: {
        name,
        price,
        imageUrl,
        variants: {
          create: variants, // expect array of { size, color, stock }
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const body = await req.json();
  const { userEmail, quantity } = body;

  if (!userEmail || !quantity || quantity < 1) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  if ((product.stock ?? 0) < quantity) {
    return NextResponse.json(
      { error: "Not enough stock" },
      { status: 400 }
    );
  }

  // Reduce stock atomically
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  // Create order record
  const order = await prisma.order.create({
    data: {
      productType: "product",
      productId,
      userEmail,
      quantity,
      status: "fulfilled",
    },
  });

  return NextResponse.json({
    message: "Product fulfilled",
    orderId: order.id,
  });
}

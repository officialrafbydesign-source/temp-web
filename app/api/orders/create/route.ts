import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, email, productType, productId, licenseId, totalAmount } = await req.json();

    if (!productType || !totalAmount) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    // Create the order matching your exact schema structure
    const order = await prisma.order.create({
      data: {
        userId: userId ?? undefined,
        email: email ?? undefined,
        productType,
        productId,
        licenseId,
        amount: totalAmount,
        status: "pending",
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
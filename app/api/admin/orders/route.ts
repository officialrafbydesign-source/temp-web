import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Admin view: Get all orders
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders for admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { status } = await req.json();
    const { orderId } = req.url.split("/").pop() || {};

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

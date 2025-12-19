import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse request data: user ID, order items, and total amount
    const { userId, orderItems, totalAmount } = await req.json();

    // Ensure that there are items in the order
    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "Order must contain items" }, { status: 400 });
    }

    // Create the main order record (stores user ID and total amount)
    const order = await prisma.order.create({
      data: {
        userId,
        amount: totalAmount, // Total price of the entire order
        status: "pending",   // Order is pending until payment is successful
      },
    });

    // Now, we will add the items (beats, songs, etc.) to the order.
    const orderItemsData = orderItems.map((item: any) => ({
      orderId: order.id,        // Associate item with the order
      beatId: item.beatId,      // ID of the beat (or song, etc.)
      licenseId: item.licenseId, // License type (Basic, Premium, etc.)
      amount: item.amount,       // Amount for this item (price * quantity)
    }));

    // Save all order items in the database
    await prisma.orderItem.createMany({
      data: orderItemsData,
    });

    // Return the created order
    return NextResponse.json({ order });
  } catch (error: any) {
    // Log and return any error encountered
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

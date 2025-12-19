import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure Prisma is imported

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Stripe's endpoint secret for webhooks
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Fetch order using session metadata
      const orderId = session.metadata.orderId;
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }, // Update order status to 'completed'
      });

      console.log("Order updated to completed:", order);
      return NextResponse.json({ message: "Order updated" });
    } catch (err) {
      console.error("Error updating order:", err);
      return NextResponse.json({ error: "Error updating order" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Event received" });
}

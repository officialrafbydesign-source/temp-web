// app/api/checkout/create-session/route.tsx
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: Request) {
  try {
    const { beatId, licenseName, quantity } = await req.json();

    if (!beatId || !licenseName || !quantity) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch beat details from the database
    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    // Calculate total price (assuming beat.price exists in GBP)
    const totalAmount = beat.price * quantity;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "GBP",
            product_data: { name: `${beat.title} - ${licenseName}` },
            unit_amount: totalAmount * 100, // in pence/cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        beatId,
        licenseName,
        quantity: quantity.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

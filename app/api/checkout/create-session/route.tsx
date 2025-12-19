// app/api/checkout/create-session/route.tsx
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure Prisma is imported

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15", // Ensure you're using a valid API version
});

export async function POST(req: Request) {
  try {
    const { beatId, licenseName, quantity } = await req.json();

    if (!beatId || !licenseName || !quantity) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Fetch beat details from the database
    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    // Calculate total price for the selected quantity
    const totalAmount = beat.price * quantity;

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "GBP", // Adjust currency if needed
            product_data: { name: `${beat.title} - ${licenseName}` },
            unit_amount: totalAmount * 100, // Amount in cents
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
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`, // Redirect URL after successful payment
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cart`, // Redirect URL on cancellation
    });

    return NextResponse.json({ url: session.url }); // Return Stripe session URL for redirection
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

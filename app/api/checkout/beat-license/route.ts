import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { beatId, licenseId } = await req.json();

    if (!beatId || !licenseId) {
      return NextResponse.json(
        { error: "Missing beatId or licenseId" },
        { status: 400 }
      );
    }

    // Fetch Beat and License
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
    });

    const license = await prisma.license.findUnique({
      where: { id: licenseId },
    });

    if (!beat || !license) {
      return NextResponse.json(
        { error: "Beat or license not found" },
        { status: 404 }
      );
    }

    // Normalize price to minor currency units (pence) for Stripe
    let priceNumeric =
      typeof license.price === "string"
        ? parseFloat(license.price)
        : license.price;

    if (priceNumeric >= 100 && Number.isInteger(priceNumeric)) {
      priceNumeric = priceNumeric / 100;
    }

    const unitAmountPence = Math.round(priceNumeric * 100);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${beat.title} - ${license.name}`,
              images: beat.artworkUrl ? [beat.artworkUrl] : [],
            },
            unit_amount: unitAmountPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/beats/${beatId}`,
      metadata: {
        beatId: beat.id,
        licenseId: license.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
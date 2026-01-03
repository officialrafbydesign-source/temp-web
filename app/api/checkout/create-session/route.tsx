import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2022-11-15" });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    const { beatId, licenseName, quantity } = await req.json();

    if (!beatId || !licenseName || !quantity) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    const totalAmount = beat.price * quantity;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: `${beat.title} – ${licenseName}` },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { beatId, licenseName, quantity: String(quantity) },
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

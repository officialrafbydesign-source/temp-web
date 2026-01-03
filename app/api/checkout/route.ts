import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2022-11-15" });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const { productId, productType, licenseId } = await req.json();

    let price = 0;
    let title = "";

    if (productType === "beat") {
      const license = await prisma.license.findUnique({
        where: { id: licenseId },
        include: { beat: true },
      });
      if (!license) throw new Error("License not found");
      price = license.price;
      title = `${license.beat.title} – ${license.name} License`;
    }

    if (productType === "music") {
      const item = await prisma.musicProduct.findUnique({ where: { id: productId } });
      if (!item) throw new Error("Music not found");
      price = item.price * 100;
      title = item.title;
    }

    if (productType === "product") {
      const item = await prisma.product.findUnique({ where: { id: productId } });
      if (!item) throw new Error("Product not found");
      price = item.price;
      title = item.title;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: title },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: { productType, productId, licenseId: licenseId ?? "" },
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

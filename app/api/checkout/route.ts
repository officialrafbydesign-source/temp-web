// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: Request) {
  try {
    const { productId, productType, licenseId } = await req.json();

    let item: any;
    let price: number;
    let title: string;

    // ---------------- BEATS ----------------
    if (productType === "beat") {
      const license = await prisma.License.findUnique({
        where: { id: licenseId },
        include: { beat: true },
      });

      if (!license) throw new Error("License not found");

      item = license.beat;
      price = license.price;
      title = `${license.beat.title} – ${license.name} License`;
    }

    // ---------------- MUSIC ----------------
    if (productType === "music") {
      item = await prisma.MusicProduct.findUnique({
        where: { id: productId },
      });

      if (!item) throw new Error("Music product not found");

      price = Math.round(item.price * 100);
      title = item.title;
    }

    // ---------------- PHYSICAL ----------------
    if (productType === "product") {
      item = await prisma.Product.findUnique({
        where: { id: productId },
      });

      if (!item) throw new Error("Product not found");

      price = item.price;
      title = item.title;
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
      metadata: {
        productType,
        productId,
        licenseId: licenseId ?? "",
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

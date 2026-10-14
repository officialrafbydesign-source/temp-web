import { prisma } from "@/lib/prisma";
import { PUBLIC_CATALOGUE_WHERE, isPublicCatalogueItem } from "@/lib/catalogueVisibility";
// app/api/checkout/music/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { trackId, trackTitle, price, artworkUrl, licenseType } = await req.json();

    if (!trackId) {
      return NextResponse.json(
        { error: "Missing track ID or price parameter" },
        { status: 400 }
      );
    }

    const track = await prisma.song.findUnique({
      where: { id: trackId }, include: { release: { include: { product: true } } },
    });
    if (!track || !track.sellIndividually || !track.price || !isPublicCatalogueItem(track.release.product)) {
      return NextResponse.json({ error: "Track is no longer available. Please use the music shop." }, { status: 404 });
    }
    const unitAmountPence = Math.round(track.price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${track.title} (${licenseType || "Unlimited Release"})`,
              images: track.release.coverUrl ? [track.release.coverUrl] : [],
            },
            unit_amount: unitAmountPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&type=music`,
      cancel_url: `${req.nextUrl.origin}/music`,
      metadata: {
        type: "music",
        trackId,
        licenseType: licenseType || "Unlimited",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Music Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create music checkout session" },
      { status: 500 }
    );
  }
}
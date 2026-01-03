import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2022-11-15" });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_email!;

  await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      email,
      amount: session.amount_total ?? 0,
      currency: "gbp",
      status: "paid",
    },
  });

  await sendEmail({
    to: email,
    subject: "Order confirmed",
    html: `<p>Thank you for your order.</p>`,
  });

  return NextResponse.json({ received: true });
}

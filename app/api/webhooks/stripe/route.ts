import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * Runtime-only Stripe initializer
 */
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  return new Stripe(key, {
    apiVersion: "2022-11-15",
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();

  if (!stripe) {
    console.warn("Stripe webhook called without STRIPE_SECRET_KEY");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};

  const productType = metadata.productType;
  const productId = metadata.productId;
  const licenseId = metadata.licenseId;
  const quantity = metadata.quantity ? parseInt(metadata.quantity, 10) : 1;
  const email = session.customer_email;

  if (!email) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
  }

  try {
    let orderId: string | null = null;

    // ---------------- BEAT ----------------
    if (productType === "beat") {
      if (!productId || !licenseId) throw new Error("Missing beat or license");

      const beatOrder = await prisma.beatOrder.create({
        data: {
          beatId: productId,
          licenseId,
          user: {
            connectOrCreate: {
              where: { email },
              create: { email, name: email },
            },
          },
          amount: session.amount_total ?? 0,
          status: "paid",
        },
      });

      orderId = beatOrder.id;
    }

    // ---------------- MUSIC ----------------
    if (productType === "music") {
      const order = await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          email,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "gbp",
          productType: "music",
          productId,
          status: "paid",
        },
      });

      orderId = order.id;
    }

    // ---------------- PHYSICAL PRODUCT ----------------
    if (productType === "product") {
      if (!productId) throw new Error("Missing product ID");

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || (product.stock ?? 0) < quantity) {
        throw new Error("Insufficient stock");
      }

      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      const order = await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          email,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "gbp",
          productType: "product",
          productId,
          quantity,
          status: "paid",
        },
      });

      orderId = order.id;
    }

    // ✅ SEND CONFIRMATION EMAIL
    if (orderId) {
      await sendEmail({
        to: email,
        subject: "Order confirmed",
        html: `
          <h2>Thanks for your order!</h2>
          <p>We've received your payment.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
        `,
      });
    }
  } catch (err: any) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

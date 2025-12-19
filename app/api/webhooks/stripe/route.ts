import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
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
  const quantity = metadata.quantity ? parseInt(metadata.quantity) : 1;
  const email = session.customer_email!;

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
          currency: session.currency ?? "usd",
          productType: "music",
          productId,
          status: "paid",
        },
      });

      orderId = order.id;
    }

    // ---------------- PHYSICAL PRODUCT ----------------
    if (productType === "product") {
      const product = await prisma.product.findUnique({ where: { id: productId } });
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
          currency: session.currency ?? "usd",
          productType: "product",
          productId,
          quantity,
          status: "paid",
        },
      });

      orderId = order.id;
    }

    // ✅ SEND CONFIRMATION EMAIL AFTER SUCCESS
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
    console.error("Webhook error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

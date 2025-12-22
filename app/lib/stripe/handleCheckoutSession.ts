import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function handleCheckoutSession(
  session: Stripe.Checkout.Session
) {
  const {
    productType,
    productId,
    licenseId,
  } = session.metadata || {};

  if (!productType) return;

  // Prevent duplicate orders
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existing) return;

  const order = await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      email: session.customer_details?.email!,
      amount: session.amount_total!,
      currency: session.currency!,
      productType,
      productId,
      licenseId,
      status: "PAID",
    },
  });

  // Physical product stock reduction
  if (productType === "product" && productId) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: 1 },
      },
    });
  }

  return order;
}

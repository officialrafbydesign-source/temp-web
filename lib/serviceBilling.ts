import "server-only";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export function getBillingStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-01-28.clover" });
}

export async function sendServiceInvoice({
  paymentId,
  email,
  name,
  description,
}: {
  paymentId: string;
  email: string;
  name: string | null;
  description: string;
}) {
  const payment = await prisma.servicePayment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Service payment not found");
  if (payment.status === "paid") throw new Error("This payment is already complete");

  const stripe = getBillingStripe();
  let invoice: Stripe.Invoice;

  if (payment.stripeInvoiceId) {
    invoice = await stripe.invoices.retrieve(payment.stripeInvoiceId);
    if (invoice.status === "void" || invoice.status === "uncollectible") {
      throw new Error("This invoice cannot be paid; review it in Stripe");
    }
  } else {
    const customer = await stripe.customers.create(
      { email, ...(name ? { name } : {}) },
      { idempotencyKey: `service-customer-${payment.id}` }
    );
    invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: 7,
        auto_advance: false,
        metadata: { servicePaymentId: payment.id },
      },
      { idempotencyKey: `service-invoice-${payment.id}` }
    );

    await stripe.invoiceItems.create(
      {
        customer: customer.id,
        invoice: invoice.id,
        amount: payment.amount,
        currency: "gbp",
        description,
      },
      { idempotencyKey: `service-invoice-item-${payment.id}` }
    );

    invoice = await stripe.invoices.finalizeInvoice(
      invoice.id,
      {},
      { idempotencyKey: `service-finalize-${payment.id}` }
    );

    await prisma.servicePayment.update({
      where: { id: payment.id },
      data: { stripeInvoiceId: invoice.id },
    });
  }

  if (invoice.status === "draft") {
    invoice = await stripe.invoices.finalizeInvoice(invoice.id);
  }
  if (invoice.status === "open") {
    invoice = await stripe.invoices.sendInvoice(
      invoice.id,
      {},
      { idempotencyKey: `service-send-${payment.id}` }
    );
    await prisma.servicePayment.updateMany({
      where: { id: payment.id, status: "pending" },
      data: { status: "sent" },
    });
  }

  if (invoice.status === "paid" && invoice.metadata?.servicePaymentId === payment.id &&
      invoice.total === payment.amount && invoice.currency === "gbp") {
    await prisma.servicePayment.updateMany({
      where: { id: payment.id, status: { not: "paid" } },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  return { invoiceId: invoice.id, invoiceUrl: invoice.hosted_invoice_url };
}

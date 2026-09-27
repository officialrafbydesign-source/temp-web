import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
  });
}

function isExclusiveLicenseName(name: string) {
  const lowerName = name.toLowerCase();

  return (
    lowerName.includes("exclusive") ||
    lowerName.includes("premium") ||
    lowerName.includes("unlimited") ||
    lowerName.includes("buyout")
  );
}

type OrderForExclusiveCheck = {
  productType: string | null;
  productId: string | null;
  licenseId: string | null;
  items: Array<{
    productType: string;
    beatId: string | null;
    licenseId: string | null;
  }>;
};

async function getExclusiveBeatIds(
  order: OrderForExclusiveCheck
): Promise<string[]> {
  const beatLicenses: Array<{ beatId: string; licenseId: string }> = [];

  for (const item of order.items) {
    if (item.productType === "beat" && item.beatId && item.licenseId) {
      beatLicenses.push({
        beatId: item.beatId,
        licenseId: item.licenseId,
      });
    }
  }

  if (
    order.productType === "beat" &&
    order.productId &&
    order.licenseId
  ) {
    beatLicenses.push({
      beatId: order.productId,
      licenseId: order.licenseId,
    });
  }

  if (beatLicenses.length === 0) return [];

  const licenseIds = Array.from(
    new Set(beatLicenses.map((item) => item.licenseId))
  );

  const licenses = await prisma.license.findMany({
    where: {
      id: {
        in: licenseIds,
      },
    },
    select: {
      id: true,
      name: true,
      beatId: true,
    },
  });

  const licenseMap = new Map(
    licenses.map((license) => [license.id, license])
  );

  const exclusiveBeatIds = beatLicenses
    .filter(({ beatId, licenseId }) => {
      const license = licenseMap.get(licenseId);

      return (
        license?.beatId === beatId &&
        isExclusiveLicenseName(license.name)
      );
    })
    .map(({ beatId }) => beatId);

  return Array.from(new Set(exclusiveBeatIds));
}

async function ensureExclusiveBeatsUnavailable(beatIds: string[]) {
  if (beatIds.length === 0) return;

  const soldAt = new Date();

  await prisma.$transaction([
    prisma.beat.updateMany({
      where: {
        id: {
          in: beatIds,
        },
        isAvailable: true,
      },
      data: {
        isAvailable: false,
      },
    }),
    prisma.beat.updateMany({
      where: {
        id: {
          in: beatIds,
        },
        exclusiveSoldAt: null,
      },
      data: {
        exclusiveSoldAt: soldAt,
      },
    }),
  ]);

  console.log(
    `[Exclusive Beat] Removed from sale: ${beatIds.join(", ")}`
  );
}

async function sendFulfillmentEmail({
  toEmail,
  orderId,
  productType,
  productTitle,
  downloadUrl,
}: {
  toEmail: string;
  orderId: string;
  productType: string;
  productTitle: string;
  downloadUrl?: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      `[Resend Warning] RESEND_API_KEY is not set in .env.local. Skipping email send for order: ${orderId}`
    );
    return;
  }

  try {
    const resend = new Resend(resendApiKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await resend.emails.send({
      from: "Orders <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Order Confirmed: ${productTitle} [Ref #${orderId.slice(-6)}]`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: monospace; padding: 32px; border: 4px solid #000;">
          <h1 style="color: #ef4444; text-transform: uppercase; font-size: 24px; margin-bottom: 8px;">
            PAYMENT CONFIRMED
          </h1>
          <p style="color: #a1a1aa; font-size: 12px; margin-bottom: 24px;">
            Thank you for your purchase. Your order details are below.
          </p>

          <div style="background-color: #18181b; border: 2px solid #000; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #fff;">
              ITEM: ${productTitle}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">
              TYPE: ${productType} | ORDER ID: ${orderId}
            </p>
          </div>

          ${
            downloadUrl
              ? `
            <div style="margin-bottom: 16px;">
              <a href="${downloadUrl}" style="display: inline-block; background-color: #dc2626; color: #000; font-weight: bold; font-size: 12px; padding: 12px 24px; text-decoration: none; border: 2px solid #000; text-transform: uppercase;">
                [ ACCESS DOWNLOAD / ORDER DETAILS ]
              </a>
            </div>
          `
              : ""
          }

          <p style="color: #52525b; font-size: 10px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">
            If you have questions regarding your order, visit <a href="${siteUrl}" style="color: #ef4444;">${siteUrl}</a>.
          </p>
        </div>
      `,
    });

    console.log(`[Resend Success] Confirmation email sent to ${toEmail}`);
  } catch (emailErr) {
    console.error("[Resend Error] Failed to send fulfillment email:", emailErr);
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET in environment");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log(
        `Checkout session ${session.id} completed, but payment_status is ${session.payment_status}`
      );
      return NextResponse.json({ received: true });
    }

    const orderId = session.metadata?.orderId;

    try {
      let existingOrder = null;

      if (orderId) {
        existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
          },
        });
      } else {
        existingOrder = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
          include: {
            items: true,
          },
        });
      }

      if (!existingOrder) {
        console.error(`Order not found in database for session: ${session.id}`);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      const exclusiveBeatIds = await getExclusiveBeatIds(existingOrder);

      if (existingOrder.status === "paid") {
        await ensureExclusiveBeatsUnavailable(exclusiveBeatIds);

        console.log(
          `Order ${existingOrder.id} is already marked as paid. Skipping duplicate fulfillment email.`
        );

        return NextResponse.json({ received: true });
      }

      const customerEmail =
        session.customer_details?.email ??
        session.customer_email ??
        existingOrder.email;

      const soldAt = new Date();

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            status: "paid",
            stripeSessionId: session.id,
            email: customerEmail,
          },
          include: {
            items: true,
          },
        });

        if (exclusiveBeatIds.length > 0) {
          await tx.beat.updateMany({
            where: {
              id: {
                in: exclusiveBeatIds,
              },
              isAvailable: true,
            },
            data: {
              isAvailable: false,
            },
          });

          await tx.beat.updateMany({
            where: {
              id: {
                in: exclusiveBeatIds,
              },
              exclusiveSoldAt: null,
            },
            data: {
              exclusiveSoldAt: soldAt,
            },
          });
        }

        return order;
      });

      if (exclusiveBeatIds.length > 0) {
        console.log(
          `[Exclusive Beat] Removed from sale: ${exclusiveBeatIds.join(", ")}`
        );
      }

      console.log(
        "ORDER PAID SUCCESSFULLY:",
        updatedOrder.id,
        "| Product Type:",
        updatedOrder.productType
      );

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const receiptPageUrl = `${siteUrl}/checkout/success?order=${updatedOrder.id}`;

      if (!customerEmail) {
        console.warn(
          `[Fulfillment Warning] No customer email found for order ${updatedOrder.id}. Skipping confirmation email.`
        );

        return NextResponse.json({ received: true });
      }

      switch (updatedOrder.productType) {
        case "beat":
          console.log(
            `[Fulfillment] Delivering Beat ID: ${updatedOrder.productId}`
          );
          await sendFulfillmentEmail({
            toEmail: customerEmail,
            orderId: updatedOrder.id,
            productType: "beat",
            productTitle: "Beat License & Audio Files",
            downloadUrl: receiptPageUrl,
          });
          break;

        case "music":
          console.log(
            `[Fulfillment] Preparing release download for ID: ${updatedOrder.productId}`
          );
          await sendFulfillmentEmail({
            toEmail: customerEmail,
            orderId: updatedOrder.id,
            productType: "music",
            productTitle: "Music Release Download",
            downloadUrl: receiptPageUrl,
          });
          break;

        case "design":
        case "service":
          console.log(
            `[Fulfillment] Service order confirmed for ID: ${updatedOrder.productId}`
          );
          await sendFulfillmentEmail({
            toEmail: customerEmail,
            orderId: updatedOrder.id,
            productType: "design service",
            productTitle: "Design Service Booking Confirmation",
            downloadUrl: receiptPageUrl,
          });
          break;

        default:
          console.log(`[Fulfillment] General order processed: ${updatedOrder.id}`);
          await sendFulfillmentEmail({
            toEmail: customerEmail,
            orderId: updatedOrder.id,
            productType: "order",
            productTitle: "Order Receipt",
            downloadUrl: receiptPageUrl,
          });
          break;
      }
    } catch (err: any) {
      console.error("Webhook DB update error:", err);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

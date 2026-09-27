import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  authorizeAdminApi,
} from "@/lib/adminApi";

import {
  sendEmail,
} from "@/lib/email";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type ShipOrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonResponse(
  body: unknown,
  status = 200
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

function cleanRequiredString(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function formatShippedDate(
  value: Date | null
) {
  if (!value) {
    return "Not recorded";
  }

  return value.toLocaleString(
    "en-GB",
    {
      timeZone:
        "Europe/London",

      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  );
}

export async function POST(
  req: Request,
  {
    params,
  }: ShipOrderRouteContext
) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const {
      id,
    } =
      await params;

    if (!id) {
      return jsonResponse(
        {
          error:
            "Missing order id",
        },
        400
      );
    }

    const body =
      await req.json();

    const trackingNumber =
      cleanRequiredString(
        body.trackingNumber
      );

    const carrier =
      cleanRequiredString(
        body.carrier
      );

    if (
      !trackingNumber ||
      !carrier
    ) {
      return jsonResponse(
        {
          error:
            "Tracking number and carrier are required",
        },
        400
      );
    }

    if (
      trackingNumber.length >
      150
    ) {
      return jsonResponse(
        {
          error:
            "Tracking number is too long",
        },
        400
      );
    }

    if (
      carrier.length > 100
    ) {
      return jsonResponse(
        {
          error:
            "Carrier name is too long",
        },
        400
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },

        include: {
          user: {
            select: {
              email: true,
            },
          },

          items: {
            select: {
              id: true,
              title: true,
              productType:
                true,
              quantity: true,
            },
          },
        },
      });

    if (!order) {
      return jsonResponse(
        {
          error:
            "Order not found",
        },
        404
      );
    }

    if (
      order.status ===
      "cancelled"
    ) {
      return jsonResponse(
        {
          error:
            "A cancelled order cannot be marked as shipped",
        },
        400
      );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          status:
            "shipped",

          trackingNumber,

          carrier,

          shippedAt:
            order.shippedAt ||
            new Date(),
        },

        include: {
          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },
      });

    const customerEmail =
      order.email ||
      order.user?.email ||
      null;

    let emailSent =
      false;

    let emailWarning:
      | string
      | null = null;

    if (customerEmail) {
      try {
        const safeCarrier =
          escapeHtml(
            carrier
          );

        const safeTrackingNumber =
          escapeHtml(
            trackingNumber
          );

        const safeOrderId =
          escapeHtml(
            updatedOrder.id
          );

        const safeShippedAt =
          escapeHtml(
            formatShippedDate(
              updatedOrder.shippedAt
            )
          );

        const itemList =
          order.items.length >
          0
            ? order.items
                .map(
                  (
                    item
                  ) =>
                    `<li>${escapeHtml(
                      item.title
                    )} × ${item.quantity}</li>`
                )
                .join("")
            : "<li>Order items are available in your customer account.</li>";

        await sendEmail({
          to:
            customerEmail,

          subject:
            "Your RAF By Design order has shipped",

          html: `
            <div style="background:#000;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:32px;border:4px solid #000;">
              <h1 style="margin:0 0 12px;color:#ef4444;text-transform:uppercase;">
                Your order is on the way
              </h1>

              <p style="color:#d4d4d8;line-height:1.6;">
                Your RAF By Design order has been dispatched.
              </p>

              <div style="margin:24px 0;padding:18px;background:#18181b;border:2px solid #27272a;">
                <p style="margin:0 0 8px;">
                  <strong>Carrier:</strong> ${safeCarrier}
                </p>

                <p style="margin:0 0 8px;">
                  <strong>Tracking number:</strong> ${safeTrackingNumber}
                </p>

                <p style="margin:0 0 8px;">
                  <strong>Order ID:</strong> ${safeOrderId}
                </p>

                <p style="margin:0;">
                  <strong>Shipped:</strong> ${safeShippedAt}
                </p>
              </div>

              <h2 style="font-size:16px;text-transform:uppercase;color:#fff;">
                Order items
              </h2>

              <ul style="color:#d4d4d8;line-height:1.8;">
                ${itemList}
              </ul>

              <p style="margin-top:24px;color:#a1a1aa;">
                Thank you for your purchase.
              </p>
            </div>
          `,
        });

        emailSent =
          true;
      } catch (emailError) {
        console.error(
          "Shipping notification email error:",
          emailError
        );

        emailWarning =
          "The order was marked as shipped, but the customer notification email could not be sent.";
      }
    } else {
      emailWarning =
        "The order was marked as shipped, but it has no customer email address.";
    }

    return jsonResponse({
      success: true,
      order:
        updatedOrder,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error(
      "POST /api/admin/orders/[id]/ship error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to ship the order",
      },
      500
    );
  }
}
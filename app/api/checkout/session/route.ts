import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getStripe() {
  const key =
    process.env.STRIPE_SECRET_KEY;

  if (!key) return null;

  return new Stripe(key, {
    apiVersion:
      "2023-10-16" as any,
  });
}

function isPremiumOrExclusive(
  licenseName: string
) {
  const name =
    licenseName.toLowerCase();

  return (
    name.includes("premium") ||
    name.includes("exclusive") ||
    name.includes("unlimited") ||
    name.includes("buyout")
  );
}

function hasPrivateObjectKey(
  value: string | null | undefined
) {
  if (!value) {
    return false;
  }

  const objectKey =
    value.trim();

  if (!objectKey) {
    return false;
  }

  return !/^https?:\/\//i.test(
    objectKey
  );
}

export async function GET(
  req: Request
) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const { searchParams } =
    new URL(req.url);

  const sessionId =
    searchParams.get(
      "session_id"
    );

  if (!sessionId) {
    return NextResponse.json(
      {
        error:
          "Missing session_id",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: [
            "line_items",
            "payment_intent",
          ],
        }
      );

    const order =
      await prisma.order.findUnique({
        where: {
          stripeSessionId:
            sessionId,
        },

        include: {
          items: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const user =
      await getCurrentUser();

    // Orders attached to an account may only be
    // viewed by their authenticated owner.
    if (
      order.userId &&
      (!user ||
        user.id !== order.userId)
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view this order",
        },
        {
          status: 403,
        }
      );
    }

    const orderItems =
      await Promise.all(
        order.items.map(
          async (item) => {
            let isDigital =
              false;

            let hasFile =
              false;

            let licenceName:
              | string
              | null = null;

            if (
              item.productType ===
                "beat" &&
              item.licenseId
            ) {
              isDigital =
                true;

              const license =
                await prisma.license.findUnique(
                  {
                    where: {
                      id:
                        item.licenseId,
                    },

                    include: {
                      beat: {
                        select: {
                          id: true,
                          fileUrl:
                            true,
                        },
                      },
                    },
                  }
                );

              if (license) {
                licenceName =
                  license.name;

                const canUseLegacyFile =
                  isPremiumOrExclusive(
                    license.name
                  );

                const storedFileReference =
                  license.fileUrl ||
                  (canUseLegacyFile
                    ? license.beat
                        .fileUrl
                    : null);

                hasFile =
                  hasPrivateObjectKey(
                    storedFileReference
                  );
              }
            } else if (
              item.productType ===
                "music" &&
              item.productId
            ) {
              const musicProduct =
                await prisma.musicProduct.findUnique(
                  {
                    where: {
                      id:
                        item.productId,
                    },

                    select: {
                      itemType:
                        true,

                      fileUrl:
                        true,
                    },
                  }
                );

              if (
                musicProduct
              ) {
                const isPhysical =
                  String(
                    musicProduct.itemType
                  ).toUpperCase() ===
                  "PHYSICAL";

                isDigital =
                  !isPhysical;

                hasFile =
                  !isPhysical &&
                  hasPrivateObjectKey(
                    musicProduct.fileUrl
                  );
              } else {
                const song =
                  await prisma.song.findUnique(
                    {
                      where: {
                        id:
                          item.productId,
                      },

                      select: {
                        fileUrl:
                          true,
                      },
                    }
                  );

                if (song) {
                  isDigital =
                    true;

                  hasFile =
                    hasPrivateObjectKey(
                      song.fileUrl
                    );
                }
              }
            }

            const paymentConfirmed =
              [
                "paid",
                "shipped",
                "delivered",
              ].includes(
                order.status
              ) &&
              session.payment_status ===
                "paid";

            let downloadMessage:
              | string
              | null = null;

            if (
              isDigital &&
              !paymentConfirmed
            ) {
              downloadMessage =
                "Payment confirmation is still processing.";
            } else if (
              isDigital &&
              !hasFile
            ) {
              downloadMessage =
                "The secure download file has not been added yet.";
            }

            const downloadAvailable =
              isDigital &&
              hasFile &&
              paymentConfirmed;

            const downloadUrl =
              downloadAvailable
                ? `/api/checkout/download?session_id=${encodeURIComponent(
                    sessionId
                  )}&item_id=${encodeURIComponent(
                    item.id
                  )}`
                : null;

            return {
              id:
                item.id,

              title:
                item.title,

              product_type:
                item.productType,

              quantity:
                item.quantity,

              unit_amount:
                item.unitAmount,

              licence_name:
                licenceName,

              is_digital:
                isDigital,

              download_available:
                downloadAvailable,

              download_url:
                downloadUrl,

              download_message:
                downloadMessage,
            };
          }
        )
      );

    const response =
      NextResponse.json({
        id:
          session.id,

        amount_total:
          session.amount_total,

        currency:
          session.currency,

        customer_email:
          session.customer_details
            ?.email ||
          session.customer_email,

        payment_status:
          session.payment_status,

        line_items:
          session.line_items?.data.map(
            (item) => ({
              name:
                item.description ||
                item.price?.product?.toString(),

              quantity:
                item.quantity,

              price:
                item.price?.unit_amount,
            })
          ),

        metadata:
          session.metadata,

        order_id:
          order.id,

        order_status:
          order.status,

        order_items:
          orderItems,
      });

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Session retrieval failed";

    console.error(
      "GET /api/checkout/session error:",
      error
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
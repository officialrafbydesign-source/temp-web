import Stripe from "stripe";
import { NextResponse } from "next/server";
import { ProductType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UK_DELIVERY_AMOUNT = 500;
const FREE_DELIVERY_THRESHOLD = 7000;
const DELIVERY_WORKING_DAYS = 5;

const MAX_CART_ITEMS = 50;
const MAX_ITEM_QUANTITY = 100;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(key, {
    apiVersion: "2026-01-28.clover",
  });
}

function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_DOMAIN ||
    "http://localhost:3000";

  return value.replace(/\/+$/, "");
}

class CheckoutError extends Error {}

type CartItem = {
  id: string;

  type:
    | "beat"
    | "music"
    | "clothing"
    | "service"
    | "merch";

  title: string;
  price: number;
  quantity: number;
  image?: string;

  beatId?: string;
  licenseId?: string;

  variant?: string;
  variantId?: string;
  size?: string;
  color?: string;
  sku?: string;

  musicProductId?: string;
  releaseId?: string;
  songId?: string;
  purchaseType?: "track";
};

type VerifiedCartItem = {
  productType: ProductType;
  productId: string;
  beatId?: string;
  licenseId?: string;
  variantId?: string;
  title: string;
  unitAmount: number;
  quantity: number;
  image?: string;
  requiresShipping: boolean;
};

function poundsToPence(
  value: number | string
) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new CheckoutError(
      "A product has an invalid price"
    );
  }

  return Math.round(amount * 100);
}

function getQuantity(
  item: CartItem
) {
  const quantity = Math.floor(
    Number(item.quantity)
  );

  if (
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    quantity > MAX_ITEM_QUANTITY
  ) {
    throw new CheckoutError(
      `Invalid quantity for ${item.title}`
    );
  }

  return quantity;
}

function getStripeImage(
  image?: string | null
) {
  if (
    !image ||
    !/^https?:\/\//i.test(image)
  ) {
    return undefined;
  }

  return image;
}

async function verifyCartItem(
  item: CartItem
): Promise<VerifiedCartItem> {
  if (
    !item?.id ||
    !item?.type
  ) {
    throw new CheckoutError(
      "A cart item is missing its ID or type"
    );
  }

  const requestedQuantity =
    getQuantity(item);

  if (item.type === "beat") {
    const beatId =
      item.beatId ||
      item.id;

    if (!item.licenseId) {
      throw new CheckoutError(
        `A licence has not been selected for ${item.title}`
      );
    }

    const license =
      await prisma.license.findUnique({
        where: {
          id:
            item.licenseId,
        },

        include: {
          beat: true,
        },
      });

    if (
      !license ||
      license.beatId !== beatId
    ) {
      throw new CheckoutError(
        "The selected beat licence is no longer valid"
      );
    }

    if (
      !license.beat.isAvailable
    ) {
      throw new CheckoutError(
        `${license.beat.title} is no longer available`
      );
    }

    return {
      productType:
        ProductType.beat,

      productId:
        license.beat.id,

      beatId:
        license.beat.id,

      licenseId:
        license.id,

      title:
        `${license.beat.title} — ${license.name}`,

      unitAmount:
        license.price,

      quantity: 1,

      image:
        getStripeImage(
          license.beat.artworkUrl
        ),

      requiresShipping:
        false,
    };
  }

  if (item.type === "music") {
    const isTrack =
      item.purchaseType ===
        "track" ||
      Boolean(item.songId);

    if (isTrack) {
      const songId =
        item.songId ||
        item.id;

      const song =
        await prisma.song.findUnique({
          where: {
            id:
              songId,
          },

          include: {
            release:
              true,
          },
        });

      if (
        !song ||
        !song.sellIndividually ||
        song.price === null ||
        song.price <= 0
      ) {
        throw new CheckoutError(
          `${item.title} is not available for individual purchase`
        );
      }

      return {
        productType:
          ProductType.music,

        productId:
          song.id,

        title:
          `${song.title} — ${song.release.title}`,

        unitAmount:
          poundsToPence(
            song.price
          ),

        quantity:
          requestedQuantity,

        image:
          getStripeImage(
            song.release.coverUrl
          ),

        requiresShipping:
          false,
      };
    }

    const musicProductId =
      item.musicProductId ||
      item.id;

    let musicProduct =
      await prisma.musicProduct.findUnique({
        where: {
          id:
            musicProductId,
        },

        include: {
          release:
            true,
        },
      });

    if (!musicProduct) {
      const releaseId =
        item.releaseId ||
        item.id;

      musicProduct =
        await prisma.musicProduct.findUnique({
          where: {
            releaseId,
          },

          include: {
            release:
              true,
          },
        });
    }

    if (!musicProduct) {
      throw new CheckoutError(
        `${item.title} is no longer available`
      );
    }

    const requiresShipping =
      String(
        musicProduct.itemType
      ).toUpperCase() ===
      "PHYSICAL";

    if (
      requiresShipping &&
      Number(
        musicProduct.stock ||
        0
      ) <
        requestedQuantity
    ) {
      throw new CheckoutError(
        `There is not enough stock available for ${musicProduct.release.title}`
      );
    }

    return {
      productType:
        ProductType.music,

      productId:
        musicProduct.id,

      title:
        musicProduct.release.title,

      unitAmount:
        poundsToPence(
          musicProduct.price
        ),

      quantity:
        requestedQuantity,

      image:
        getStripeImage(
          musicProduct.release.coverUrl
        ),

      requiresShipping,
    };
  }

  if (
    item.type ===
      "clothing" ||
    item.type ===
      "merch"
  ) {
    const product =
      await prisma.product.findUnique({
        where: {
          id:
            item.id,
        },

        include: {
          variants:
            true,
        },
      });

    if (!product) {
      throw new CheckoutError(
        `${item.title} is no longer available`
      );
    }

    let selectedVariant:
      | (typeof product.variants)[number]
      | undefined;

    if (
      product.variants.length >
      0
    ) {
      if (!item.variantId) {
        throw new CheckoutError(
          `Please remove and re-add ${product.name} before checkout`
        );
      }

      selectedVariant =
        product.variants.find(
          (
            variant
          ) =>
            variant.id ===
            item.variantId
        );

      if (!selectedVariant) {
        throw new CheckoutError(
          `The selected option for ${product.name} is no longer available`
        );
      }

      if (
        selectedVariant.stock <
        requestedQuantity
      ) {
        throw new CheckoutError(
          `There is not enough stock available for ${product.name}`
        );
      }
    }

    const verifiedPrice =
      product.salePrice !==
      null
        ? product.salePrice
        : product.price;

    const variantText =
      selectedVariant
        ? ` — ${selectedVariant.size} / ${selectedVariant.color}`
        : "";

    return {
      productType:
        item.type ===
        "clothing"
          ? ProductType.clothing
          : ProductType.merch,

      productId:
        product.id,

      variantId:
        selectedVariant?.id,

      title:
        `${product.name}${variantText}`,

      unitAmount:
        poundsToPence(
          verifiedPrice
        ),

      quantity:
        requestedQuantity,

      image:
        getStripeImage(
          product.imageUrls[0]
        ),

      requiresShipping:
        true,
    };
  }

  if (
    item.type ===
    "service"
  ) {
    const service =
      await prisma.musicService.findUnique({
        where: {
          id:
            item.id,
        },
      });

    if (!service) {
      throw new CheckoutError(
        `${item.title} is no longer available`
      );
    }

    if (
      !Number.isFinite(
        Number(
          service.price
        )
      ) ||
      service.price < 0
    ) {
      throw new CheckoutError(
        `${service.name} has an invalid price`
      );
    }

    return {
      productType:
        ProductType.service,

      productId:
        service.id,

      title:
        service.name,

      /*
       * Existing MusicService prices are stored as pounds.
       * Stripe requires the amount in pence.
       */
      unitAmount:
        poundsToPence(
          service.price
        ),

      quantity:
        requestedQuantity,

      requiresShipping:
        false,
    };
  }

  throw new CheckoutError(
    "This product type cannot be purchased"
  );
}

export async function POST(
  req: Request
) {
  try {
    const stripe =
      getStripe();

    const body =
      await req.json();

    const cart =
      body?.cart as
        | CartItem[]
        | undefined;

    const currentUser =
      await getCurrentUser();

    const requestedEmail =
      typeof body?.email ===
        "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const email =
      currentUser?.email ||
      requestedEmail ||
      "guest";

    if (
      !Array.isArray(
        cart
      ) ||
      cart.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cart is empty",
        },
        {
          status: 400,
        }
      );
    }

    if (
      cart.length >
      MAX_CART_ITEMS
    ) {
      return NextResponse.json(
        {
          error:
            "There are too many items in the cart",
        },
        {
          status: 400,
        }
      );
    }

    const verifiedCart =
      await Promise.all(
        cart.map(
          (item) =>
            verifyCartItem(
              item
            )
        )
      );

    const containsDigitalPurchase =
      verifiedCart.some(
        (item) =>
          item.productType ===
            ProductType.beat ||
          (
            item.productType ===
              ProductType.music &&
            !item.requiresShipping
          )
      );

    if (
      containsDigitalPurchase &&
      !currentUser
    ) {
      return NextResponse.json(
        {
          error:
            "Sign in or create an account before purchasing beats or digital music. Your account keeps your downloads available after payment.",

          code:
            "ACCOUNT_REQUIRED",

          loginUrl:
            "/login?returnTo=/checkout",

          registerUrl:
            "/register?returnTo=/checkout",
        },
        {
          status: 401,
        }
      );
    }

    const beatIds =
      verifiedCart
        .filter(
          (item) =>
            item.productType ===
            ProductType.beat
        )
        .map(
          (item) =>
            item.beatId
        );

    if (
      new Set(
        beatIds
      ).size !==
      beatIds.length
    ) {
      throw new CheckoutError(
        "Choose only one licence for each beat"
      );
    }

    const merchandiseSubtotal =
      verifiedCart.reduce(
        (
          total,
          item
        ) =>
          total +
          item.unitAmount *
            item.quantity,
        0
      );

    const physicalSubtotal =
      verifiedCart
        .filter(
          (item) =>
            item.requiresShipping
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            item.unitAmount *
              item.quantity,
          0
        );

    const requiresShipping =
      physicalSubtotal > 0;

    const qualifiesForFreeDelivery =
      physicalSubtotal >
      FREE_DELIVERY_THRESHOLD;

    const shippingAmount =
      requiresShipping
        ? qualifiesForFreeDelivery
          ? 0
          : UK_DELIVERY_AMOUNT
        : 0;

    const orderAmount =
      merchandiseSubtotal +
      shippingAmount;

    if (
      orderAmount < 1
    ) {
      throw new CheckoutError(
        "The order total must be greater than zero"
      );
    }

    const firstItem =
      verifiedCart[0];

    const order =
      await prisma.order.create({
        data: {
          userId:
            currentUser?.id ||
            null,

          email,

          amount:
            orderAmount,

          currency:
            "gbp",

          productType:
            firstItem.productType,

          productId:
            firstItem.productId,

          licenseId:
            firstItem.licenseId ||
            null,

          variantId:
            firstItem.variantId ||
            null,

          quantity:
            firstItem.quantity,

          /*
           * Payment has not happened yet.
           * The Stripe webhook changes this to paid.
           */
          status:
            "pending",

          items: {
            create:
              verifiedCart.map(
                (
                  item
                ) => ({
                  productType:
                    item.productType,

                  productId:
                    item.productId,

                  beatId:
                    item.beatId ||
                    null,

                  licenseId:
                    item.licenseId ||
                    null,

                  variantId:
                    item.variantId ||
                    null,

                  title:
                    item.title,

                  unitAmount:
                    item.unitAmount,

                  quantity:
                    item.quantity,
                })
              ),
          },
        },
      });

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      verifiedCart.map(
        (item) => ({
          quantity:
            item.quantity,

          price_data: {
            currency:
              "gbp",

            product_data: {
              name:
                item.title,

              ...(item.image
                ? {
                    images: [
                      item.image,
                    ],
                  }
                : {}),
            },

            unit_amount:
              item.unitAmount,
          },
        })
      );

    const deliveryName =
      qualifiesForFreeDelivery
        ? "Free UK Delivery"
        : "UK Standard Delivery";

    const siteUrl =
      getSiteUrl();

    const session =
      await stripe.checkout.sessions.create({
        mode:
          "payment",

        payment_method_types: [
          "card",
        ],

        line_items:
          lineItems,

        metadata: {
          orderId:
            order.id,

          shippingAmount:
            String(
              shippingAmount
            ),

          physicalSubtotal:
            String(
              physicalSubtotal
            ),

          ...(currentUser
            ? {
                userId:
                  currentUser.id,
              }
            : {}),
        },

        ...(currentUser
          ? {
              customer_email:
                currentUser.email,
            }
          : {}),

        ...(requiresShipping
          ? {
              shipping_address_collection:
                {
                  allowed_countries:
                    ["GB"],
                },

              shipping_options: [
                {
                  shipping_rate_data:
                    {
                      type:
                        "fixed_amount",

                      fixed_amount:
                        {
                          amount:
                            shippingAmount,

                          currency:
                            "gbp",
                        },

                      display_name:
                        deliveryName,

                      delivery_estimate:
                        {
                          minimum:
                            {
                              unit:
                                "business_day",

                              value:
                                DELIVERY_WORKING_DAYS,
                            },

                          maximum:
                            {
                              unit:
                                "business_day",

                              value:
                                DELIVERY_WORKING_DAYS,
                            },
                        },
                    },
                },
              ],
            }
          : {}),

        success_url:
          `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/checkout`,
      });

    await prisma.order.update({
      where: {
        id:
          order.id,
      },

      data: {
        stripeSessionId:
          session.id,
      },
    });

    return NextResponse.json({
      url:
        session.url,

      orderId:
        order.id,
    });
  } catch (error: unknown) {
    console.error(
      "POST /api/checkout/create-session error:",
      error
    );

    if (
      error instanceof
      CheckoutError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Checkout could not be started",
      },
      {
        status: 500,
      }
    );
  }
}
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  OrderStatus,
  Prisma,
  ProductType,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/prisma";

import {
  authorizeAdminApi,
} from "@/lib/adminApi";

export const dynamic =
  "force-dynamic";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const VALID_PRODUCT_TYPES: ProductType[] = [
  "beat",
  "music",
  "service",
  "design",
  "clothing",
  "merch",
];

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
} as const;

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

function optionalString(
  value: unknown
): string | null | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  const cleaned =
    cleanRequiredString(
      value
    );

  return cleaned || null;
}

function normaliseShippingAddress(
  value: unknown
):
  | Prisma.InputJsonValue
  | typeof Prisma.DbNull
  | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return Prisma.DbNull;
  }

  const address =
    value as Record<
      string,
      unknown
    >;

  const cleaned = {
    name:
      cleanRequiredString(
        address.name
      ),

    line1:
      cleanRequiredString(
        address.line1
      ),

    line2:
      cleanRequiredString(
        address.line2
      ),

    city:
      cleanRequiredString(
        address.city
      ),

    postal_code:
      cleanRequiredString(
        address.postal_code
      ),

    country:
      cleanRequiredString(
        address.country
      ),
  };

  const hasAddress =
    Object.values(
      cleaned
    ).some(Boolean);

  return hasAddress
    ? cleaned
    : Prisma.DbNull;
}

function isValidOrderStatus(
  value: string | null
): value is OrderStatus {
  return Boolean(
    value &&
      VALID_STATUSES.includes(
        value as OrderStatus
      )
  );
}

function isValidProductType(
  value: string | null
): value is ProductType {
  return Boolean(
    value &&
      VALID_PRODUCT_TYPES.includes(
        value as ProductType
      )
  );
}

async function getProductDetails(
  productType:
    | ProductType
    | null,
  productId:
    | string
    | null
): Promise<unknown> {
  if (
    !productType ||
    !productId
  ) {
    return null;
  }

  switch (productType) {
    case "beat":
      return prisma.beat.findUnique({
        where: {
          id:
            productId,
        },

        select: {
          id: true,
          title: true,
          artworkUrl: true,
          audioUrl: true,
          isAvailable: true,
          exclusiveSoldAt: true,
        },
      });

    case "clothing":
    case "merch":
      return prisma.product.findUnique({
        where: {
          id:
            productId,
        },

        select: {
          id: true,
          name: true,
          imageUrls: true,
          price: true,
          salePrice: true,
          sku: true,

          variants: {
            select: {
              id: true,
              size: true,
              color: true,
              stock: true,
              sku: true,
            },
          },
        },
      });

    case "music": {
      const musicProduct =
        await prisma.musicProduct.findUnique({
          where: {
            id:
              productId,
          },

          select: {
            id: true,
            itemType: true,
            price: true,
            stock: true,
            fileUrl: true,

            release: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
                type: true,

                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

      if (
        musicProduct
      ) {
        return {
          kind:
            "release",
          ...musicProduct,
        };
      }

      const song =
        await prisma.song.findUnique({
          where: {
            id:
              productId,
          },

          select: {
            id: true,
            title: true,
            price: true,
            trackNo: true,
            fileUrl: true,

            artist: {
              select: {
                id: true,
                name: true,
              },
            },

            release: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
              },
            },
          },
        });

      return song
        ? {
            kind:
              "track",
            ...song,
          }
        : null;
    }

    default:
      return null;
  }
}

export async function GET(
  req: NextRequest
) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const productTypeParam =
      req.nextUrl.searchParams.get(
        "productType"
      );

    const statusParam =
      req.nextUrl.searchParams.get(
        "status"
      );

    if (
      productTypeParam &&
      !isValidProductType(
        productTypeParam
      )
    ) {
      return jsonResponse(
        {
          error:
            "Invalid product type",
        },
        400
      );
    }

    if (
      statusParam &&
      !isValidOrderStatus(
        statusParam
      )
    ) {
      return jsonResponse(
        {
          error:
            "Invalid order status",
        },
        400
      );
    }

    const productType =
      productTypeParam &&
      isValidProductType(
        productTypeParam
      )
        ? productTypeParam
        : null;

    const status =
      statusParam &&
      isValidOrderStatus(
        statusParam
      )
        ? statusParam
        : null;

    const orders =
      await prisma.order.findMany({
        where: {
          ...(productType
            ? {
                OR: [
                  {
                    productType,
                  },
                  {
                    items: {
                      some: {
                        productType,
                      },
                    },
                  },
                ],
              }
            : {}),

          ...(status
            ? {
                status,
              }
            : {}),
        },

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          user: {
            select:
              safeUserSelect,
          },

          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },
      });

    const hydratedOrders =
      await Promise.all(
        orders.map(
          async (
            order
          ) => {
            const productDetails =
              await getProductDetails(
                order.productType,
                order.productId
              );

            const hydratedItems =
              await Promise.all(
                order.items.map(
                  async (
                    item
                  ) => ({
                    ...item,

                    productDetails:
                      await getProductDetails(
                        item.productType,
                        item.productId ||
                          item.beatId
                      ),
                  })
                )
              );

            return {
              ...order,
              productDetails,
              items:
                hydratedItems,
            };
          }
        )
      );

    return jsonResponse({
      orders:
        hydratedOrders,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/orders error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to fetch orders",
      },
      500
    );
  }
}

export async function PATCH(
  req: Request
) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const body =
      await req.json();

    const id =
      cleanRequiredString(
        body.id
      );

    if (!id) {
      return jsonResponse(
        {
          error:
            "Missing order id",
        },
        400
      );
    }

    const requestedStatus =
      body.status ===
      undefined
        ? null
        : cleanRequiredString(
            body.status
          );

    if (
      requestedStatus &&
      !isValidOrderStatus(
        requestedStatus
      )
    ) {
      return jsonResponse(
        {
          error:
            "Invalid status",
        },
        400
      );
    }

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          status: true,
          shippedAt: true,
        },
      });

    if (
      !existingOrder
    ) {
      return jsonResponse(
        {
          error:
            "Order not found",
        },
        404
      );
    }

    const newStatus =
      requestedStatus &&
      isValidOrderStatus(
        requestedStatus
      )
        ? requestedStatus
        : undefined;

    const shippingAddress =
      normaliseShippingAddress(
        body.shippingAddress
      );

    const order =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          ...(newStatus
            ? {
                status:
                  newStatus,
              }
            : {}),

          email:
            optionalString(
              body.email
            ),

          carrier:
            optionalString(
              body.carrier
            ),

          trackingNumber:
            optionalString(
              body.trackingNumber
            ),

          downloadUrl:
            optionalString(
              body.downloadUrl
            ),

          contractPdfUrl:
            optionalString(
              body.contractPdfUrl
            ),

          ...(shippingAddress !==
          undefined
            ? {
                shippingAddress,
              }
            : {}),

          ...(newStatus ===
            "shipped" &&
          existingOrder.status !==
            "shipped"
            ? {
                shippedAt:
                  new Date(),
              }
            : {}),
        },

        include: {
          user: {
            select:
              safeUserSelect,
          },

          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },
      });

    return jsonResponse(
      order
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to update order",
      },
      500
    );
  }
}
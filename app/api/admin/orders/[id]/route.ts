import {
  NextResponse,
} from "next/server";

import {
  OrderStatus,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/prisma";

import {
  authorizeAdminApi,
} from "@/lib/adminApi";

export const dynamic =
  "force-dynamic";

type OrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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

function isValidStatus(
  value: unknown
): value is OrderStatus {
  return (
    typeof value ===
      "string" &&
    VALID_STATUSES.includes(
      value as OrderStatus
    )
  );
}

export async function PATCH(
  req: Request,
  {
    params,
  }: OrderRouteContext
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

    if (
      !isValidStatus(
        body.status
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

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          status: true,
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

    const status =
      body.status;

    const order =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          status,

          ...(status ===
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
          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },
      });

    return jsonResponse({
      order,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders/[id] error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to update order status",
      },
      500
    );
  }
}
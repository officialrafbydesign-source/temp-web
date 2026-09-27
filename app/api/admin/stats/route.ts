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

const REVENUE_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
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

export async function GET() {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const [
      confirmedOrders,
      revenue,
      downloads,
      plays,
      pendingOrders,
      cancelledOrders,
    ] =
      await Promise.all([
        prisma.order.count({
          where: {
            status: {
              in:
                REVENUE_STATUSES,
            },
          },
        }),

        prisma.order.aggregate({
          where: {
            status: {
              in:
                REVENUE_STATUSES,
            },
          },

          _sum: {
            amount: true,
          },
        }),

        prisma.downloadLog.count({
          where: {
            type: {
              not:
                "play",

              mode:
                "insensitive",
            },
          },
        }),

        prisma.downloadLog.count({
          where: {
            type: {
              equals:
                "play",

              mode:
                "insensitive",
            },
          },
        }),

        prisma.order.count({
          where: {
            status:
              "pending",
          },
        }),

        prisma.order.count({
          where: {
            status:
              "cancelled",
          },
        }),
      ]);

    return jsonResponse({
      totalOrders:
        confirmedOrders,

      totalRevenue:
        revenue._sum
          .amount ?? 0,

      totalDownloads:
        downloads,

      totalPlays:
        plays,

      pendingOrders,

      cancelledOrders,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/stats error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to load Admin statistics",
      },
      500
    );
  }
}
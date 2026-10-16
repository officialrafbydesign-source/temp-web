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

import { REVENUE_STATUSES, reportingPeriod, reportingOrderWhere, reportingDateWhere } from "@/lib/adminReporting";

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

export async function GET(request: Request) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const period = reportingPeriod(new URL(request.url).searchParams.get("period"));
    const ordersWhere = reportingOrderWhere(period);
    const dateWhere = reportingDateWhere(period);
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
            ...ordersWhere,
            status: {
              in:
                [...REVENUE_STATUSES] as OrderStatus[],
            },
          },
        }),

        prisma.order.aggregate({
          where: {
            ...ordersWhere,
            status: {
              in:
                [...REVENUE_STATUSES] as OrderStatus[],
            },
          },

          _sum: {
            amount: true,
          },
        }),

        prisma.downloadLog.count({
          where: {
            ...dateWhere,
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
            ...dateWhere,
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
            ...ordersWhere,
            status:
              "pending",
          },
        }),

        prisma.order.count({
          where: {
            ...ordersWhere,
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
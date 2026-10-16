import { prisma } from "@/lib/prisma";
import { REVENUE_STATUSES, reportingOrderWhere, reportingDateWhere, type ReportingPeriod } from "@/lib/adminReporting";

export async function getAdminAnalytics(period: ReportingPeriod = "current") {
  const ordersWhere = reportingOrderWhere(period);
  const downloadsWhere = { ...reportingDateWhere(period), type: { not: "play", mode: "insensitive" as const } };
  const [
    totalOrders,
    totalRevenue,
    totalDownloads,
    recentDownloads,
    topBeats,
  ] = await Promise.all([
    prisma.order.count({ where: { ...ordersWhere, status: { in: [...REVENUE_STATUSES] } } }),

    prisma.order.aggregate({
      _sum: { amount: true },
      where: { ...ordersWhere, status: { in: [...REVENUE_STATUSES] } },
    }),

    prisma.downloadLog.count({ where: downloadsWhere }),

    prisma.downloadLog.findMany({
      where: downloadsWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { beat: true },
    }),

    prisma.downloadLog.groupBy({
      where: downloadsWhere,
      by: ["beatId"],
      _count: { beatId: true },
      orderBy: {
        _count: { beatId: "desc" },
      },
      take: 5,
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    totalDownloads,
    recentDownloads,
    topBeats,
  };
}

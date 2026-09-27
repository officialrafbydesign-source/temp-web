import { prisma } from "@/lib/prisma";

export async function getAdminAnalytics() {
  const [
    totalOrders,
    totalRevenue,
    totalDownloads,
    recentDownloads,
    topBeats,
  ] = await Promise.all([
    prisma.order.count(),

    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    }),

    prisma.downloadLog.count(),

    prisma.downloadLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { beat: true },
    }),

    prisma.downloadLog.groupBy({
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

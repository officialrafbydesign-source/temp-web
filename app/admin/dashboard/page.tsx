import React from "react";

// ✅ Dynamic Prisma import to avoid Vercel build-time errors
let prisma: typeof import("@/lib/prisma").prisma | null = null;

if (typeof window === "undefined") {
  prisma = (await import("@/lib/prisma")).prisma;
}

export default async function DashboardPage() {
  if (!prisma) {
    return <div>Prisma not available at build time</div>;
  }

  // ---------------------------
  // Fetch all relevant data
  // ---------------------------
  const beatOrders = await prisma.beatOrder.findMany({
    include: { user: true, beat: true, license: true },
    orderBy: { createdAt: "desc" },
    take: 20, // fetch latest 20
  });

  const musicOrders = await prisma.order.findMany({
    where: { productType: "music" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const productOrders = await prisma.order.findMany({
    where: { productType: "product" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const downloadLogs = await prisma.downloadLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // ---------------------------
  // Aggregate stats
  // ---------------------------
  const totalDownloads = downloadLogs.length;
  const totalBeatOrders = beatOrders.length;
  const totalMusicOrders = musicOrders.length;
  const totalProductOrders = productOrders.length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Total Downloads</h2>
          <p>{totalDownloads}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Total Beat Orders</h2>
          <p>{totalBeatOrders}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Total Music Orders</h2>
          <p>{totalMusicOrders}</p>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Total Physical Product Orders</h2>
          <p>{totalProductOrders}</p>
        </div>
      </div>

      {/* --------------------------- */}
      {/* Detailed Tables */}
      {/* --------------------------- */}

      <h2 className="text-2xl font-semibold mb-4">Recent Beat Orders</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Beat</th>
            <th className="border px-2 py-1">License</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {beatOrders.map((order) => (
            <tr key={order.id}>
              <td className="border px-2 py-1">{order.beat.title}</td>
              <td className="border px-2 py-1">{order.license.name}</td>
              <td className="border px-2 py-1">{order.user.email}</td>
              <td className="border px-2 py-1">
                {order.amount ? `£${(order.amount / 100).toFixed(2)}` : "Free"}
              </td>
              <td className="border px-2 py-1">{order.status}</td>
              <td className="border px-2 py-1">{order.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mb-4">Recent Music Orders</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Product ID</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {musicOrders.map((order) => (
            <tr key={order.id}>
              <td className="border px-2 py-1">{order.productId}</td>
              <td className="border px-2 py-1">{order.email}</td>
              <td className="border px-2 py-1">{order.quantity}</td>
              <td className="border px-2 py-1">{order.status}</td>
              <td className="border px-2 py-1">{order.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mb-4">Recent Physical Product Orders</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Product ID</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {productOrders.map((order) => (
            <tr key={order.id}>
              <td className="border px-2 py-1">{order.productId}</td>
              <td className="border px-2 py-1">{order.email}</td>
              <td className="border px-2 py-1">{order.quantity}</td>
              <td className="border px-2 py-1">{order.status}</td>
              <td className="border px-2 py-1">{order.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mb-4">Recent Downloads</h2>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Beat/Product ID</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">IP</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {downloadLogs.map((log) => (
            <tr key={log.id}>
              <td className="border px-2 py-1">{log.beatId}</td>
              <td className="border px-2 py-1">{log.userEmail || "N/A"}</td>
              <td className="border px-2 py-1">{log.type}</td>
              <td className="border px-2 py-1">{log.ip}</td>
              <td className="border px-2 py-1">{log.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

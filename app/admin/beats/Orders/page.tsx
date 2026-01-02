import { format } from "date-fns";

// ✅ Dynamic Prisma import to avoid Vercel build-time errors
let prisma: typeof import("@/lib/prisma").prisma | null = null;

if (typeof window === "undefined") {
  prisma = (await import("@/lib/prisma")).prisma;
}

export default async function OrdersPage() {
  if (!prisma) {
    return <div>Prisma not available at build time</div>;
  }

  // Fetch all beat orders including related beat, license, and user
  const orders = await prisma.beatOrder.findMany({
    include: {
      beat: true,
      license: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Page Summary */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎵 Beat Orders</h1>
        <p className="text-gray-600">
          View all beat orders placed by users, including license type, buyer info, and order status.
        </p>
      </section>

      {/* Orders Table */}
      <section>
        {orders.length === 0 ? (
          <p>No beat orders found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">Beat</th>
                <th className="p-2 border">License</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{order.id}</td>
                  <td className="p-2 border">{order.beat.title}</td>
                  <td className="p-2 border">{order.license.name}</td>
                  <td className="p-2 border">{order.user.name || "N/A"}</td>
                  <td className="p-2 border">{order.user.email}</td>
                  <td className="p-2 border">{format(order.createdAt, "dd/MM/yyyy")}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        order.status === "paid" ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

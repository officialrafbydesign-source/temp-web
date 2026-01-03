// app/admin/beats/orders/page.tsx

"use client"; // ✅ This makes the page a client component

import React, { useEffect, useState } from "react";

type Order = {
  id: string;
  beat: { title: string };
  license: { name: string };
  user: { name?: string; email: string };
  amount: number;
  status: string;
  createdAt: string;
};

export default function AdminBeatsOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/beats/orders");
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
        } else {
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Beat Orders</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">Beat</th>
            <th className="border px-4 py-2">License</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border px-4 py-2">{order.id}</td>
              <td className="border px-4 py-2">{order.beat.title}</td>
              <td className="border px-4 py-2">{order.license.name}</td>
              <td className="border px-4 py-2">{order.user.name || order.user.email}</td>
              <td className="border px-4 py-2">£{(order.amount / 100).toFixed(2)}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

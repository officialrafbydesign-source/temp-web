"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders"); // Adjust if necessary to pass userId in query
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders found.</p>}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 shadow">
            <p className="text-xl font-semibold">Order #{order.id}</p>
            <p>Status: {order.status}</p>
            <p>Total: £{order.totalAmount.toFixed(2)}</p>
            <p>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

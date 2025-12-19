"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  email: string;
  amount: number;
  status: string;
  productType: string;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        console.error("Error loading admin orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setOrders((orders) =>
        orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: "UPS",          // replace later with input
          trackingNumber: "TRACK123",
        }),
      });

      setOrders((orders) =>
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "shipped" } : order
        )
      );
    } catch (err) {
      console.error("Error shipping order:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Orders</h1>

      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders found.</p>}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 shadow"
          >
            <p className="text-xl font-semibold">Order #{order.id}</p>
            <p>Email: {order.email}</p>
            <p>Status: {order.status}</p>
            <p>Total: £{(order.amount / 100).toFixed(2)}</p>
            <p>
              Ordered on:{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-4 space-x-2">
              {order.status === "paid" && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() =>
                    handleStatusChange(order.id, "processing")
                  }
                >
                  Mark Processing
                </button>
              )}

              {order.status === "processing" && (
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                  onClick={() => handleShipOrder(order.id)}
                >
                  Mark Shipped
                </button>
              )}

              {order.status === "shipped" && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() =>
                    handleStatusChange(order.id, "delivered")
                  }
                >
                  Mark Delivered
                </button>
              )}

              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() =>
                  handleStatusChange(order.id, "cancelled")
                }
              >
                Cancel Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

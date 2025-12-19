"use client";

import { useState } from "react";

export function OrderActions({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);

  async function callAdminRoute(url: string, body?: any) {
    setLoading(true);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET!,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    window.location.reload();
  }

  if (order.status === "paid") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          callAdminRoute(`/api/admin/orders/${order.id}/processing`)
        }
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Mark Processing
      </button>
    );
  }

  if (order.status === "processing") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          callAdminRoute(`/api/admin/orders/${order.id}/ship`, {
            carrier: "UPS",
            trackingNumber: "TRACK123456",
          })
        }
        className="px-3 py-1 bg-purple-500 text-white rounded"
      >
        Mark Shipped
      </button>
    );
  }

  if (order.status === "shipped") {
    return (
      <button
        disabled={loading}
        onClick={() =>
          callAdminRoute(`/api/admin/orders/${order.id}/delivered`)
        }
        className="px-3 py-1 bg-green-500 text-white rounded"
      >
        Mark Delivered
      </button>
    );
  }

  return null;
}

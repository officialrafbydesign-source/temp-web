"use client";

import { useEffect, useState } from "react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-white">Loading analytics…</p>;

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-red-900 border border-red-700 p-6 rounded">
          <p>Total Orders</p>
          <p className="text-3xl font-bold">{data.totalOrders}</p>
        </div>

        <div className="bg-red-900 border border-red-700 p-6 rounded">
          <p>Total Revenue</p>
          <p className="text-3xl font-bold">
            £{(data.totalRevenue / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-red-900 border border-red-700 p-6 rounded">
          <p>Total Downloads</p>
          <p className="text-3xl font-bold">{data.totalDownloads}</p>
        </div>
      </div>

      {/* RECENT DOWNLOADS */}
      <div className="bg-red-950 border border-red-700 rounded p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">Recent Downloads</h2>

        <ul className="space-y-2 text-sm">
          {data.recentDownloads.map((d: any) => (
            <li key={d.id}>
              {d.beat?.title ?? "Unknown Beat"} —{" "}
              {d.userEmail ?? "Anonymous"}
            </li>
          ))}
        </ul>
      </div>

      {/* TOP BEATS */}
      <div className="bg-red-950 border border-red-700 rounded p-6">
        <h2 className="text-xl font-bold mb-4">Top Downloaded Beats</h2>

        <ul className="space-y-2 text-sm">
          {data.topBeats.map((b: any) => (
            <li key={b.beatId}>
              Beat ID: {b.beatId} — {b._count.beatId} downloads
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

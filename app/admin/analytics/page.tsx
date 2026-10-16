"use client";

import { useEffect, useState } from "react";

import ReportingPeriodSelect from "../components/ReportingPeriodSelect";
import { type ReportingPeriod } from "@/lib/adminReporting";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<ReportingPeriod>("current");
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    fetch(`/api/admin/analytics?period=${period}`, { cache: "no-store", credentials: "include" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load analytics");
        if (active) setData(result);
      })
      .catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [period]);

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <ReportingPeriodSelect value={period} onChange={setPeriod} />
      <p className="my-4 text-sm text-white/70">Download activity uses the selected dates. Individual order exclusions affect sales totals.</p>
      {error && <p role="alert" className="my-4 text-red-300">{error}</p>}
      {!data && !error && <p className="my-4">Loading analytics…</p>}
      {data && <>
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
      </>}
    </div>
  );
}

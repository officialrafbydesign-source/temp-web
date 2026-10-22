"use client";

import { useEffect, useState } from "react";
import BeatOrderWorkspace, { type OrderBeat } from "../../components/BeatOrderWorkspace";

export default function BeatStoreOrderPage() {
  const [beats, setBeats] = useState<OrderBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/beats", { credentials: "include", cache: "no-store" });
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.beats;
      if (!response.ok || !Array.isArray(items)) throw new Error(data.error || "Unable to load beats.");
      setBeats(items);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to load beats."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  return <div className="min-h-screen bg-zinc-100 p-3 pb-12 text-zinc-900 sm:p-6">
    <div className="mx-auto max-w-[1800px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <a href="/admin/beats" className="font-bold underline">Back to beat inventory</a>
        <a href="/beats/store" target="_blank" rel="noopener noreferrer" className="font-bold underline">Open saved storefront ↗</a>
      </div>
      <p className="text-xs text-zinc-600">Save inventory edits in the original tab before opening this editor. This page loads saved beat information. After saving order, refresh the original inventory tab once its edits are saved.</p>
      {loading ? <p role="status" className="rounded-xl bg-white p-6">Loading catalogue...</p>
        : error ? <div role="alert" className="rounded-xl bg-white p-6"><p className="text-red-700">{error}</p><button type="button" onClick={() => void load()} className="mt-3 rounded-lg border px-4 py-2 font-bold">Try again</button></div>
        : <BeatOrderWorkspace beats={beats} onSaved={(items) => { const positions = new Map(items.map((item) => [item.id, item.storeOrder])); setBeats((current) => current.map((beat) => ({ ...beat, storeOrder: positions.get(beat.id) ?? beat.storeOrder }))); }} />}
    </div>
  </div>;
}

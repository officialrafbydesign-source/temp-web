"use client";

import { useEffect, useRef, useState } from "react";
import { compareBeatStoreOrder, moveBeat, reconcileBeatOrder } from "@/lib/beatStoreOrder";

type StoreBeat = {
  id: string; storeOrder?: number; createdAt?: string; isPublished?: boolean;
  title: string; bpm?: number; musicalKey?: string; isAvailable?: boolean;
};
const same = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index]);

export default function BeatStoreOrder({ beats, disabled, onSaved }: {
  beats: StoreBeat[]; disabled: boolean; onSaved: (items: Array<{ id: string; storeOrder: number }>) => void;
}) {
  const baseline = [...beats].sort(compareBeatStoreOrder).map((beat) => beat.id);
  const [draft, setDraft] = useState<string[]>(baseline);
  const previousBaseline = useRef(baseline);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const previous = previousBaseline.current;
    setDraft((current) => same(current, previous) ? baseline : reconcileBeatOrder(current, beats));
    previousBaseline.current = baseline;
  }, [beats]);
  const dirty = !same(draft, baseline);
  const byId = new Map(beats.map((beat) => [beat.id, beat]));
  const blocked = disabled || busy;
  function move(id: string, position: number) {
    setDraft((current) => moveBeat(current, id, position));
    setMessage(""); setError("");
  }
  async function save() {
    if (blocked || !dirty) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/beats/order", {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: draft }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.error || "Unable to save Beat Store order.");
      onSaved(data.items);
      setMessage("Beat Store order saved. Refresh the store to see the new order.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save Beat Store order.");
    } finally { setBusy(false); }
  }
  return (
    <details className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <summary className="cursor-pointer text-lg font-black text-zinc-900">Beat Store order</summary>
      <p className="mt-3 text-sm text-zinc-600">Move beats up or down, or choose their positions, then save. This sets the default order of beat cards in the public Beat Store.</p>
      <p className="mt-2 text-xs text-zinc-500">Hidden or unavailable beats keep their positions and stay out of the shop. New beats appear after the ordered beats until you move them.</p>
      <ol className="mt-4 max-h-[32rem] divide-y divide-zinc-200 overflow-y-auto rounded-xl border border-zinc-200">
        {draft.map((id, index) => {
          const beat = byId.get(id);
          if (!beat) return null;
          const title = beat.title || "Untitled beat";
          return <li key={id} className="flex min-w-0 flex-wrap items-center gap-3 p-3">
            <span className="w-7 shrink-0 text-sm font-black text-zinc-500">{index + 1}.</span>
            <div className="min-w-0 flex-1 basis-36">
              <p className="break-words text-sm font-bold">{title}</p>
              <p className="text-xs text-zinc-500">{`${beat.bpm || "—"} BPM · ${beat.musicalKey || "Key not set"}`}{beat.isPublished === false ? " · Hidden from shop" : beat.isAvailable === false ? " · Unavailable" : ""}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={blocked || index === 0} onClick={() => move(id, index)} aria-label={`Move ${title} up`} className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold disabled:opacity-40">Move up</button>
              <button type="button" disabled={blocked || index === draft.length - 1} onClick={() => move(id, index + 2)} aria-label={`Move ${title} down`} className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold disabled:opacity-40">Move down</button>
              <label className="flex items-center gap-2 text-xs font-bold">Position
                <select value={index + 1} disabled={blocked} aria-label={`Store position for ${title}`} onChange={(event) => move(id, Number(event.target.value))} className="rounded-lg border border-zinc-300 bg-white p-2">
                  {draft.map((_, position) => <option key={position} value={position + 1}>{position + 1}</option>)}
                </select>
              </label>
            </div>
          </li>;
        })}
        {!draft.length && <li className="p-4 text-sm text-zinc-500">No beats loaded.</li>}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={blocked || !dirty} onClick={save} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{busy ? "Saving..." : "Save store order"}</button>
        <button type="button" disabled={blocked || !dirty} onClick={() => { setDraft(baseline); setError(""); setMessage(""); }} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold disabled:opacity-40">Reset unsaved order</button>
        {dirty && <p className="text-xs text-amber-800">Order changes are not saved yet.</p>}
      </div>
      {message && <p role="status" className="mt-3 text-sm text-emerald-800">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </details>
  );
}

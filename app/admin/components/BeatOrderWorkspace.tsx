"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { beatAssetThumbnail } from "@/lib/beatAssetImages";
import { changeBeatOrder, compareBeatStoreOrder, moveBeatGroup, moveBeatsBeside, reconcileBeatOrder,
  redoBeatOrder, sameBeatOrder, undoBeatOrder, type BeatOrderHistory } from "@/lib/beatStoreOrder";

export type OrderBeat = {
  id: string; title: string; storeOrder?: number; createdAt?: string;
  isEditorsPick?: boolean; isPublished?: boolean; isAvailable?: boolean; bpm?: number; musicalKey?: string;
  tags?: string[]; artworkUrl?: string; backgroundUrl?: string; priceStandard?: number;
};
const buttonClass = "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-900 disabled:opacity-40";

function CardImage({ beat }: { beat: OrderBeat }) {
  return <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-900">
    {beat.backgroundUrl && <img src={beatAssetThumbnail(beat.backgroundUrl)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
    {beat.artworkUrl && <img src={beatAssetThumbnail(beat.artworkUrl)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />}
    {!beat.backgroundUrl && !beat.artworkUrl && <span className="absolute inset-0 flex items-center justify-center text-xs text-white/60">No artwork</span>}
  </div>;
}

export default function BeatOrderWorkspace({ beats, onSaved, disabled = false }: {
  beats: OrderBeat[]; disabled?: boolean; onSaved: (items: Array<{ id: string; storeOrder: number }>) => void;
}) {
  const baseline = useMemo(() => [...beats].sort(compareBeatStoreOrder).map((beat) => beat.id), [beats]);
  const [history, setHistory] = useState<BeatOrderHistory>({ past: [], present: baseline, future: [] });
  const previousBaseline = useRef(baseline);
  const [selection, setSelection] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [position, setPosition] = useState("1");
  const [target, setTarget] = useState("");
  const [side, setSide] = useState<"before" | "after">("before");
  const [previewMode, setPreviewMode] = useState<"draft" | "saved">("draft");
  const [layout, setLayout] = useState<"split" | "list" | "preview">("split");
  const [fullList, setFullList] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const draft = history.present;
  const byId = new Map(beats.map((beat) => [beat.id, beat]));
  const selected = draft.filter((id) => selection.includes(id));
  const dirty = !sameBeatOrder(draft, baseline);
  const blocked = disabled || busy;
  useEffect(() => {
    const previous = previousBaseline.current;
    setHistory((current) => {
      const next = sameBeatOrder(current.present, previous) ? baseline : reconcileBeatOrder(current.present, beats);
      // A catalogue refresh invalidates old undo snapshots containing removed IDs.
      return { past: [], present: next, future: [] };
    });
    setSelection((current) => current.filter((id) => beats.some((beat) => beat.id === id)));
    previousBaseline.current = baseline;
  }, [baseline, beats]);
  useEffect(() => {
    if (!dirty && !busy) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);
  function change(next: string[], description: string) {
    if (blocked) return;
    setHistory((current) => changeBeatOrder(current, next));
    setError(""); setMessage(description);
    setPreviewMode("draft");
  }
  function moveTo(value: number) {
    if (!selected.length) { setError("Select at least one beat to move."); return; }
    const maximum = draft.length - selected.length + 1;
    if (!Number.isInteger(value) || value < 1 || value > maximum) { setError(`Enter a starting position from 1 to ${maximum}.`); return; }
    change(moveBeatGroup(draft, selected, value), `${selected.length} beat(s) moved to position ${value}.`);
  }
  function moveBeside() {
    if (!selected.length || !target || selected.includes(target)) { setError("Select beats and choose a different destination beat."); return; }
    change(moveBeatsBeside(draft, selected, target, side), `Moved ${selected.length} beat(s) ${side} ${byId.get(target)?.title || "the destination"}.`);
  }
  function toggle(id: string) { setSelection((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  async function save() {
    if (blocked || !dirty) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/beats/order", { method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: draft }) });
      const data = await response.json();
      if (!response.ok || data.success !== true || !Array.isArray(data.items)) throw new Error(data.error || "Unable to save Beat Store order.");
      onSaved(data.items);
      setMessage("Beat Store order saved. The store uses this order when Store order is selected.");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save Beat Store order."); }
    finally { setBusy(false); }
  }
  const search = query.trim().toLowerCase();
  const visible = draft.filter((id) => {
    const beat = byId.get(id);
    if (!beat) return false;
    const published = beat.isPublished !== false && beat.isAvailable !== false;
    return (filter === "all" || (filter === "public" ? published : !published))
      && `${beat.title} ${beat.musicalKey || ""} ${beat.tags?.join(" ") || ""}`.toLowerCase().includes(search);
  });
  const publicIds = (previewMode === "draft" ? draft : baseline).filter((id) => {
    const beat = byId.get(id); return beat && beat.isPublished !== false && beat.isAvailable !== false;
  });
  const firstSelected = selected.length ? draft.indexOf(selected[0]) : -1;
  const lastSelected = selected.length ? draft.indexOf(selected[selected.length - 1]) : -1;
  const changeCount = draft.filter((id, index) => id !== baseline[index]).length;
  return <div className="space-y-4 text-zinc-900">
    <div className="sticky top-0 z-30 space-y-3 rounded-2xl border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-black">Beat Store order</h1><p className="mt-1 text-xs text-zinc-600">{beats.length} beats · {publicIds.length} visible in shop · {dirty ? `${changeCount} positions changed — unsaved` : "Order saved"}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={blocked || !history.past.length} onClick={() => { setHistory(undoBeatOrder); setMessage("Move undone."); setError(""); setPreviewMode("draft"); }} className={buttonClass}>Undo</button>
          <button type="button" disabled={blocked || !history.future.length} onClick={() => { setHistory(redoBeatOrder); setMessage("Move redone."); setError(""); setPreviewMode("draft"); }} className={buttonClass}>Redo</button>
          <button type="button" disabled={blocked || !dirty} onClick={() => change(baseline, "Unsaved order reset. Undo restores your last draft.")} className={buttonClass}>Reset unsaved order</button>
          <button type="button" disabled={blocked || !dirty} onClick={save} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{busy ? "Saving..." : "Save store order"}</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold">{selected.length} selected</span>
        <button type="button" disabled={blocked || !selected.length || sameBeatOrder(draft, moveBeatGroup(draft, selected, 1))} onClick={() => moveTo(1)} className={buttonClass}>Move to top</button>
        <button type="button" disabled={blocked || !selected.length || sameBeatOrder(draft, moveBeatGroup(draft, selected, draft.length - selected.length + 1))} onClick={() => moveTo(draft.length - selected.length + 1)} className={buttonClass}>Move to bottom</button>
        <button type="button" disabled={blocked || !selected.length || firstSelected === 0} onClick={() => moveTo(firstSelected)} className={buttonClass}>Move up</button>
        <button type="button" disabled={blocked || !selected.length || lastSelected === draft.length - 1} onClick={() => moveTo(Math.min(draft.length - selected.length + 1, firstSelected + 2))} className={buttonClass}>Move down</button>
        <form onSubmit={(event) => { event.preventDefault(); moveTo(Number(position)); }} className="flex items-center gap-2">
          <label className="flex items-center gap-2 font-bold">Position <input type="number" min="1" max={draft.length - selected.length + 1} step="1" required value={position} onChange={(event) => setPosition(event.target.value)} disabled={blocked} className="w-20 rounded-lg border border-zinc-300 p-2 font-normal" /></label>
          <button type="submit" disabled={blocked || !selected.length} className={buttonClass}>Move here</button>
        </form>
        <button type="button" disabled={blocked || !selected.length} onClick={() => setSelection([])} className={buttonClass}>Clear selection</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-bold"><span className="sr-only">Before or after destination</span><select value={side} onChange={(event) => setSide(event.target.value as "before" | "after")} disabled={blocked} className="rounded-lg border border-zinc-300 bg-white p-2"><option value="before">Before</option><option value="after">After</option></select></label>
        <label className="min-w-0 flex-1 basis-48 text-xs font-bold"><span className="sr-only">Destination beat</span><select value={target} onChange={(event) => setTarget(event.target.value)} disabled={blocked} className="w-full rounded-lg border border-zinc-300 bg-white p-2 font-normal"><option value="">Choose destination beat...</option>{draft.filter((id) => !selected.includes(id)).map((id) => <option key={id} value={id}>{draft.indexOf(id) + 1}. {byId.get(id)?.title}</option>)}</select></label>
        <button type="button" disabled={blocked || !selected.length || !target || selected.includes(target)} onClick={moveBeside} className={buttonClass}>Move beside beat</button>
      </div>
      {message && <p role="status" className="text-xs text-emerald-800">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
    <p className="text-sm text-zinc-600">Select one or more beats, then move them by position or beside another beat. Selected beats keep their relative order. You can also drag a handle and drop before another row on desktop. Changes appear in the draft preview immediately; save to update the shop.</p>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Order editor layout">
      {(["split", "list", "preview"] as const).map((value) => <button type="button" key={value} aria-pressed={layout === value} onClick={() => setLayout(value)} className={buttonClass}>{value === "split" ? "List and preview" : value === "list" ? "Full-width list" : "Full-width preview"}</button>)}
    </div>
    <div className={`grid min-w-0 gap-4 ${layout === "split" ? "xl:grid-cols-2" : "grid-cols-1"}`}>
      {layout !== "preview" && <section aria-label="Arrange beats" className="min-w-0 rounded-2xl border border-zinc-300 bg-white">
        <div className="space-y-3 border-b p-4">
          <h2 className="font-black">Arrange catalogue</h2>
          <div className="flex flex-wrap gap-2">
            <label className="min-w-0 flex-1 basis-48"><span className="sr-only">Search order list</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find title, tag or key" className="w-full rounded-lg border border-zinc-300 p-2 text-sm" /></label>
            <label><span className="sr-only">Show beats</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-zinc-300 bg-white p-2 text-sm"><option value="all">All beats</option><option value="public">Visible in shop</option><option value="hidden">Hidden / unavailable</option></select></label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
            <span>{visible.length} matches · Numbers are full catalogue positions</span>
            <button type="button" onClick={() => setFullList((value) => !value)} className={buttonClass}>{fullList ? "Use scrollable list" : "Show full list"}</button>
            <button type="button" disabled={blocked || !visible.length} onClick={() => setSelection((current) => [...new Set([...current, ...visible])])} className={buttonClass}>Select matches</button>
          </div>
        </div>
        <ol className={`divide-y divide-zinc-200 ${fullList ? "" : "max-h-[65vh] overflow-y-auto"}`} aria-label="Catalogue order">
          {visible.map((id) => {
            const beat = byId.get(id)!;
            const index = draft.indexOf(id);
            return <li key={id} data-beat-id={id} onDragOver={(event) => { if (!blocked && dragging) { event.preventDefault(); setDropTarget(id); } }}
              onDrop={(event) => { event.preventDefault(); if (!blocked && dragging) { const moving = selection.includes(dragging) ? selected : [dragging]; change(moveBeatsBeside(draft, moving, id, "before"), "Beats moved. Review the draft preview."); } setDragging(null); setDropTarget(null); }}
              className={`flex min-w-0 flex-wrap items-center gap-3 border-t-2 p-3 ${dropTarget === id ? "border-t-emerald-600" : "border-t-transparent"} ${selected.includes(id) ? "bg-emerald-50" : "bg-white"}`}>
              <span draggable={!blocked} onDragStart={(event) => { if (blocked) { event.preventDefault(); return; } event.dataTransfer.setData("text/plain", id); event.dataTransfer.effectAllowed = "move"; setDragging(id); }} onDragEnd={() => { setDragging(null); setDropTarget(null); }} title={`Drag ${beat.title} to move before another beat`} aria-hidden="true" className="cursor-grab select-none rounded border border-zinc-300 px-2 py-3 text-zinc-500">⠿</span>
              <input type="checkbox" checked={selected.includes(id)} disabled={blocked} onChange={() => toggle(id)} aria-label={`Select ${beat.title}`} className="h-4 w-4" />
              <span className="w-8 text-xs font-black text-zinc-500">{index + 1}.</span>
              <div className="w-12 shrink-0"><CardImage beat={beat} /></div>
              <div className="min-w-0 flex-1 basis-32"><p className="break-words text-sm font-bold">{beat.title || "Untitled beat"}{beat.isEditorsPick && <span className="ml-1 text-amber-600" role="img" aria-label="Editor's pick">★</span>}</p><p className="text-xs text-zinc-600">{beat.bpm || "—"} BPM · {beat.musicalKey || "Key not set"}{beat.isPublished === false ? " · Hidden" : beat.isAvailable === false ? " · Unavailable" : ""}</p></div>
              <div className="flex gap-1">
                <button type="button" disabled={blocked || index === 0} aria-label={`Move ${beat.title} up`} onClick={() => change(moveBeatGroup(draft, [id], index), `${beat.title} moved up.`)} className={buttonClass}>↑</button>
                <button type="button" disabled={blocked || index === draft.length - 1} aria-label={`Move ${beat.title} down`} onClick={() => change(moveBeatGroup(draft, [id], index + 2), `${beat.title} moved down.`)} className={buttonClass}>↓</button>
              </div>
            </li>;
          })}
          {!visible.length && <li className="p-6 text-sm text-zinc-500">No matching beats.</li>}
        </ol>
      </section>}
      {layout !== "list" && <section aria-label="Beat Store order preview" className="min-w-0 rounded-2xl border border-zinc-300 bg-zinc-950 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-700 p-4">
          <div><h2 className="font-black">Store order preview</h2><p className="mt-1 text-xs text-zinc-400">{previewMode === "draft" ? "Draft order — updates as you move beats" : "Currently saved order"}</p></div>
          <div className="flex gap-2" role="group" aria-label="Preview order"><button type="button" aria-pressed={previewMode === "draft"} onClick={() => setPreviewMode("draft")} className={buttonClass}>Draft</button><button type="button" aria-pressed={previewMode === "saved"} onClick={() => setPreviewMode("saved")} className={buttonClass}>Saved</button></div>
          <p className="w-full text-xs text-zinc-400">Hidden and unavailable beats are omitted here. Preview numbers show the customer order. Search filters in the editor do not filter this preview.</p>
        </div>
        <ol className={`grid grid-cols-2 content-start gap-3 p-4 sm:grid-cols-3 ${layout === "preview" ? "lg:grid-cols-5" : ""} ${fullList ? "" : "max-h-[65vh] overflow-y-auto"}`} aria-label={`${previewMode === "draft" ? "Draft" : "Saved"} storefront order`}>
          {publicIds.map((id, index) => {
            const beat = byId.get(id)!;
            return <li key={id} className={`min-w-0 rounded-xl border p-2 ${selected.includes(id) ? "border-emerald-400" : "border-zinc-700"}`}><CardImage beat={beat} /><p className="mt-2 break-words text-xs font-black"><span className="text-emerald-400">{index + 1}.</span> {beat.title}{beat.isEditorsPick && <span className="ml-1 text-yellow-400" role="img" aria-label="Editor's pick">★</span>}</p><p className="mt-1 text-[11px] text-zinc-400">{beat.bpm || "—"} BPM · {beat.musicalKey || "—"}</p><button type="button" disabled={blocked} aria-pressed={selected.includes(id)} onClick={() => toggle(id)} className="mt-2 rounded border border-zinc-600 px-2 py-1 text-xs disabled:opacity-40">{selected.includes(id) ? "Selected" : "Select"}</button></li>;
          })}
          {!publicIds.length && <li className="p-3 text-sm text-zinc-400">No beats are currently visible in the shop.</li>}
        </ol>
      </section>}
    </div>
  </div>;
}

export const DEFAULT_BEAT_STORE_ORDER = 1000000;

export const beatStoreOrderBy = () => [
  { storeOrder: "asc" as const }, { createdAt: "desc" as const }, { id: "asc" as const },
];

export function compareBeatStoreOrder(
  a: { id: string; storeOrder?: number; createdAt?: string | Date },
  b: { id: string; storeOrder?: number; createdAt?: string | Date }
) {
  return (a.storeOrder ?? DEFAULT_BEAT_STORE_ORDER) - (b.storeOrder ?? DEFAULT_BEAT_STORE_ORDER)
    || new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    || a.id.localeCompare(b.id);
}

export function reconcileBeatOrder(draft: string[], beats: Array<{ id: string; storeOrder?: number; createdAt?: string | Date }>) {
  const ids = new Set(beats.map((beat) => beat.id));
  const kept = draft.filter((id) => ids.has(id));
  const present = new Set(kept);
  return [...kept, ...[...beats].sort(compareBeatStoreOrder).map((beat) => beat.id).filter((id) => !present.has(id))];
}

export function moveBeat(ids: string[], id: string, position: number) {
  if (!ids.includes(id) || !Number.isInteger(position) || position < 1 || position > ids.length) return ids;
  const next = ids.filter((item) => item !== id);
  next.splice(position - 1, 0, id);
  return next;
}

// Position is the final, one-based position of the first selected beat.
// Selections always keep their existing relative order, including after a search.
export function moveBeatGroup(ids: string[], selected: string[], position: number) {
  const selection = new Set(selected);
  const moving = ids.filter((id) => selection.has(id));
  const remaining = ids.filter((id) => !selection.has(id));
  if (!moving.length || !Number.isInteger(position) || position < 1 || position > remaining.length + 1) return ids;
  return [...remaining.slice(0, position - 1), ...moving, ...remaining.slice(position - 1)];
}

export function moveBeatsBeside(ids: string[], selected: string[], target: string, side: "before" | "after") {
  if (selected.includes(target) || !ids.includes(target)) return ids;
  const selection = new Set(selected);
  const remaining = ids.filter((id) => !selection.has(id));
  return moveBeatGroup(ids, selected, remaining.indexOf(target) + (side === "before" ? 1 : 2));
}

export const sameBeatOrder = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index]);

export type BeatOrderHistory = { past: string[][]; present: string[]; future: string[][] };
export function changeBeatOrder(history: BeatOrderHistory, next: string[]): BeatOrderHistory {
  return sameBeatOrder(history.present, next) ? history : { past: [...history.past, history.present].slice(-50), present: next, future: [] };
}
export function undoBeatOrder(history: BeatOrderHistory): BeatOrderHistory {
  if (!history.past.length) return history;
  return { past: history.past.slice(0, -1), present: history.past[history.past.length - 1], future: [history.present, ...history.future] };
}
export function redoBeatOrder(history: BeatOrderHistory): BeatOrderHistory {
  if (!history.future.length) return history;
  return { past: [...history.past, history.present], present: history.future[0], future: history.future.slice(1) };
}

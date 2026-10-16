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

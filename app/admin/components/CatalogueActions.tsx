"use client";

import { useState } from "react";

export default function CatalogueActions({ kind, id, isPublished = true, available = true, disabled = false, onVisibilityChange, onDeleted }: {
  kind: "beats" | "clothing" | "music";
  id: string;
  isPublished?: boolean;
  available?: boolean;
  disabled?: boolean;
  onVisibilityChange: (isPublished: boolean) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(action: "visibility" | "delete") {
    if (busy || disabled) return;
    if (action === "delete" && !window.confirm("Delete this catalogue item? It will disappear from admin and the shop. Existing customer orders and downloads are kept.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/catalogue/${kind}/${encodeURIComponent(id)}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(action === "visibility" ? { body: JSON.stringify({ isPublished: !isPublished }) } : {}),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.error || "The change could not be saved.");
      if (action === "delete") onDeleted();
      else onVisibilityChange(result.isPublished);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The change could not be saved.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col items-start gap-2 text-left">
      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${isPublished && available ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-700"}`}>
        {!isPublished ? "Hidden from shop" : available ? "Shown in shop" : "Unavailable"}
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || disabled || (!isPublished && !available)} onClick={() => change("visibility")} className="rounded bg-zinc-700 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-600 disabled:opacity-50">
          {busy ? "Saving…" : isPublished ? "Hide from shop" : "Show in shop"}
        </button>
        <button type="button" disabled={busy || disabled} onClick={() => change("delete")} className="rounded bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">Delete</button>
      </div>
      {error && <p role="alert" className="max-w-xs text-xs text-red-700">{error}</p>}
    </div>
  );
}

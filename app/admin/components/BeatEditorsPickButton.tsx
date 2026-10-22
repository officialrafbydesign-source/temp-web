"use client";

import { useState } from "react";

export default function BeatEditorsPickButton({ id, title, picked, disabled, onSaved }: {
  id: string; title: string; picked: boolean; disabled?: boolean; onSaved: (picked: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    if (busy || disabled) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/beats/${encodeURIComponent(id)}/editors-pick`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEditorsPick: !picked }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true || typeof data.isEditorsPick !== "boolean") throw new Error(data.error || "Unable to save editor's pick.");
      onSaved(data.isEditorsPick);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save editor's pick."); }
    finally { setBusy(false); }
  }
  return <div className="max-w-56">
    <button type="button" disabled={disabled || busy} aria-pressed={picked}
      aria-label={picked ? `Remove ${title} from editor's picks` : `Add ${title} to editor's picks`}
      title="Saves the editor's pick immediately" onClick={toggle}
      className={`rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40 ${picked ? "border-amber-400 bg-amber-50 text-amber-900" : "border-zinc-300 bg-white text-zinc-700"}`}>
      <span aria-hidden="true">{picked ? "★" : "☆"}</span> {busy ? "Saving..." : "Editor's pick"}
    </button>
    {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
  </div>;
}

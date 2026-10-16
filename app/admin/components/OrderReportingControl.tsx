"use client";

import { useState } from "react";

export default function OrderReportingControl({ id, excluded, onChange }: {
  id: string; excluded: boolean; onChange: (excluded: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/reporting`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excludedFromReports: !excluded }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update reporting");
      onChange(data.excludedFromReports);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update reporting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 max-w-52 whitespace-normal text-right">
      {excluded && <p className="mb-1 text-xs font-bold text-amber-800">Excluded from reports</p>}
      <button type="button" disabled={busy} onClick={toggle}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-bold text-zinc-800 hover:bg-zinc-100 disabled:opacity-50">
        {busy ? "Saving..." : excluded ? "Include in reports" : "Exclude from reports"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

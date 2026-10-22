"use client";

import { useEffect, useState } from "react";
import { pageNumbers, parsePageInput } from "@/lib/adminPagination";

export default function InventoryPagination({ currentPage, totalPages, totalItems, pageSize, onChange, location = "bottom" }: {
  currentPage: number; totalPages: number; totalItems: number; pageSize: number;
  onChange: (page: number) => void; location?: "top" | "bottom";
}) {
  const [jump, setJump] = useState(String(currentPage));
  const [error, setError] = useState("");
  useEffect(() => { setJump(String(currentPage)); setError(""); }, [currentPage, totalPages]);
  const buttonClass = "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-900 disabled:opacity-40";
  return (
    <div className="space-y-3 border-t border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs text-zinc-600">Page {currentPage} of {totalPages} · Showing {totalItems ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems} beats</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={`Beat inventory pages (${location})`} className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => onChange(currentPage - 1)} disabled={currentPage <= 1} className={buttonClass}>Previous</button>
          {pageNumbers(currentPage, totalPages).map((page, index) => page === "ellipsis"
            ? <span key={`gap-${index}`} className="px-1 text-zinc-500" aria-hidden="true">…</span>
            : <button key={page} type="button" aria-label={`Page ${page}`} aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onChange(page)} className={page === currentPage ? "rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-2 text-xs font-bold text-white" : buttonClass}>{page}</button>)}
          <button type="button" onClick={() => onChange(currentPage + 1)} disabled={currentPage >= totalPages} className={buttonClass}>Next</button>
        </nav>
        <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
          event.preventDefault();
          const page = parsePageInput(jump, totalPages);
          if (page === null) { setError(`Enter a page from 1 to ${totalPages}.`); return; }
          setError(""); onChange(page);
        }}>
          <label className="flex items-center gap-2 text-xs font-bold">Go to page
            <input type="number" min="1" max={totalPages} step="1" required value={jump}
              onChange={(event) => setJump(event.target.value)} className="w-20 rounded-lg border border-zinc-300 bg-white p-2 text-sm text-zinc-900" />
          </label>
          <button type="submit" className={buttonClass}>Go</button>
        </form>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

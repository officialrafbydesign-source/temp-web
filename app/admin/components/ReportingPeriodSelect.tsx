"use client";

import { REPORTING_START_LABEL, type ReportingPeriod } from "@/lib/adminReporting";

export default function ReportingPeriodSelect({ value, onChange }: {
  value: ReportingPeriod;
  onChange: (value: ReportingPeriod) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-4 text-zinc-900">
      <label className="flex flex-wrap items-center gap-3 text-sm font-bold">
        Sales reporting period
        <select value={value} onChange={(event) => onChange(event.target.value === "all" ? "all" : "current")}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900">
          <option value="current">Since {REPORTING_START_LABEL}</option>
          <option value="all">All time</option>
        </select>
      </label>
      <p className="mt-2 text-xs text-zinc-600">Excluded test orders do not count in either period. Manage exclusions in Orders. Order history and customer downloads are kept.</p>
    </div>
  );
}

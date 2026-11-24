"use client";
import type { HubLink } from "@/lib/musicHub";
export const inputClass = "mt-1 block w-full rounded-lg border border-zinc-400 bg-white px-3 py-2.5 text-base text-zinc-950 focus:border-emerald-600 focus:outline-emerald-600";
export function Field({ label, value, onChange, type = "text", required = false, hint, multiline = false }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean; hint?: string; multiline?: boolean }) {
  return <label className="block text-sm font-bold">{label}{multiline ? <textarea value={value} onChange={event => onChange(event.target.value)} required={required} rows={5} maxLength={10000} className={inputClass} /> : <input value={value} onChange={event => onChange(event.target.value)} type={type} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} className={inputClass} />}{hint && <span className="mt-1 block text-xs font-normal leading-5 text-zinc-600">{hint}</span>}</label>;
}
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-start gap-3 text-sm font-bold"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-700" />{label}</label>;
}
export function LinkFields({ links, onChange }: { links: HubLink[]; onChange: (links: HubLink[]) => void }) {
  return <div className="space-y-3"><p className="text-sm font-bold">Links</p>{links.map((link, index) => <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]"><Field label={`Link ${index + 1} label`} value={link.label} onChange={label => onChange(links.map((entry, i) => i === index ? { ...entry, label } : entry))} /><Field label="URL" type="url" value={link.url} onChange={url => onChange(links.map((entry, i) => i === index ? { ...entry, url } : entry))} /><button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="rounded-lg border border-zinc-400 px-3 py-2.5 text-sm">Remove link {index + 1}</button></div>)}{links.length < 12 && <button type="button" onClick={() => onChange([...links, { label: "", url: "" }])} className="text-sm font-bold text-emerald-800 underline">+ Add link</button>}</div>;
}

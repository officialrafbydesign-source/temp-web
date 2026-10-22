"use client";

import type { ReactNode } from "react";
import CatalogueActions from "./CatalogueActions";
import CatalogueTagsInput from "./CatalogueTagsInput";

export type BeatInventoryTrack = {
  isEditorsPick?: boolean; isPublished?: boolean; isAvailable?: boolean; storeOrder?: number; createdAt?: string;
  id: string; title: string; bpm: number; genre: string; freeDownload: boolean;
  musicalKey: string; tags: string[]; priceStandard: number; pricePremium: number;
  mp3Url: string; zipUrl: string; standardFileUrl: string;
  artworkUrl?: string; backgroundUrl?: string; plays: number; downloads: number;
};

type Props = {
  beat: BeatInventoryTrack; selected: boolean; expanded: boolean; busy: boolean;
  editorsPickControl?: ReactNode;
  playing: boolean; existingTags: string[]; preview: ReactNode; selectedCount: number;
  onSelect: () => void; onExpand: () => void; onPlay: () => void; onSave: () => void;
  onDuplicate: () => void; onDeleted: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onChange: (field: keyof BeatInventoryTrack, value: string | number | boolean | string[]) => void;
  onChooseImage: (field: "artworkUrl" | "backgroundUrl", upload: boolean) => void;
};

export default function BeatInventoryItem(props: Props) {
  const { beat, selected, expanded, busy } = props;
  const inputClass = "mt-1 w-full min-w-0 rounded-lg border border-zinc-300 bg-white p-2 text-sm font-normal text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-500";
  function input(field: keyof BeatInventoryTrack, label: string, type = "text", placeholder = "") {
    const numeric = type === "number";
    return (
      <label className="block min-w-0 text-xs font-bold text-zinc-700">
        {label}
        <input type={type} disabled={!selected || busy} value={String(field === "bpm" && !beat.bpm ? "" : beat[field] ?? "")}
          min={numeric ? 0 : undefined} step={numeric ? field === "bpm" ? "any" : "0.01" : undefined}
          placeholder={placeholder} className={inputClass}
          onChange={(event) => props.onChange(field, numeric ? Number(event.target.value) : event.target.value)} />
      </label>
    );
  }
  return (
    <article className={`min-w-0 border-b border-zinc-200 p-4 ${selected ? "bg-emerald-50" : "bg-white"}`}>
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <input type="checkbox" checked={selected} disabled={busy} onChange={props.onSelect}
          aria-label={`Select ${beat.title}`} className="mt-4 h-4 w-4 shrink-0" />
        <div className="shrink-0">{props.preview}</div>
        <div className="min-w-0 flex-1 basis-36">
          <h3 className="break-words font-black text-zinc-950">{beat.title}</h3>
          <p className="mt-1 text-xs text-zinc-600">{beat.bpm || "—"} BPM · {beat.musicalKey || "Key not set"}</p>
          <p className="mt-1 break-words text-xs text-zinc-600">{beat.tags?.join(" · ") || "Instrumental"}</p>
          <p className="mt-1 text-xs text-zinc-500">Leasing £{beat.priceStandard.toFixed(2)} · Exclusive £{beat.pricePremium.toFixed(2)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {props.editorsPickControl}
          <button type="button" onClick={props.onPlay} disabled={!beat.mp3Url}
            className="rounded-lg bg-zinc-200 px-3 py-2 text-xs font-bold text-zinc-900 disabled:opacity-40"
            aria-label={`${props.playing ? "Pause" : "Play"} ${beat.title}`}>{props.playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={props.onExpand} disabled={busy} aria-expanded={expanded} aria-controls={`beat-fields-${beat.id}`}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{expanded ? "Collapse" : "Edit / Expand"}</button>
          <button type="button" onClick={props.onDuplicate} disabled={busy}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Duplicate</button>
        </div>
        <CatalogueActions kind="beats" id={beat.id} isPublished={beat.isPublished} available={beat.isAvailable !== false}
          disabled={busy} onVisibilityChange={props.onVisibilityChange} onDeleted={props.onDeleted} />
      </div>

      {expanded && <div id={`beat-fields-${beat.id}`} className="mt-4 min-w-0 space-y-4 border-t border-zinc-200 pt-4">
        {!selected && <p className="text-xs text-zinc-600">Tick this beat to edit its fields.</p>}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {input("title", "Track title")}
          {input("bpm", "BPM", "number", "e.g. 92.5")}
          {input("musicalKey", "Musical key")}
          <CatalogueTagsInput label={`Tags for ${beat.title}`} value={beat.tags || []} existingTags={props.existingTags}
            disabled={!selected || busy} onChange={(tags) => props.onChange("tags", tags)} />
          {input("priceStandard", "Leasing License price (£)", "number")}
          {input("pricePremium", "Exclusive License price (£)", "number")}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-w-0 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-sm font-black">Audio and downloads</h4>
            {input("mp3Url", "Public preview — tagged MP3 URL", "url", "https://.../tagged-preview.mp3")}
            {input("standardFileUrl", "Leasing License — untagged MP3 / WAV file path", "text", "untagged/beat-name.mp3")}
            {input("zipUrl", "Exclusive License — ZIP file path", "text", "beats/example/stems.zip")}
            <p className="text-xs text-zinc-600">Paid files use exact private R2 paths. Leasing delivers one untagged audio file; Exclusive delivers the ZIP.</p>
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={beat.freeDownload} disabled={!selected || busy}
              onChange={(event) => props.onChange("freeDownload", event.target.checked)} />Allow free tagged preview download</label>
          </div>
          <div className="min-w-0 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-sm font-black">Card images</h4>
            {input("artworkUrl", "Foreground image URL", "url", "https://res.cloudinary.com/...")}
            {input("backgroundUrl", "Background image URL", "url", "https://res.cloudinary.com/...")}
            <div className="flex flex-wrap gap-2">
              {(["artworkUrl", "backgroundUrl"] as const).map((field) => <div key={field} className="flex flex-wrap gap-2">
                <button type="button" disabled={!selected || busy} onClick={() => props.onChooseImage(field, false)} className="rounded bg-blue-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Choose {field === "artworkUrl" ? "front" : "background"}</button>
                <button type="button" disabled={!selected || busy} onClick={() => props.onChooseImage(field, true)} className="rounded border border-zinc-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Upload {field === "artworkUrl" ? "front" : "background"}</button>
              </div>)}
              <button type="button" disabled={!selected || busy} onClick={() => { props.onChange("artworkUrl", ""); props.onChange("backgroundUrl", ""); }} className="px-2 py-2 text-xs font-bold text-red-700 underline disabled:opacity-40">Clear card images</button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">{beat.plays || 0} plays · {beat.downloads || 0} downloads</p>
          <button type="button" disabled={!props.selectedCount || busy} onClick={props.onSave} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{busy ? "Saving..." : `Save selected changes (${props.selectedCount})`}</button>
        </div>
      </div>}
    </article>
  );
}

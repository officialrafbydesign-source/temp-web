"use client";
import { useState } from "react";
export default function ArtistFileUpload({ artistId, purpose, label, onUploaded, onBusy }: { artistId: string; purpose: "preview" | "download" | "artwork"; label: string; onUploaded: (value: string) => void; onBusy: (busy: boolean) => void }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true); onBusy(true); setStatus("Uploading…");
    try {
      const fallback: Record<string, string> = { mp3: "audio/mpeg", wav: "audio/wav", flac: "audio/flac", ogg: "audio/ogg", m4a: "audio/mp4", aac: "audio/aac", zip: "application/zip", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
      const contentType = file.type && file.type !== "application/octet-stream" ? file.type : fallback[file.name.split(".").pop()?.toLowerCase() || ""] || "application/octet-stream";
      const response = await fetch("/api/artist/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ artistId, purpose, fileName: file.name, contentType, byteSize: file.size }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The upload could not be prepared.");
      const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
      if (!put.ok) throw new Error("The file could not be uploaded. Please try again or contact RAF.");
      onUploaded(purpose === "download" ? data.fileKey : data.mediaUrl);
      setStatus(`Uploaded: ${file.name}`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed. Please try again."); }
    finally { setBusy(false); onBusy(false); }
  }
  return <div><label className="block text-sm font-bold">{label}<input type="file" disabled={busy} accept={purpose === "artwork" ? ".jpg,.jpeg,.png,.webp,.gif" : purpose === "preview" ? ".mp3,.wav,.flac,.ogg,.m4a,.aac" : ".mp3,.wav,.flac,.ogg,.m4a,.aac,.zip"} onChange={event => { const file = event.target.files?.[0]; if (file) upload(file); }} className="mt-2 block max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-bold file:text-emerald-950" /></label><p className="mt-1 text-xs text-zinc-600">{purpose === "artwork" ? "Images up to 20 MB." : purpose === "preview" ? "Audio up to 100 MB. Visitors can listen after RAF publishes it." : "Audio or ZIP up to 250 MB. Available to purchasers after approval."}</p>{status && <p role="status" className="mt-2 break-words text-sm text-emerald-900">{status}</p>}</div>;
}

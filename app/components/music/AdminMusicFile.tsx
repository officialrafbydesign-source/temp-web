"use client";
import { useEffect, useRef, useState } from "react";
import { musicFileSize, type MusicDownloadFile, type MusicFileKind, type MusicFormat } from "@/lib/musicDownloadFiles";

type Session = { token: string; multipart: boolean; partBytes: number; contentType: string; url?: string; fingerprint: string };
async function api(body: unknown) {
  const response = await fetch("/api/admin/music-files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The upload could not be completed.");
  return data;
}

export default function AdminMusicFile({ kind, format, value, onChange, onBusy }: { kind: MusicFileKind; format: MusicFormat; value?: MusicDownloadFile; onChange: (file?: MusicDownloadFile) => void; onBusy: (busy: boolean) => void }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkUrl, setCheckUrl] = useState("");
  useEffect(() => { setCheckUrl(""); }, [value?.key]);
  const controller = useRef<AbortController | null>(null);
  const label = `${format.toUpperCase()}${kind === "release" ? " release ZIP" : " track download"}`;
  async function upload(file: File) {
    const extension = kind === "release" ? ".zip" : `.${format}`;
    if (!file.name.toLowerCase().endsWith(extension)) { setStatus(`Choose a ${extension} file.`); return; }
    const fingerprint = `${kind}:${format}:${file.name}:${file.size}:${file.lastModified}`;
    const storageKey = `raf-music-upload:${fingerprint}`;
    setBusy(true); onBusy(true); setStatus("Preparing upload…");
    const abort = new AbortController();controller.current = abort;
    try {
      let session: Session | null = null;
      try { session = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { /* Storage is optional. */ }
      let completed: number[] = [];
      if (session?.fingerprint === fingerprint) {
        try {
          const progress = await api({ action: "status", token: session.token });
          if (progress.complete && progress.file) { onChange(progress.file); setStatus(`Ready: ${file.name}. Save the release to attach it.`); localStorage.removeItem(storageKey); return; }
          completed = progress.parts || [];
        } catch { session = null; }
      }
      if (!session) {
        session = { ...await api({ action: "start", kind, format, name: file.name, bytes: file.size }), fingerprint } as Session;
        try { localStorage.setItem(storageKey, JSON.stringify(session)); } catch { /* Upload still works without saved progress. */ }
      }
      if (session.multipart) {
        const count = Math.ceil(file.size / session.partBytes);
        for (let number = 1; number <= count; number++) {
          if (abort.signal.aborted) throw new DOMException("Paused", "AbortError");
          if (completed.includes(number)) continue;
          setStatus(`Uploading ${file.name}: part ${number} of ${count} (${Math.round((number - 1) / count * 100)}%)`);
          const { url } = await api({ action: "part", token: session.token, number });
          const response = await fetch(url, { method: "PUT", body: file.slice((number - 1) * session.partBytes, Math.min(number * session.partBytes, file.size)), signal: abort.signal });
          if (!response.ok) throw new Error("An upload part failed. Select the same file to resume.");
        }
      } else {
        setStatus(`Uploading ${file.name}…`);
        const data = await api({ action: "put", token: session.token });
        const response = await fetch(data.url, { method: "PUT", headers: { "Content-Type": data.contentType }, body: file, signal: abort.signal });
        if (!response.ok) throw new Error("The upload failed. Select the same file to retry.");
      }
      const result = await api({ action: "complete", token: session.token });
      onChange(result.file);
      try { localStorage.removeItem(storageKey); } catch { /* Optional progress storage. */ }
      setStatus(`Ready: ${file.name}. Save the release to attach it.`);
    } catch (error) {
      setStatus(error instanceof Error && error.name === "AbortError" ? "Upload paused. Select the same file to resume." : error instanceof Error ? error.message : "Upload interrupted. Select the same file to resume.");
    } finally { setBusy(false); onBusy(false); controller.current = null; }
  }

  return <div className="min-w-0 rounded-xl border border-zinc-300 bg-white p-4 text-zinc-900">
    <label className="block text-sm font-bold">{label}<input type="file" accept={kind === "release" ? ".zip" : `.${format}`} disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) upload(file); event.target.value = ""; }} className="mt-3 block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-bold file:text-emerald-950" /></label>
    <p className="mt-2 text-sm text-zinc-600">{kind === "release" ? "ZIP up to 4 GiB. Choose a ZIP containing the labelled files in this format." : "Audio up to 512 MiB. Add title, artist, release, track number and artwork tags before uploading."}</p>
    {value && <div className="mt-3 break-words text-sm"><p className="font-bold">{value.name}{value.bytes ? ` · ${musicFileSize(value.bytes)}` : ""}</p><div className="mt-2 flex flex-wrap gap-3">
      <button type="button" disabled={busy} onClick={async () => { setStatus("Checking the private file…"); try { const result = await api({ action: "check", key: value.key, kind, format }); onChange(result.file); setCheckUrl(result.downloadUrl);setStatus("Private file found. Download a copy below to check the audio and tags."); } catch (error) { setStatus(error instanceof Error ? error.message : "The private file could not be checked."); } }} className="font-bold text-emerald-800 underline">Check stored file</button>
      {checkUrl && <a href={checkUrl} className="font-bold text-emerald-800 underline">Download check copy</a>}
      <button type="button" disabled={busy} onClick={() => onChange(undefined)} className="font-bold text-red-700 underline">Remove from this release</button>
    </div></div>}
    <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">Use an existing private R2 file</summary><input aria-label={`${label} private R2 key`} disabled={busy} value={value?.key || ""} placeholder={`music/trexx/release/${kind === "release" ? format + ".zip" : "track." + format}`} onChange={event => { const key = event.target.value; onChange(key ? { key, name: key.split("/").pop() || key, bytes: null } : undefined); }} className="mt-2 w-full rounded-lg border border-zinc-300 p-2" /><p className="mt-1 text-zinc-600">Use the object key in the private paid-download bucket. Public URLs belong in streaming.</p></details>
    {busy && <button type="button" onClick={() => controller.current?.abort()} className="mt-3 rounded-lg border border-zinc-400 px-3 py-2 text-sm font-bold">Pause upload</button>}
    {status && <p role="status" className="mt-3 break-words text-sm leading-6">{status}</p>}
  </div>;
}

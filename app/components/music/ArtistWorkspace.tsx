"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ArtistFileUpload from "@/components/music/ArtistFileUpload";
import { Field, Check, inputClass } from "@/components/music/HubFields";
import { MUSIC_TYPES } from "@/lib/musicHub";
type Row = Record<string, any>;
const newTrack = () => ({ title: "", audioUrl: "", fileUrl: "", duration: "", price: "", sellIndividually: false });
const newDraft = () => ({ title: "", type: "single", coverUrl: "", description: "", price: "0", fileUrl: "", tracks: [newTrack()] });
const button = "rounded-lg bg-emerald-400 px-5 py-3 font-bold text-black hover:bg-emerald-300 disabled:opacity-50";
export default function ArtistWorkspace() {
  const [access, setAccess] = useState<Row[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [draft, setDraft] = useState<Row>(newDraft);
  const [editingId, setEditingId] = useState("");
  const [targetReleaseId, setTargetReleaseId] = useState("");
  async function load() {
    const response = await fetch("/api/artist", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load your dashboard.");
    setAccess(result); setSelected(current => current || result[0]?.artistId || "");
  }
  useEffect(() => { load().catch(error => setMessage(error.message)).finally(() => setLoading(false)); }, []);
  const active = access.find(row => row.artistId === selected);
  function reset() { setDraft(newDraft()); setEditingId(""); setTargetReleaseId(""); setAccepted(false); }
  async function send(body: Row) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/artist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, artistId: selected }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your changes.");
      await load();
      if (body.action === "save") {
        if (body.submit) reset(); else setEditingId(result.id);
      }
      setMessage(body.action === "accept" ? "Agreement accepted. You can now add tracks." : body.submit ? "Submitted to RAF for review." : "Draft saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your changes."); }
    finally { setBusy(false); }
  }
  function trackField(index: number, key: string, value: unknown) { setDraft({ ...draft, tracks: draft.tracks.map((track: Row, i: number) => i === index ? { ...track, [key]: value } : track) }); }
  if (loading) return <p className="mt-6" role="status">Loading your artist account…</p>;
  return <div className="mt-6 space-y-6">
    {message && <p role="status" className="rounded-xl border border-emerald-500/40 bg-black/80 p-4">{message}</p>}
    {!access.length && <div className="rounded-2xl border border-white/15 bg-black/80 p-6"><h2 className="text-2xl font-bold">Artist access is by invitation</h2><p className="mt-3 leading-7 text-zinc-300">RAF grants access after agreeing how you will work together. Register and verify your account, then contact RAF to arrange artist access.</p><Link href="/contact" className="mt-4 inline-block font-bold text-emerald-300 underline">Contact RAF</Link></div>}
    {active && <fieldset disabled={busy} className="min-w-0 space-y-6 disabled:opacity-60">
      <label className="block max-w-md text-sm font-bold">Artist<select value={selected} onChange={event => { setSelected(event.target.value); reset(); }} className={inputClass}>{access.map(row => <option key={row.artistId} value={row.artistId}>{row.artist.name}</option>)}</select></label>
      {!active.agreementAcceptedAt ? <section className="space-y-5 rounded-2xl border border-white/20 bg-black/85 p-6"><h2 className="text-2xl font-bold">Your artist agreement</h2><p className="text-zinc-300">Read your agreement before accepting version {active.agreementVersion}.</p><a href={active.agreementUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-emerald-300 underline">Open agreement ↗</a><Check label={`I have read and accept agreement version ${active.agreementVersion}.`} checked={accepted} onChange={setAccepted} /><button type="button" disabled={!accepted} className={button} onClick={() => send({ action: "accept", accepted: true, agreementVersion: active.agreementVersion, agreementUrl: active.agreementUrl })}>Accept agreement</button></section> : <>
        <form className="space-y-6 rounded-2xl border border-zinc-300 bg-white p-5 text-zinc-950 sm:p-7" onSubmit={event => { event.preventDefault(); send({ action: "save", id: editingId, targetReleaseId, data: draft, submit: true }); }}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">{editingId ? "Edit draft" : "Add music"}</h2><button type="button" onClick={reset} className="font-bold text-emerald-800 underline">New draft</button></div>
          <p className="text-sm leading-6 text-zinc-600">Add a new release or submit additional tracks for one of your existing releases. Upload preview audio, full download files and artwork below. RAF reviews submissions before publishing; your previews become public when the release is published.</p>
          <label className="block text-sm font-bold">Add to<select value={targetReleaseId} onChange={event => setTargetReleaseId(event.target.value)} className={inputClass}><option value="">A new release</option>{active.artist.releases.map((release: Row) => <option key={release.id} value={release.id}>{release.title}</option>)}</select></label>
          <Field label={targetReleaseId ? "Submission title" : "Release title"} required value={draft.title} onChange={title => setDraft({ ...draft, title })} />
          {!targetReleaseId && <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Release type<select value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value })} className={inputClass}>{MUSIC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></label><Field label="Suggested full-release price (£)" type="number" value={draft.price} onChange={price => setDraft({ ...draft, price })} /><div className="space-y-3"><ArtistFileUpload key={`cover-${selected}-${editingId}`} artistId={selected} purpose="artwork" label="Upload release artwork" onBusy={setBusy} onUploaded={coverUrl => setDraft({ ...draft, coverUrl })} />{draft.coverUrl && <p className="text-sm font-bold text-emerald-800">Artwork attached ✓</p>}<details><summary className="cursor-pointer text-xs text-zinc-600">Use an existing image link</summary><Field label="Image URL" type="url" value={String(draft.coverUrl || "").startsWith("/") ? "" : draft.coverUrl || ""} onChange={coverUrl => setDraft({ ...draft, coverUrl })} /></details></div><div><ArtistFileUpload key={`release-${selected}-${editingId}`} artistId={selected} purpose="download" label="Upload full release (ZIP or audio)" onBusy={setBusy} onUploaded={fileUrl => setDraft({ ...draft, fileUrl })} />{draft.fileUrl && <p className="mt-2 text-sm font-bold text-emerald-800">Full-release download attached ✓</p>}</div></div>}
          <Field label="Release description / notes for RAF" multiline value={draft.description || ""} onChange={description => setDraft({ ...draft, description })} />
          <div className="space-y-5">{draft.tracks.map((track: Row, index: number) => <section key={index} className="space-y-4 rounded-xl border border-zinc-300 bg-zinc-50 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-black">Track {index + 1}</h3>{draft.tracks.length > 1 && <button type="button" className="text-sm text-red-800 underline" onClick={() => setDraft({ ...draft, tracks: draft.tracks.filter((_: Row, i: number) => i !== index) })}>Remove track {index + 1}</button>}</div><Field label="Track title" required value={track.title} onChange={value => trackField(index, "title", value)} /><ArtistFileUpload key={`preview-${selected}-${editingId}-${index}`} artistId={selected} purpose="preview" label="Upload audio preview" onBusy={setBusy} onUploaded={value => trackField(index, "audioUrl", value)} />{track.audioUrl && <div><p className="text-sm font-bold text-emerald-800">Audio preview attached ✓</p><audio controls preload="none" src={track.audioUrl} className="mt-2 w-full" /></div>}<details><summary className="cursor-pointer text-xs text-zinc-600">Use an existing public preview link</summary><Field label="Audio preview URL" type="url" value={String(track.audioUrl || "").startsWith("/") ? "" : track.audioUrl || ""} onChange={value => trackField(index, "audioUrl", value)} /></details><div className="grid gap-4 sm:grid-cols-2"><div><ArtistFileUpload key={`track-${selected}-${editingId}-${index}`} artistId={selected} purpose="download" label="Upload full track for download" onBusy={setBusy} onUploaded={value => trackField(index, "fileUrl", value)} />{track.fileUrl && <p className="mt-2 text-sm font-bold text-emerald-800">Track download attached ✓</p>}</div><Field label="Duration in seconds (optional)" type="number" value={track.duration || ""} onChange={value => trackField(index, "duration", value)} /></div><Check label="Offer this track individually" checked={track.sellIndividually} onChange={value => trackField(index, "sellIndividually", value)} />{track.sellIndividually && <Field label="Suggested track price (£)" type="number" value={track.price ?? ""} onChange={value => trackField(index, "price", value)} />}</section>)}</div>
          {draft.tracks.length < 100 && <button type="button" className="font-bold text-emerald-800 underline" onClick={() => setDraft({ ...draft, tracks: [...draft.tracks, newTrack()] })}>+ Add another track</button>}
          <div className="flex flex-wrap gap-3"><button type="button" className="rounded-lg border border-zinc-500 px-5 py-3 font-bold" onClick={() => send({ action: "save", id: editingId, targetReleaseId, data: draft, submit: false })}>Save draft</button><button className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white">Submit to RAF</button></div>
        </form>
        <section className="space-y-4 rounded-2xl border border-white/15 bg-black/80 p-6"><h2 className="text-2xl font-bold">Your submissions</h2>{!active.submissions.length && <p className="text-zinc-400">Your drafts and submitted tracks will appear here.</p>}{active.submissions.map((submission: Row) => <article key={submission.id} className="rounded-xl border border-white/15 p-4"><p className="text-xs font-bold uppercase text-emerald-300">{submission.status}</p><h3 className="mt-2 text-lg font-bold">{submission.data.title}</h3>{submission.reviewNote && <p className="mt-3 whitespace-pre-line text-zinc-300">RAF: {submission.reviewNote}</p>}{["draft", "rejected"].includes(submission.status) && <button type="button" className="mt-3 font-bold text-emerald-300 underline" onClick={() => { setEditingId(submission.id); setTargetReleaseId(submission.targetReleaseId || ""); setDraft(submission.data); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit draft</button>}</article>)}</section>
      </>}
    </fieldset>}
  </div>;
}

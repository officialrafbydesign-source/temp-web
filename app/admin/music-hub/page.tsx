"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../components/AdminLayout";
import { Field, Check, LinkFields, inputClass } from "@/components/music/HubFields";
import { EXTRA_KINDS, EXTRA_ACCESS, type HubLink } from "@/lib/musicHub";

type Row = Record<string, any>;
type HubData = { artists: Row[]; releases: Row[]; extras: Row[]; access: Row[]; submissions: Row[] };
const blankArtist = () => ({ id: "", name: "", slug: "", biography: "", imageUrl: "", bannerUrl: "", links: [] as HubLink[], isProfilePublished: false });
const blankExtra = (artistId = "") => ({ id: "", artistId, releaseId: "", title: "", description: "", kind: "artwork", access: "public", url: "", fileKey: "", previewImageUrl: "", seriesTitle: "", episodeNo: "", sortOrder: 0, rafOnly: false, isPublished: false });
const button = "rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50";
const box = "space-y-5 rounded-2xl border border-zinc-300 bg-white p-5 sm:p-7";
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { id: string; name: string }[] }) {
  return <label className="block text-sm font-bold">{label}<select value={value} onChange={event => onChange(event.target.value)} className={inputClass}>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>;
}

export default function MusicHubAdmin() {
  const [data, setData] = useState<HubData>({ artists: [], releases: [], extras: [], access: [], submissions: [] });
  const [tab, setTab] = useState("Artists");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [artist, setArtist] = useState<Row>(blankArtist);
  const [extra, setExtra] = useState<Row>(blankExtra);
  const [releaseId, setReleaseId] = useState("");
  const [standardLinks, setStandardLinks] = useState<HubLink[]>([]);
  const [packageNote, setPackageNote] = useState("");
  const [grant, setGrant] = useState({ artistId: "", email: "", agreementUrl: "", agreementVersion: "" });
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch("/api/admin/music-hub", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load music management.");
    setData(result);
  }
  useEffect(() => { load().catch(error => setMessage(error.message)).finally(() => setLoading(false)); }, []);
  async function save(body: Row) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/music-hub", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The change could not be saved.");
      await load();
      setMessage(body.action === "review" && body.decision === "approve" ? "Approved. New releases are saved hidden in Music Management for your final pricing, download and publishing checks. Tracks added to an existing release are now attached to it." : "Saved.");
      return result;
    } catch (error) { setMessage(error instanceof Error ? error.message : "The change could not be saved."); return null; }
    finally { setBusy(false); }
  }
  function chooseRelease(id: string) {
    setReleaseId(id);
    const release = data.releases.find(row => row.id === id);
    setStandardLinks(release?.standardLinks || []); setPackageNote(release?.packageNote || "");
  }
  const artists = [{ id: "", name: "Choose artist" }, ...data.artists.map(row => ({ id: row.id, name: row.name }))];
  const artistName = (id: string) => data.artists.find(row => row.id === id)?.name || "Artist";

  return <AdminLayout active="music-hub"><div className="mx-auto max-w-6xl space-y-6 text-zinc-950">
    <header><h1 className="text-3xl font-black">Artists &amp; release content</h1><p className="mt-2 text-zinc-600">Manage artist pages, additional content and approved artist accounts.</p><Link href="/admin/music-management" className="mt-3 inline-block font-bold text-emerald-800 underline">Manage releases, tracklists &amp; prices →</Link></header>
    <nav className="flex flex-wrap gap-2" aria-label="Music management sections">{["Artists", "Release pages", "Additional content", "Artist accounts", "Submissions"].map(name => <button type="button" key={name} onClick={() => setTab(name)} aria-pressed={tab === name} className={`rounded-lg border px-4 py-2 text-sm font-bold ${tab === name ? "border-black bg-black text-white" : "border-zinc-400 bg-white"}`}>{name}{name === "Submissions" ? ` (${data.submissions.filter(row => row.status === "submitted").length})` : ""}</button>)}</nav>
    {message && <p role="status" className="rounded-lg border border-emerald-700 bg-emerald-50 p-4 text-emerald-950">{message}</p>}
    {loading ? <p role="status">Loading…</p> : <fieldset disabled={busy} className="min-w-0 space-y-6 disabled:opacity-70">
      {tab === "Artists" && <>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setArtist(blankArtist())} className="rounded-lg border border-zinc-400 bg-white px-4 py-2 font-bold">+ New artist</button>{data.artists.map(row => <button type="button" key={row.id} onClick={() => setArtist({ ...blankArtist(), ...row, links: row.links || [] })} className={`rounded-lg border px-4 py-2 ${artist.id === row.id ? "border-emerald-700 bg-emerald-100" : "border-zinc-300 bg-white"}`}>{row.name}{row.isProfilePublished ? " · Live" : " · Hidden"}</button>)}</div>
        <form className={box} onSubmit={async event => { event.preventDefault(); const result = await save({ action: "artist", ...artist }); if (result?.id) setArtist({ ...artist, id: result.id }); }}>
          <h2 className="text-xl font-black">{artist.id ? "Edit artist page" : "Create artist page"}</h2>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Artist name" required value={artist.name} onChange={name => setArtist({ ...artist, name })} /><Field label="Page address" value={artist.slug || ""} onChange={slug => setArtist({ ...artist, slug })} hint="For example trexx becomes /music/artists/trexx. Keep it unchanged after sharing links." /><Field label="Profile image URL" type="url" value={artist.imageUrl || ""} onChange={imageUrl => setArtist({ ...artist, imageUrl })} /><Field label="Banner image URL" type="url" value={artist.bannerUrl || ""} onChange={bannerUrl => setArtist({ ...artist, bannerUrl })} /></div>
          <Field label="Biography" multiline value={artist.biography || ""} onChange={biography => setArtist({ ...artist, biography })} />
          <LinkFields links={artist.links} onChange={links => setArtist({ ...artist, links })} />
          <Check label="Publish artist page" checked={artist.isProfilePublished} onChange={isProfilePublished => setArtist({ ...artist, isProfilePublished })} />
          <div className="flex flex-wrap items-center gap-4"><button className={button}>{busy ? "Saving…" : "Save artist"}</button>{artist.id && artist.isProfilePublished && <Link href={`/music/artists/${encodeURIComponent(artist.slug || artist.id)}`} className="font-bold text-emerald-800 underline">View artist page →</Link>}</div>
        </form>
      </>}
      {tab === "Release pages" && <form className={box} onSubmit={event => { event.preventDefault(); save({ action: "release", releaseId, standardLinks, packageNote }); }}>
        <h2 className="text-xl font-black">Standard release links &amp; the RAF edition</h2>
        <Select label="Release" value={releaseId} onChange={chooseRelease} options={[{ id: "", name: "Choose release" }, ...data.releases.map(row => ({ id: row.id, name: `${row.title} · ${artistName(row.artistId)}` }))]} />
        <p className="text-sm leading-6 text-zinc-600">Link the complete standard release on YouTube, streaming services or other platforms. Describe the additional material included with the RAF edition below.</p>
        <LinkFields links={standardLinks} onChange={setStandardLinks} />
        <Field label="What is included in the RAF edition?" multiline value={packageNote} onChange={setPackageNote} hint="Use actual details, such as the extended tracks, bonus tracks, videos or artwork included." />
        <button className={button} disabled={!releaseId}>Save release page</button>
      </form>}
      {tab === "Additional content" && <>
        <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => setExtra(blankExtra())} className={button}>+ Add content</button><p className="text-sm text-zinc-600">Artwork, GIFs, videos, audio, downloads and series episodes.</p></div>
        <form className={box} onSubmit={async event => { event.preventDefault(); const result = await save({ action: "extra", ...extra }); if (result?.id) setExtra({ ...extra, id: result.id }); }}>
          <h2 className="text-xl font-black">{extra.id ? "Edit additional content" : "New additional content"}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Artist" value={extra.artistId} onChange={artistId => setExtra({ ...extra, artistId, releaseId: "" })} options={artists} />
            <Select label="Related release (optional)" value={extra.releaseId || ""} onChange={releaseId => setExtra({ ...extra, releaseId })} options={[{ id: "", name: "Artist page only" }, ...data.releases.filter(row => row.artistId === extra.artistId).map(row => ({ id: row.id, name: row.title }))]} />
            <Field label="Title" value={extra.title} onChange={title => setExtra({ ...extra, title })} required />
            <Select label="Content type" value={extra.kind} onChange={kind => setExtra({ ...extra, kind })} options={EXTRA_KINDS.map(id => ({ id, name: id === "episode" ? "Series episode" : id }))} />
            <Select label="Access" value={extra.access} onChange={access => setExtra({ ...extra, access, ...(access !== "public" ? { url: "" } : {}) })} options={EXTRA_ACCESS.map(id => ({ id, name: id === "public" ? "Public · free" : id === "members" ? "Verified members · free" : "Included with purchase of the full release" }))} />
            <Field label="Display order" type="number" value={extra.sortOrder} onChange={sortOrder => setExtra({ ...extra, sortOrder })} hint="Lower numbers appear first." />
          </div>
          <Field label="Description" multiline value={extra.description || ""} onChange={description => setExtra({ ...extra, description })} />
          {extra.access === "public" && <Field label="Public media URL" type="url" value={extra.url || ""} onChange={url => setExtra({ ...extra, url, ...(url ? { fileKey: "" } : {}) })} hint="A direct image/GIF, audio or video link; YouTube and Vimeo videos are also supported." />}
          <Field label="Private R2 file key" value={extra.fileKey || ""} onChange={fileKey => setExtra({ ...extra, fileKey, ...(fileKey ? { url: "" } : {}) })} hint="Required for member or purchase access. Upload to the existing PRIVATE download bucket, then enter the key, for example music/trexx/bonus.mp4. Keep public-preview files separate." />
          <Field label="Public preview image URL (optional)" type="url" value={extra.previewImageUrl || ""} onChange={previewImageUrl => setExtra({ ...extra, previewImageUrl })} hint="Visible to everyone, including visitors who cannot open the full content." />
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Series title (optional)" value={extra.seriesTitle || ""} onChange={seriesTitle => setExtra({ ...extra, seriesTitle })} hint="For example LifestyleofaRapper." /><Field label="Episode number (optional)" type="number" value={extra.episodeNo || ""} onChange={episodeNo => setExtra({ ...extra, episodeNo })} /></div>
          <Check label="Available only on RAF" checked={extra.rafOnly} onChange={rafOnly => setExtra({ ...extra, rafOnly })} />
          <Check label="Publish this content" checked={extra.isPublished} onChange={isPublished => setExtra({ ...extra, isPublished })} />
          <p className="text-xs text-zinc-600">The artist page must also be published. Release-linked content stays hidden while its release is hidden.</p>
          <button className={button} disabled={!extra.artistId}>Save content</button>
        </form>
        <div className="space-y-3">{data.extras.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-300 bg-white p-4"><div><p className="font-bold">{row.title}</p><p className="text-sm text-zinc-600">{artistName(row.artistId)} · {row.kind} · {row.access} · {row.isPublished ? "Published" : "Hidden"}</p></div><div className="flex gap-4"><button type="button" className="font-bold text-emerald-800 underline" onClick={() => { setExtra({ ...blankExtra(), ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button type="button" className="text-red-800 underline" onClick={() => { if (window.confirm(`Remove “${row.title}” from the content library?`)) save({ action: "removeExtra", id: row.id }); }}>Remove</button></div></div>)}</div>
      </>}
      {tab === "Artist accounts" && <>
        <form className={box} onSubmit={event => { event.preventDefault(); save({ action: "access", ...grant }); }}><h2 className="text-xl font-black">Grant artist access</h2><p className="text-sm leading-6 text-zinc-600">The artist registers a normal RAF account and verifies their email first. Link their agreed document and version below. They must accept it before submitting tracks. Granting access does not send an email.</p>
          <Select label="Artist" value={grant.artistId} onChange={artistId => setGrant({ ...grant, artistId })} options={artists} />
          <Field label="Verified account email" type="email" required value={grant.email} onChange={email => setGrant({ ...grant, email })} />
          <Field label="Agreement document URL" type="url" required value={grant.agreementUrl} onChange={agreementUrl => setGrant({ ...grant, agreementUrl })} hint="Use the actual agreement you have prepared with the artist. Use a document link whose access settings are appropriate for its contents." />
          <Field label="Agreement version" required value={grant.agreementVersion} onChange={agreementVersion => setGrant({ ...grant, agreementVersion })} hint="Changing the agreement document or version requires fresh acceptance." />
          <button className={button} disabled={!grant.artistId}>Grant access</button>
        </form>
        <div className={box}><h2 className="text-xl font-black">Artist accounts</h2>{data.access.length ? data.access.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4"><div><p className="font-bold">{row.artist.name}</p><p className="text-sm">{row.user.email}</p><p className="text-xs text-zinc-600">Agreement {row.agreementVersion} · {row.agreementAcceptedAt ? `Accepted ${new Date(row.agreementAcceptedAt).toLocaleDateString("en-GB")}` : "Awaiting acceptance"}</p></div><button type="button" onClick={() => save({ action: "toggleAccess", id: row.id, isActive: !row.isActive })} className="rounded-lg border border-zinc-400 px-4 py-2 font-bold">{row.isActive ? "Suspend access" : "Restore access"}</button></div>) : <p className="text-zinc-600">No artist accounts have been granted access.</p>}</div>
      </>}
      {tab === "Submissions" && <div className="space-y-5">{!data.submissions.length && <p className={box}>No submissions yet.</p>}{data.submissions.map(row => <article key={row.id} className={box}>
        <div><p className="text-xs font-bold uppercase text-emerald-800">{row.artist.name} · {row.status}</p><h2 className="mt-2 text-2xl font-black">{row.data.title}</h2><p className="mt-2 text-sm text-zinc-600">{row.targetReleaseId ? "Additional tracks for an existing release" : `New ${row.data.type} · £${Number(row.data.price).toFixed(2)}`}</p></div>
        {row.data.description && <p className="whitespace-pre-line">{row.data.description}</p>}
        {row.data.coverUrl && <img src={row.data.coverUrl} alt="Submitted release artwork" className="max-h-48 max-w-48 rounded-lg object-contain" />}
        <ol className="space-y-4">{(row.data.tracks || []).map((track: Row, index: number) => <li key={index} className="rounded-lg border border-zinc-200 p-3"><p className="font-bold">{index + 1}. {track.title}</p>{track.audioUrl && <audio controls preload="none" src={track.audioUrl} className="mt-2 w-full" />}<p className="mt-2 break-all text-xs text-zinc-600">Download key: {track.fileUrl || "Not supplied"}</p></li>)}</ol>
        {row.reviewNote && <p className="rounded-lg bg-zinc-100 p-3 text-sm">Review note: {row.reviewNote}</p>}
        {row.status === "submitted" && <><Field label="Review note" multiline value={reviewNotes[row.id] || ""} onChange={note => setReviewNotes({ ...reviewNotes, [row.id]: note })} /><div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={() => save({ action: "review", id: row.id, decision: "approve", reviewNote: reviewNotes[row.id] || "" })}>Approve submission</button><button type="button" className="rounded-lg border border-red-700 px-5 py-3 font-bold text-red-800" onClick={() => save({ action: "review", id: row.id, decision: "reject", reviewNote: reviewNotes[row.id] || "" })}>Return for changes</button></div></>}
      </article>)}</div>}
    </fieldset>}
  </div></AdminLayout>;
}

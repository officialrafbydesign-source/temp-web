"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { musicFileSize, type MusicDownloadChoice } from "@/lib/musicDownloadFiles";
export default function ReleaseDownloadOptions({ releaseId }: { releaseId: string }) {
  const [access, setAccess] = useState<{ owned: boolean; downloads: MusicDownloadChoice[] } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setAccess(null);setError(false);
    fetch(`/api/music/release/${encodeURIComponent(releaseId)}/access`, { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Unable to check downloads");
      setAccess(await response.json());
    }).catch(error => { if (error.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [releaseId]);
  if (error) return <p role="status" className="mt-4 text-sm text-zinc-300">Your downloads could not be checked. <Link href="/account/orders" className="underline">Open your account</Link>.</p>;
  if (!access?.owned) return null;
  return <section className="mt-6 border-t border-emerald-400/30 pt-5"><h2 className="text-lg font-bold text-emerald-200">Your release downloads</h2>
    {access.downloads.length ? <div className="mt-3 flex flex-wrap gap-3">{access.downloads.map(file => <a key={file.format} href={file.url} className="rounded-xl bg-emerald-400 px-4 py-3 text-base font-bold text-black hover:bg-emerald-300">Download {file.label}{file.bytes ? ` · ${musicFileSize(file.bytes)}` : ""}</a>)}</div>
      : <p className="mt-2 text-sm text-zinc-300">Your purchase is recorded. The release download files have not been added yet.</p>}
  </section>;
}

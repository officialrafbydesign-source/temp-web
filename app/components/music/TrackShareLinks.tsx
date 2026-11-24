"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { musicTrackPath, musicTrackUrl } from "@/lib/musicTrackLinks";

export default function TrackShareLinks({ id }: { id: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const url = musicTrackUrl(id);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Story link copied.");
    } catch {
      input.current?.focus();
      input.current?.select();
      setMessage("Select and copy the link above.");
    }
  }

  return <div className="min-w-0 space-y-2 text-sm">
    <input ref={input} aria-label="Public track link for stories" readOnly value={url} onFocus={event => event.currentTarget.select()} className="w-full min-w-0 rounded-lg border border-current/25 bg-transparent px-3 py-2 text-inherit" />
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={copy} className="rounded-lg border border-current/30 px-3 py-2 font-bold hover:opacity-75">Copy story link</button>
      <Link href={musicTrackPath(id)} target="_blank" rel="noopener noreferrer" prefetch={false} className="font-bold underline underline-offset-4">Open track page</Link>
    </div>
    <p role="status" className="min-h-5">{message}</p>
  </div>;
}

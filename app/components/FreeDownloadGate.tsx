"use client";

import { useState } from "react";

export default function FreeDownloadGate({
  beatId,
  downloadUrl,
}: {
  beatId: string;
  downloadUrl: string;
}) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    if (!email) return;

    setLoading(true);

    await fetch("/api/free-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        beatId,
        email,
      }),
    });

    setUnlocked(true);
    setLoading(false);
  }

  if (unlocked) {
    return (
      <a
        href={downloadUrl}
        download
        className="block text-center border border-green-500 px-6 py-3 rounded hover:bg-green-600"
      >
        Download Beat
      </a>
    );
  }

  return (
    <div className="space-y-3">

      <input
        type="email"
        placeholder="Enter email to download"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-black border border-red-500 px-4 py-2 rounded"
      />

      <button
        onClick={handleUnlock}
        disabled={loading}
        className="w-full border border-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        {loading ? "Unlocking..." : "Unlock Free Download"}
      </button>

    </div>
  );
}

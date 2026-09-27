"use client";

import { useState } from "react";

export default function EmailGateModal({
  onSubmit,
}: {
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Free Download
        </h2>

        <p className="text-red-200 text-sm mb-4">
          Enter your email to receive this free beat.
        </p>

        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded mb-4 text-black"
        />

        <button
          onClick={() => onSubmit(email)}
          className="bg-yellow-400 text-black px-4 py-2 rounded w-full font-bold"
        >
          Download
        </button>
      </div>
    </div>
  );
}

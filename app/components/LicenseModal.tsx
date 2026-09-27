"use client";

import { useState } from "react";

interface License {
  id: string;
  name: string;
  price: number;
}

interface Beat {
  id: string;
  title: string;
  artworkUrl?: string;
  licenses?: License[];
}

export default function LicenseModal({
  beat,
  onClose,
}: {
  beat?: Beat;
  onClose: () => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (licenseId: string) => {
    if (!beat?.id) return;

    try {
      setLoadingId(licenseId);
      const res = await fetch("/api/checkout/beat-licence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beatId: beat.id,
          licenseId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not connect to checkout service.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {beat ? `Select License for "${beat.title}"` : "License Options"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {beat?.licenses && beat.licenses.length > 0 ? (
          <div className="grid gap-4 mb-4">
            {beat.licenses.map((lic) => (
              <div
                key={lic.id}
                className="flex items-center justify-between p-4 bg-black/40 border border-red-700/50 rounded-lg"
              >
                <div>
                  <h4 className="text-lg font-bold text-white">{lic.name}</h4>
                  <p className="text-yellow-400 font-extrabold text-xl">${lic.price}</p>
                </div>

                <button
                  onClick={() => handleCheckout(lic.id)}
                  disabled={loadingId === lic.id}
                  className="bg-yellow-400 text-black font-extrabold px-5 py-2.5 rounded hover:bg-yellow-300 transition active:scale-95 disabled:opacity-50"
                >
                  {loadingId === lic.id ? "Loading..." : `Buy for $${lic.price}`}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <img
              src="/images/licenses-overview.png"
              alt="License overview"
              className="mb-4 rounded w-full object-cover"
            />
            <p className="text-red-200 text-sm">
              Full license details available on the licenses page.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-yellow-400 text-black px-6 py-2 font-bold rounded hover:bg-yellow-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
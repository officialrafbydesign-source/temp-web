"use client";

import { useState } from "react";
import ContractViewer from "@/components/ContractViewer";
import { LicenseType } from "@/lib/licenses";

type ContractItem = {
  beatId: string;
  beatTitle: string;
  licenseType: LicenseType;
  price: number;
  contractText: string;
  templateUrl: string;
};

export default function OrderSuccessPage() {
  const [activeContract, setActiveContract] = useState<ContractItem | null>(null);

  // Example order payload (this will come from your API or query params)
  const sampleOrder = {
    orderId: "RAF-894201",
    buyerName: "John Doe",
    buyerAlias: "John Doe Music",
    date: "Sun, 02 Aug 2026 15:00:00 GMT",
    contracts: [
      {
        beatId: "beat-1",
        beatTitle: "Night Shift",
        licenseType: "lease" as LicenseType,
        price: 60,
        templateUrl: "https://res.cloudinary.com/dcrkpsnn9/raw/upload/v1785681878/RAF_Lease_26_jmadfr.docx",
      },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto p-6 text-black space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-emerald-800">🎉 Order Confirmed!</h1>
        <p className="text-sm text-emerald-700 mt-1">
          Thank you for your purchase. Your licensing agreements are ready below.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Purchased Licensing Agreements</h2>

        <div className="divide-y">
          {sampleOrder.contracts.map((item) => (
            <div key={item.beatId} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{item.beatTitle}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  {item.licenseType === "exclusive" ? "Exclusive Rights" : "MP3/WAV Lease"} — £{item.price}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setActiveContract({
                      ...item,
                      contractText: "", // Generated inside viewer
                    })
                  }
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded hover:bg-zinc-800"
                >
                  📄 View Agreement
                </button>

                <a
                  href={item.templateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-semibold rounded hover:bg-zinc-200"
                >
                  📥 Download DOCX
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Modal */}
      {activeContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <ContractViewer
              details={{
                licenseType: activeContract.licenseType,
                date: sampleOrder.date,
                buyerName: sampleOrder.buyerName,
                buyerAlias: sampleOrder.buyerAlias,
                beatTitle: activeContract.beatTitle,
                price: activeContract.price,
              }}
              onClose={() => setActiveContract(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import React from "react";
import { generateContractText, ContractDetails } from "@/lib/contractEngine";
import { LICENSE_CONFIGS } from "@/lib/licenses";

interface ContractViewerProps {
  details: ContractDetails;
  onClose?: () => void;
}

export default function ContractViewer({ details, onClose }: ContractViewerProps) {
  const contractText = generateContractText(details);
  const config = LICENSE_CONFIGS[details.licenseType];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-zinc-900 border border-zinc-200 rounded-lg p-6 max-w-4xl mx-auto shadow-xl font-mono text-sm">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 mb-6 print:hidden">
        <div>
          <h2 className="text-xl font-bold">{config.name}</h2>
          <p className="text-xs text-zinc-500">License Agreement Preview</p>
        </div>

        <div className="flex gap-2">
          <a
            href={config.templateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold border border-zinc-300 transition text-xs"
          >
            📥 Download Raw Template (.docx)
          </a>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition text-xs"
          >
            🖨️ Print Agreement
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-zinc-800 text-white rounded font-semibold text-xs"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Contract Document Body */}
      <div className="bg-zinc-50 p-6 rounded border border-zinc-200 whitespace-pre-wrap leading-relaxed print:bg-white print:p-0 print:border-none">
        {contractText}
      </div>
    </div>
  );
}
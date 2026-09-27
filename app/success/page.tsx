"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface OrderItemDetails {
  description: string;
  amountTotal: number;
  quantity: number;
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface OrderVerificationData {
  paid: boolean;
  status: string;
  productType: "beat" | "music" | "clothing" | "service" | "design";
  customerEmail: string;
  customerName?: string;
  amount: number;
  currency: string;
  shippingAddress?: ShippingAddress | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  downloadUrl?: string | null;
  contractPdfUrl?: string | null;
  lineItems?: OrderItemDetails[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderVerificationData | null>(null);
  const [status, setStatus] = useState<"loading" | "complete" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to verify payment");
        }

        return response.json() as Promise<OrderVerificationData>;
      })
      .then((data) => {
        if (data.status === "complete" || data.paid) {
          setOrder(data);
          setStatus("complete");
          return;
        }

        setStatus("error");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-black text-white">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <h1 className="text-xl font-mono">
          Verifying purchase &amp; loading details...
        </h1>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-black px-4 text-center text-white">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl font-bold text-red-500">
          ✕
        </div>

        <h1 className="text-2xl font-mono font-bold text-red-500">
          Verification Failed
        </h1>

        <p className="mt-2 max-w-md text-sm text-zinc-400">
          We could not verify this transaction, or the payment is still
          processing. Please check your email for confirmation.
        </p>

        <Link
          href="/"
          className="mt-6 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isDigital =
    order.productType === "beat" || order.productType === "music";

  const isClothing = order.productType === "clothing";

  return (
    <div className="min-h-[80vh] bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl font-bold text-emerald-400">
            ✓
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Payment Successful!
            </h1>

            <p className="mt-0.5 text-xs text-zinc-400">
              Order confirmation &amp; receipt sent to{" "}
              <span className="font-medium text-zinc-200">
                {order.customerEmail}
              </span>
            </p>
          </div>
        </div>

        {isDigital && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Your Downloads &amp; Licensing
            </h2>

            <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              {order.lineItems && order.lineItems.length > 0 ? (
                order.lineItems.map((item, index) => (
                  <div
                    key={`${item.description}-${index}`}
                    className="flex flex-col justify-between gap-3 border-b border-zinc-900 py-2 last:border-0 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {item.description}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500">
                        {order.productType === "beat"
                          ? "Untagged Audio Files (WAV + Stems) & Contract PDF"
                          : "High Quality Digital Release Files"}
                      </p>
                    </div>

                    {order.downloadUrl ? (
                      <a
                        href={order.downloadUrl}
                        download
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        Download Files
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          alert("Preparing download zip archive...")
                        }
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                      >
                        Download .ZIP
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">
                    Digital Product Package
                  </span>

                  <button
                    type="button"
                    onClick={() => alert("Initiating file download...")}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Download Files
                  </button>
                </div>
              )}

              {order.contractPdfUrl && (
                <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-xs">
                  <span className="text-zinc-400">License Agreement PDF</span>

                  <a
                    href={order.contractPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    View License
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {isClothing && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Delivery &amp; Order Status
            </h2>

            <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="mb-1 block text-zinc-500">Status</span>

                  <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                    Processing Shipment
                  </span>
                </div>

                <div>
                  <span className="mb-1 block text-zinc-500">Carrier</span>

                  <span className="font-medium text-zinc-200">
                    {order.carrier || "Royal Mail / DHL"}
                  </span>
                </div>
              </div>

              {order.trackingNumber ? (
                <div className="border-t border-zinc-900 pt-3 text-xs">
                  <span className="mb-1 block text-zinc-500">
                    Tracking Number
                  </span>

                  <span className="font-mono text-indigo-400">
                    {order.trackingNumber}
                  </span>
                </div>
              ) : (
                <div className="border-t border-zinc-900 pt-3 text-xs text-zinc-500">
                  Tracking number will be assigned once dispatched.
                </div>
              )}

              {order.shippingAddress && (
                <div className="border-t border-zinc-900 pt-3 text-xs">
                  <span className="mb-1 block font-semibold text-zinc-500">
                    Shipping Address
                  </span>

                  <p className="text-zinc-300">
                    {order.shippingAddress.name || order.customerName}
                  </p>

                  <p className="text-zinc-400">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2
                      ? `, ${order.shippingAddress.line2}`
                      : ""}
                  </p>

                  <p className="text-zinc-400">
                    {order.shippingAddress.city}, {order.shippingAddress.postal_code}
                  </p>

                  <p className="uppercase text-zinc-400">
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-4 sm:flex-row">
          <p className="text-xs text-zinc-500">
            Questions? Contact support with reference ID:{" "}
            <span className="font-mono text-zinc-400">
              {sessionId?.slice(-8) || "Unavailable"}
            </span>
          </p>

          <div className="flex w-full gap-3 sm:w-auto">
            <Link
              href={isClothing ? "/clothing" : "/music"}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-center text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 sm:w-auto"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-black text-sm font-mono text-zinc-400">
          Loading order summary...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

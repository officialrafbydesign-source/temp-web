"use client";

import {
  useEffect,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

type OrderItem = {
  id: string;
  title: string;
  product_type: string;
  quantity: number;
  unit_amount: number;
  licence_name?: string | null;
  is_digital: boolean;
  download_available: boolean;
  download_url?: string | null;
  download_message?: string | null;
};

type SessionData = {
  id: string;
  amount_total: number | null;
  currency: string | null;
  customer_email?: string | null;
  payment_status?: string | null;
  order_id?: string | null;
  order_status?: string | null;
  order_items?: OrderItem[];
};

const MAX_ORDER_CHECKS = 6;
const ORDER_CHECK_DELAY = 2000;

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id");

  const { clearCart } = useCart();

  const [sessionData, setSessionData] =
    useState<SessionData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshingOrder,
    setRefreshingOrder,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    let retryTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    let hasClearedCart = false;

    async function loadSession(
      attempt: number
    ) {
      if (!sessionId) {
        setError(
          "The checkout session is missing."
        );

        setLoading(false);

        return;
      }

      try {
        const response = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(
            sessionId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.error
        ) {
          throw new Error(
            data.error ||
              "Unable to retrieve the order."
          );
        }

        if (cancelled) return;

        setSessionData(data);
        setError(null);
        setLoading(false);

        if (
          data.payment_status ===
            "paid" &&
          !hasClearedCart
        ) {
          clearCart();
          hasClearedCart = true;
        }

        const paymentIsPaid =
          data.payment_status ===
          "paid";

        const orderIsPaid =
          data.order_status ===
          "paid";

        const shouldCheckAgain =
          paymentIsPaid &&
          !orderIsPaid &&
          attempt <
            MAX_ORDER_CHECKS;

        if (shouldCheckAgain) {
          setRefreshingOrder(true);

          retryTimer =
            setTimeout(
              () =>
                loadSession(
                  attempt + 1
                ),
              ORDER_CHECK_DELAY
            );
        } else {
          setRefreshingOrder(false);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve the order."
        );

        setLoading(false);
        setRefreshingOrder(false);
      }
    }

    loadSession(0);

    return () => {
      cancelled = true;

      if (retryTimer) {
        clearTimeout(
          retryTimer
        );
      }
    };
  }, [sessionId]);

  const orderItems =
    sessionData?.order_items || [];

  const digitalItems =
    orderItems.filter(
      (item) => item.is_digital
    );

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 text-center text-white font-mono">
      <div className="bg-zinc-950 border-4 border-black p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-black font-black text-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ✓
        </div>

        <h1 className="text-3xl font-black uppercase text-red-500 mb-2">
          Payment Successful
        </h1>

        <p className="text-zinc-400 text-xs uppercase tracking-widest mb-6 font-bold">
          Thank you for your purchase. Your order is confirmed.
        </p>

        {loading && (
          <div className="py-6 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />

            <span className="text-zinc-500 text-xs">
              Retrieving session details...
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950/40 border-2 border-red-700 p-4 rounded text-left text-xs mb-8">
            <p className="font-bold text-red-400">
              {error}
            </p>
          </div>
        )}

        {sessionData && (
          <>
            <div className="bg-zinc-900 border-2 border-black p-4 rounded text-left text-xs mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-zinc-500 font-bold">
                  CUSTOMER EMAIL:
                </span>

                <span className="font-bold text-zinc-100 break-all">
                  {sessionData.customer_email ||
                    "N/A"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-zinc-500 font-bold">
                  AMOUNT PAID:
                </span>

                <span className="font-bold text-red-500">
                  £
                  {(
                    (sessionData.amount_total ||
                      0) / 100
                  ).toFixed(2)}
                </span>
              </div>

              {sessionData.order_id && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-zinc-500 font-bold">
                    ORDER:
                  </span>

                  <span className="font-bold text-zinc-100 break-all">
                    {
                      sessionData.order_id
                    }
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-zinc-500 font-bold">
                  STATUS:
                </span>

                <span className="font-bold text-zinc-100 uppercase">
                  {sessionData.order_status ||
                    sessionData.payment_status ||
                    "PROCESSING"}
                </span>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="bg-zinc-900 border-2 border-black p-4 rounded text-left text-xs mb-6">
                <h2 className="font-black text-red-500 uppercase tracking-wider mb-3">
                  Order Items
                </h2>

                <div className="space-y-3">
                  {orderItems.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="border-b border-zinc-700 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-bold text-zinc-100">
                            {
                              item.title
                            }
                          </span>

                          <span className="text-zinc-400">
                            £
                            {(
                              item.unit_amount /
                              100
                            ).toFixed(
                              2
                            )}{" "}
                            ×{" "}
                            {
                              item.quantity
                            }
                          </span>
                        </div>

                        {item.licence_name && (
                          <p className="text-zinc-500 mt-1">
                            {
                              item.licence_name
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {digitalItems.length >
              0 && (
              <div className="bg-zinc-900 border-2 border-black p-4 rounded text-left text-xs mb-8">
                <h2 className="font-black text-red-500 uppercase tracking-wider mb-3">
                  Digital Downloads
                </h2>

                {refreshingOrder && (
                  <div className="flex items-center gap-2 text-zinc-400 mb-4">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />

                    <span>
                      Confirming your order...
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {digitalItems.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="border-b border-zinc-700 pb-4 last:border-b-0 last:pb-0"
                      >
                        <p className="font-bold text-zinc-100 mb-2">
                          {
                            item.title
                          }
                        </p>

                        {item.download_available &&
                        item.download_url ? (
                          <a
                            href={
                              item.download_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 hover:bg-red-500 text-black font-black px-4 py-2 rounded border-2 border-black uppercase tracking-wider transition"
                          >
                            Download File
                          </a>
                        ) : (
                          <p className="text-amber-400">
                            {item.download_message ||
                              "Download unavailable."}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <Link
          href="/beats/store"
          className="inline-block bg-red-600 hover:bg-red-500 text-black font-black px-6 py-3 rounded border-2 border-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Back to Beat Store
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-white font-mono text-sm">
          Loading receipt...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
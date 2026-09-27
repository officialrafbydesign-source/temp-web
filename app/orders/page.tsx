"use client";

import {
  useEffect,
  useState,
} from "react";

import ContractViewer from "@/components/ContractViewer";

import {
  LICENSE_CONFIGS,
  LicenseType,
} from "@/lib/licenses";

type OrderItem = {
  id: string;
  beatTitle: string;
  licenseName: string;
  price: number;
  buyerName?: string;
  buyerAlias?: string;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
  items?: OrderItem[];
};

export default function OrderHistoryPage() {
  const [
    orders,
    setOrders,
  ] = useState<Order[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeContractItem,
    setActiveContractItem,
  ] = useState<{
    item: OrderItem;
    orderDate: string;
  } | null>(null);

  useEffect(() => {
    let isMounted =
      true;

    async function fetchOrders() {
      try {
        setError("");

        const response =
          await fetch(
            "/api/orders",
            {
              credentials:
                "include",

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load orders"
          );
        }

        if (isMounted) {
          setOrders(
            Array.isArray(
              data.orders
            )
              ? data.orders
              : []
          );
        }
      } catch (error) {
        console.error(
          "Error loading orders:",
          error
        );

        if (isMounted) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load orders"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(
            false
          );
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted =
        false;
    };
  }, []);

  const getLicenseType = (
    name: string
  ): LicenseType => {
    return name
      .toLowerCase()
      .includes("exclu")
      ? "exclusive"
      : "lease";
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6 text-black">
      <h1 className="text-3xl font-bold">
        Your Orders
      </h1>

      {loading && (
        <p className="text-zinc-500">
          Loading orders...
        </p>
      )}

      {!loading &&
        error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-4 font-semibold text-red-700"
          >
            {error}
          </div>
        )}

      {!loading &&
        !error &&
        orders.length ===
          0 && (
          <p className="text-zinc-500">
            No orders found.
          </p>
        )}

      <div className="space-y-6">
        {orders.map(
          (order) => {
            const formattedDate =
              new Date(
                order.createdAt
              ).toLocaleDateString(
                "en-GB",
                {
                  day:
                    "2-digit",

                  month:
                    "short",

                  year:
                    "numeric",
                }
              );

            return (
              <section
                key={
                  order.id
                }
                className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <p className="text-xl font-bold">
                      Order #
                      {
                        order.id
                      }
                    </p>

                    <p className="text-xs text-zinc-500">
                      Ordered on{" "}
                      {
                        formattedDate
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase text-zinc-800">
                      {
                        order.status
                      }
                    </span>

                    <p className="mt-1 text-lg font-bold">
                      £
                      {Number(
                        order.totalAmount
                      ).toFixed(
                        2
                      )}
                    </p>
                  </div>
                </div>

                {order.items &&
                order.items
                  .length >
                  0 ? (
                  <div className="space-y-3 pt-2">
                    <h2 className="text-sm font-semibold text-zinc-700">
                      Purchased
                      Beats &
                      Licences:
                    </h2>

                    {order.items.map(
                      (
                        item
                      ) => {
                        const licenseType =
                          getLicenseType(
                            item.licenseName
                          );

                        const config =
                          LICENSE_CONFIGS[
                            licenseType
                          ];

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-200 bg-zinc-50 p-3"
                          >
                            <div>
                              <p className="text-base font-bold">
                                {
                                  item.beatTitle
                                }
                              </p>

                              <p className="text-xs text-zinc-600">
                                Licence:{" "}
                                {
                                  item.licenseName
                                }{" "}
                                — £
                                {Number(
                                  item.price
                                ).toFixed(
                                  2
                                )}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveContractItem(
                                    {
                                      item,

                                      orderDate:
                                        formattedDate,
                                    }
                                  )
                                }
                                className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                              >
                                View
                                Agreement
                              </button>

                              <a
                                href={
                                  config.templateUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-300"
                              >
                                Download
                                DOCX
                              </a>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : null}
              </section>
            );
          }
        )}
      </div>

      {activeContractItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-4xl">
            <ContractViewer
              details={{
                licenseType:
                  getLicenseType(
                    activeContractItem
                      .item
                      .licenseName
                  ),

                date:
                  activeContractItem.orderDate,

                buyerName:
                  activeContractItem
                    .item
                    .buyerName ||
                  "Customer",

                buyerAlias:
                  activeContractItem
                    .item
                    .buyerAlias,

                beatTitle:
                  activeContractItem
                    .item
                    .beatTitle,

                price:
                  activeContractItem
                    .item
                    .price,
              }}
              onClose={() =>
                setActiveContractItem(
                  null
                )
              }
            />
          </div>
        </div>
      )}
    </main>
  );
}
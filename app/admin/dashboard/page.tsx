"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminLayout from "../components/AdminLayout";

type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  totalDownloads: number;
  paidOrders?: number;
  pendingOrders?: number;
  processingOrders?: number;
  cancelledOrders?: number;
};

type OrderItem = {
  id: string;
  productType: string;
  title: string;
  unitAmount: number;
  quantity: number;
};

type AdminOrder = {
  id: string;
  email: string | null;
  amount: number;
  currency: string;
  productType:
    | string
    | null;
  status: string;
  createdAt: string;

  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;

  items?: OrderItem[];
};

const moneyFormatter =
  new Intl.NumberFormat(
    "en-GB",
    {
      style:
        "currency",

      currency:
        "GBP",
    }
  );

function formatMoney(
  amountInPence: number
) {
  return moneyFormatter.format(
    amountInPence /
      100
  );
}

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .toUpperCase();
}

function getStatusClasses(
  status: string
) {
  switch (
    status.toLowerCase()
  ) {
    case "paid":
    case "delivered":
      return "border-green-700 bg-green-100 text-green-900";

    case "processing":
    case "shipped":
      return "border-blue-700 bg-blue-100 text-blue-900";

    case "cancelled":
      return "border-red-700 bg-red-100 text-red-900";

    default:
      return "border-amber-700 bg-amber-100 text-amber-900";
  }
}

export default function DashboardPage() {
  const [
    stats,
    setStats,
  ] =
    useState<AdminStats | null>(
      null
    );

  const [
    orders,
    setOrders,
  ] = useState<
    AdminOrder[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let isMounted =
      true;

    async function loadDashboard() {
      try {
        setError("");

        const [
          statsResponse,
          ordersResponse,
        ] =
          await Promise.all([
            fetch(
              "/api/admin/stats",
              {
                credentials:
                  "include",

                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/admin/orders",
              {
                credentials:
                  "include",

                cache:
                  "no-store",
              }
            ),
          ]);

        const [
          statsData,
          ordersData,
        ] =
          await Promise.all([
            statsResponse.json(),
            ordersResponse.json(),
          ]);

        if (
          !statsResponse.ok
        ) {
          throw new Error(
            statsData.error ||
              "Unable to load dashboard statistics"
          );
        }

        if (
          !ordersResponse.ok
        ) {
          throw new Error(
            ordersData.error ||
              "Unable to load recent orders"
          );
        }

        if (!isMounted) {
          return;
        }

        setStats(
          statsData
        );

        setOrders(
          Array.isArray(
            ordersData.orders
          )
            ? ordersData.orders
            : []
        );
      } catch (error) {
        console.error(
          "Admin dashboard loading error:",
          error
        );

        if (isMounted) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load the Admin dashboard"
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

    loadDashboard();

    return () => {
      isMounted =
        false;
    };
  }, []);

  const orderCounts =
    useMemo(() => {
      let beats = 0;
      let music = 0;
      let physical = 0;
      let awaitingAction =
        0;

      orders.forEach(
        (order) => {
          const types =
            new Set(
              order.items
                ?.map(
                  (item) =>
                    item.productType
                )
                .filter(
                  Boolean
                ) || []
            );

          if (
            order.productType
          ) {
            types.add(
              order.productType
            );
          }

          if (
            types.has(
              "beat"
            )
          ) {
            beats += 1;
          }

          if (
            types.has(
              "music"
            )
          ) {
            music += 1;
          }

          if (
            types.has(
              "clothing"
            ) ||
            types.has(
              "merch"
            )
          ) {
            physical += 1;
          }

          if (
            order.status ===
              "paid" ||
            order.status ===
              "processing"
          ) {
            awaitingAction +=
              1;
          }
        }
      );

      return {
        beats,
        music,
        physical,
        awaitingAction,
      };
    }, [orders]);

  const recentOrders =
    orders.slice(
      0,
      10
    );

  return (
    <AdminLayout active="dashboard">
      <div className="space-y-8 [font-family:Arial,Helvetica,sans-serif]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-red-600">
              RAF By Design
            </p>

            <h1 className="mt-1 text-3xl font-black text-zinc-950">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Confirmed sales,
              downloads and
              fulfilment activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="rounded-lg border-2 border-black bg-black px-4 py-2 text-sm font-black text-white transition hover:bg-zinc-800"
            >
              Manage Orders
            </Link>

            <Link
              href="/admin/bookings"
              className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-zinc-100"
            >
              View Bookings
            </Link>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border-2 border-red-700 bg-red-50 p-4 font-bold text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border-2 border-zinc-300 bg-white p-8 text-center font-bold text-zinc-600">
            Loading Admin
            dashboard...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-black text-black">
                  {stats?.totalOrders ??
                    orders.length}
                </p>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
                  Confirmed Revenue
                </p>

                <p className="mt-2 text-3xl font-black text-green-700">
                  {formatMoney(
                    stats?.totalRevenue ??
                      0
                  )}
                </p>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
                  Paid Downloads
                </p>

                <p className="mt-2 text-3xl font-black text-blue-700">
                  {stats?.totalDownloads ??
                    0}
                </p>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
                  Awaiting Action
                </p>

                <p className="mt-2 text-3xl font-black text-amber-700">
                  {
                    orderCounts.awaitingAction
                  }
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-bold text-zinc-600">
                  Beat Orders
                </p>

                <p className="mt-1 text-2xl font-black text-zinc-950">
                  {
                    orderCounts.beats
                  }
                </p>
              </div>

              <div className="rounded-xl border-2 border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-bold text-zinc-600">
                  Music Orders
                </p>

                <p className="mt-1 text-2xl font-black text-zinc-950">
                  {
                    orderCounts.music
                  }
                </p>
              </div>

              <div className="rounded-xl border-2 border-zinc-300 bg-zinc-50 p-4">
                <p className="text-sm font-bold text-zinc-600">
                  Physical Orders
                </p>

                <p className="mt-1 text-2xl font-black text-zinc-950">
                  {
                    orderCounts.physical
                  }
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border-2 border-black bg-white">
              <div className="flex items-center justify-between gap-4 border-b-2 border-black bg-zinc-950 px-5 py-4 text-white">
                <h2 className="text-xl font-black">
                  Recent Orders
                </h2>

                <Link
                  href="/admin/orders"
                  className="text-sm font-bold text-red-400 underline underline-offset-4 hover:text-red-300"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length ===
              0 ? (
                <p className="p-6 text-zinc-600">
                  No orders have
                  been recorded.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600">
                        <th className="px-4 py-3">
                          Order
                        </th>

                        <th className="px-4 py-3">
                          Customer
                        </th>

                        <th className="px-4 py-3">
                          Items
                        </th>

                        <th className="px-4 py-3">
                          Total
                        </th>

                        <th className="px-4 py-3">
                          Status
                        </th>

                        <th className="px-4 py-3">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map(
                        (
                          order
                        ) => (
                          <tr
                            key={
                              order.id
                            }
                            className="border-b last:border-b-0 hover:bg-zinc-50"
                          >
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="font-black text-red-700 hover:underline"
                              >
                                #
                                {order.id.slice(
                                  -8
                                )}
                              </Link>
                            </td>

                            <td className="px-4 py-3">
                              <p className="font-bold text-zinc-900">
                                {order
                                  .user
                                  ?.name ||
                                  "Customer"}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {order
                                  .user
                                  ?.email ||
                                  order.email ||
                                  "No email"}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              {order.items
                                ?.length ||
                                1}
                            </td>

                            <td className="px-4 py-3 font-black">
                              {formatMoney(
                                order.amount
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded border px-2 py-1 text-xs font-black ${getStatusClasses(
                                  order.status
                                )}`}
                              >
                                {formatStatus(
                                  order.status
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-sm text-zinc-600">
                              {new Date(
                                order.createdAt
                              ).toLocaleString(
                                "en-GB"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
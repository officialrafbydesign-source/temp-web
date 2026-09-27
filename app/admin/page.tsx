"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "./components/AdminLayout";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  email?: string | null;
  amount: number;
  currency?: string;
  status: OrderStatus;
  productType?: string;
  createdAt: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  productDetails?: {
    title?: string;
    name?: string;
    release?: { title?: string };
  } | null;
};

type Booking = {
  id: string;
  status: string;
  date?: string | null;
  deadlineText?: string | null;
  recordingDate?: string | null;
  studioSessionDate?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
  service?: {
    name?: string | null;
  };
};

type DesignEnquiry = {
  id: string;
  title: string;
  status: string;
  deadline?: string | null;
  totalPrice?: number | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
  services?: string[];
};

type Beat = {
  id: string;
  title?: string;
  createdAt?: string;
};

type MusicProduct = {
  id: string;
  createdAt?: string;
  itemType?: string;
  release?: {
    title?: string;
  };
};

type ClothingProduct = {
  id: string;
  name?: string;
  createdAt?: string;
  stock?: number | null;
  totalStock?: number | null;
  variants?: {
    stock?: number | null;
  }[];
};

type ActionRequest = {
  id: string;
  kind: "MUSIC" | "DESIGN";
  client: string;
  service: string;
  deadline: string;
  status: string;
  createdAt: string;
};

type Activity = {
  id: string;
  domain: "ORDERS" | "BOOKINGS" | "MUSIC" | "BEATS" | "CLOTHING";
  description: string;
  timestamp: string;
  createdAt: string;
};

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function moneyFromPence(amount: number) {
  return GBP.format((Number(amount) || 0) / 100);
}

function normaliseStatus(status?: string) {
  return String(status || "").trim().toLowerCase();
}

function dateLabel(value?: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function relativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return dateLabel(value);
}

function clientName(
  user?: { name?: string | null; email?: string | null }
) {
  return user?.name || user?.email || "Client";
}

function extractArray<T>(data: any, keys: string[]): T[] {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function getClothingStock(product: ClothingProduct): number | null {
  if (typeof product.totalStock === "number") {
    return product.totalStock;
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, variant) => sum + Number(variant.stock || 0),
      0
    );
  }

  if (typeof product.stock === "number") {
    return product.stock;
  }

  return null;
}

function productTitle(order: Order) {
  return (
    order.productDetails?.title ||
    order.productDetails?.name ||
    order.productDetails?.release?.title ||
    order.productType ||
    "Order"
  );
}

function statusClasses(status: string) {
  const value = normaliseStatus(status);

  if (value === "approved" || value === "paid" || value === "delivered") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (value === "rejected" || value === "cancelled") {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }

  if (value === "shipped") {
    return "bg-purple-100 text-purple-800 border-purple-200";
  }

  if (value === "processing") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  return "bg-amber-100 text-amber-800 border-amber-200";
}

export default function CoreSystemDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [designEnquiries, setDesignEnquiries] = useState<DesignEnquiry[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [musicProducts, setMusicProducts] = useState<MusicProduct[]>([]);
  const [clothingProducts, setClothingProducts] = useState<ClothingProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState("");

  async function fetchJson(url: string) {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }

    return response.json();
  }

  async function loadDashboard() {
    setLoading(true);
    setLoadWarning("");

    const requests = [
      fetchJson("/api/admin/orders"),
      fetchJson("/api/admin/bookings"),
      fetchJson("/api/admin/beats"),
      fetchJson("/api/admin/music-products"),
      fetchJson("/api/admin/clothing"),
    ];

    const results = await Promise.allSettled(requests);
    const failedSections: string[] = [];

    const [
      ordersResult,
      bookingsResult,
      beatsResult,
      musicResult,
      clothingResult,
    ] = results;

    if (ordersResult.status === "fulfilled") {
      setOrders(extractArray<Order>(ordersResult.value, ["orders"]));
    } else {
      failedSections.push("Orders");
      setOrders([]);
    }

    if (bookingsResult.status === "fulfilled") {
      setBookings(
        extractArray<Booking>(bookingsResult.value?.bookings, ["bookings"])
      );
      setDesignEnquiries(
        extractArray<DesignEnquiry>(
          bookingsResult.value?.designEnquiries,
          ["designEnquiries"]
        )
      );
    } else {
      failedSections.push("Bookings");
      setBookings([]);
      setDesignEnquiries([]);
    }

    if (beatsResult.status === "fulfilled") {
      setBeats(
        extractArray<Beat>(beatsResult.value, ["beats", "products"])
      );
    } else {
      failedSections.push("Beats");
      setBeats([]);
    }

    if (musicResult.status === "fulfilled") {
      setMusicProducts(
        extractArray<MusicProduct>(musicResult.value, [
          "musicProducts",
          "products",
          "music",
        ])
      );
    } else {
      failedSections.push("Music");
      setMusicProducts([]);
    }

    if (clothingResult.status === "fulfilled") {
      setClothingProducts(
        extractArray<ClothingProduct>(clothingResult.value, [
          "products",
          "clothing",
        ])
      );
    } else {
      failedSections.push("Clothing");
      setClothingProducts([]);
    }

    if (failedSections.length > 0) {
      setLoadWarning(
        `Some dashboard sections could not be loaded: ${failedSections.join(
          ", "
        )}. The available data is shown below.`
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const grossRevenuePence = useMemo(() => {
    const revenueStatuses = new Set([
      "paid",
      "processing",
      "shipped",
      "delivered",
    ]);

    return orders
      .filter((order) => revenueStatuses.has(normaliseStatus(order.status)))
      .reduce((total, order) => total + Number(order.amount || 0), 0);
  }, [orders]);

  const ordersAwaitingFulfilment = useMemo(
    () =>
      orders.filter((order) =>
        ["paid", "processing"].includes(normaliseStatus(order.status))
      ),
    [orders]
  );

  const requestsAwaitingAction = useMemo(() => {
    const music = bookings.filter(
      (booking) =>
        !["approved", "rejected"].includes(normaliseStatus(booking.status))
    ).length;

    const design = designEnquiries.filter(
      (enquiry) =>
        !["approved", "rejected"].includes(normaliseStatus(enquiry.status))
    ).length;

    return music + design;
  }, [bookings, designEnquiries]);

  const totalClothingStock = useMemo(
    () =>
      clothingProducts.reduce((sum, product) => {
        const stock = getClothingStock(product);
        return sum + (stock ?? 0);
      }, 0),
    [clothingProducts]
  );

  const lowStockProducts = useMemo(
    () =>
      clothingProducts.filter((product) => {
        const stock = getClothingStock(product);
        return stock !== null && stock <= 5;
      }),
    [clothingProducts]
  );

  const actionRequests = useMemo<ActionRequest[]>(() => {
    const musicRequests: ActionRequest[] = bookings
      .filter(
        (booking) =>
          !["approved", "rejected"].includes(
            normaliseStatus(booking.status)
          )
      )
      .map((booking) => ({
        id: booking.id,
        kind: "MUSIC",
        client: clientName(booking.user),
        service: booking.service?.name || "Music Service",
        deadline:
          booking.recordingDate ||
          booking.studioSessionDate ||
          booking.date ||
          booking.deadlineText ||
          "",
        status: booking.status || "pending",
        createdAt: booking.createdAt,
      }));

    const designRequests: ActionRequest[] = designEnquiries
      .filter(
        (enquiry) =>
          !["approved", "rejected"].includes(
            normaliseStatus(enquiry.status)
          )
      )
      .map((enquiry) => ({
        id: enquiry.id,
        kind: "DESIGN",
        client: clientName(enquiry.user),
        service:
          enquiry.services?.join(", ") ||
          enquiry.title ||
          "Design Enquiry",
        deadline: enquiry.deadline || "",
        status: enquiry.status || "new",
        createdAt: enquiry.createdAt,
      }));

    return [...musicRequests, ...designRequests]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 8);
  }, [bookings, designEnquiries]);

  const recentActivities = useMemo<Activity[]>(() => {
    const activity: Activity[] = [];

    orders.forEach((order) => {
      activity.push({
        id: `order-${order.id}`,
        domain: "ORDERS",
        description: `${productTitle(order)} — ${moneyFromPence(
          order.amount
        )} — ${order.status}`,
        timestamp: relativeTime(order.createdAt),
        createdAt: order.createdAt,
      });
    });

    bookings.forEach((booking) => {
      activity.push({
        id: `booking-${booking.id}`,
        domain: "BOOKINGS",
        description: `${booking.service?.name || "Music request"} from ${clientName(
          booking.user
        )} — ${booking.status}`,
        timestamp: relativeTime(booking.createdAt),
        createdAt: booking.createdAt,
      });
    });

    designEnquiries.forEach((enquiry) => {
      activity.push({
        id: `design-${enquiry.id}`,
        domain: "BOOKINGS",
        description: `${enquiry.title || "Design enquiry"} from ${clientName(
          enquiry.user
        )} — ${enquiry.status}`,
        timestamp: relativeTime(enquiry.createdAt),
        createdAt: enquiry.createdAt,
      });
    });

    beats.forEach((beat) => {
      if (!beat.createdAt) return;

      activity.push({
        id: `beat-${beat.id}`,
        domain: "BEATS",
        description: `${beat.title || "Beat"} added to catalogue`,
        timestamp: relativeTime(beat.createdAt),
        createdAt: beat.createdAt,
      });
    });

    musicProducts.forEach((product) => {
      if (!product.createdAt) return;

      activity.push({
        id: `music-${product.id}`,
        domain: "MUSIC",
        description: `${
          product.release?.title || "Music release"
        } added to catalogue`,
        timestamp: relativeTime(product.createdAt),
        createdAt: product.createdAt,
      });
    });

    clothingProducts.forEach((product) => {
      if (!product.createdAt) return;

      activity.push({
        id: `clothing-${product.id}`,
        domain: "CLOTHING",
        description: `${product.name || "Clothing product"} added to catalogue`,
        timestamp: relativeTime(product.createdAt),
        createdAt: product.createdAt,
      });
    });

    return activity
      .filter((item) => item.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 12);
  }, [
    orders,
    bookings,
    designEnquiries,
    beats,
    musicProducts,
    clothingProducts,
  ]);

  const requestAlertClass =
    requestsAwaitingAction === 0
      ? "bg-emerald-50 border-emerald-200"
      : requestsAwaitingAction <= 3
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  const requestTextClass =
    requestsAwaitingAction === 0
      ? "text-emerald-800"
      : requestsAwaitingAction <= 3
        ? "text-amber-800"
        : "text-red-800";

  const lowStockClass =
    lowStockProducts.length === 0
      ? "bg-emerald-50 border-emerald-200"
      : "bg-amber-50 border-amber-200";

  return (
    <AdminLayout active="dashboard">
      <div className="space-y-7 text-zinc-950 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              RAF Command Console
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Business overview for sales, client requests, catalogue activity
              and stock.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="px-4 py-2 bg-zinc-950 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {loadWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm font-medium">
            {loadWarning}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <DashboardLink
            href="/admin/beats"
            label="Licensing"
            title="Beats"
            action="Manage →"
          />

          <DashboardLink
            href="/admin/music-management"
            label="Releases & Audio"
            title="Music Catalogue"
            action="Manage →"
            accent="text-purple-600"
          />

          <DashboardLink
            href="/admin/bookings"
            label="Client Requests"
            title="Bookings & Enquiries"
            action="Review →"
            accent="text-blue-600"
          />

          <DashboardLink
            href="/admin/clothing"
            label="Physical Products"
            title="Clothing"
            action="Stock →"
            accent="text-amber-600"
          />

          <DashboardLink
            href="/admin/orders"
            label="Sales & Fulfilment"
            title="Orders"
            action="View →"
            accent="text-emerald-600"
          />
        </div>

        {loading ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center text-sm text-zinc-500 font-mono animate-pulse">
            Loading live Admin data...
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-black">Needs Attention</h2>
                <p className="text-sm text-zinc-500">
                  The operational items most likely to need action first.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                  label="Gross Revenue"
                  value={moneyFromPence(grossRevenuePence)}
                  detail={`${orders.length.toLocaleString()} total order records`}
                />

                <MetricCard
                  label="Orders Awaiting Fulfilment"
                  value={ordersAwaitingFulfilment.length.toLocaleString()}
                  detail="Paid or processing orders"
                  href="/admin/orders"
                  className={
                    ordersAwaitingFulfilment.length > 0
                      ? "bg-blue-50 border-blue-200"
                      : undefined
                  }
                />

                <MetricCard
                  label="Requests Awaiting Action"
                  value={requestsAwaitingAction.toLocaleString()}
                  detail={
                    requestsAwaitingAction === 0
                      ? "No client requests waiting"
                      : "Music or Design requests to review"
                  }
                  href="/admin/bookings"
                  className={requestAlertClass}
                  textClass={requestTextClass}
                />

                <MetricCard
                  label="Low Stock Items"
                  value={lowStockProducts.length.toLocaleString()}
                  detail={
                    lowStockProducts.length === 0
                      ? "No clothing products at 5 units or below"
                      : "Clothing products at 5 units or below"
                  }
                  href="/admin/clothing"
                  className={lowStockClass}
                  textClass={
                    lowStockProducts.length === 0
                      ? "text-emerald-800"
                      : "text-amber-800"
                  }
                />
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-black">Catalogue Overview</h2>
                <p className="text-sm text-zinc-500">
                  Current catalogue and physical stock totals.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <CatalogueCard
                  label="Beats"
                  value={beats.length}
                  href="/admin/beats"
                />
                <CatalogueCard
                  label="Music Releases"
                  value={musicProducts.length}
                  href="/admin/music-management"
                />
                <CatalogueCard
                  label="Clothing Products"
                  value={clothingProducts.length}
                  href="/admin/clothing"
                />
                <CatalogueCard
                  label="Total Clothing Stock"
                  value={totalClothingStock}
                  href="/admin/clothing"
                />
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <section className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-zinc-50/60 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black">
                      Requests Requiring Action
                    </h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      New and pending Music or Design requests.
                    </p>
                  </div>

                  <Link
                    href="/admin/bookings"
                    className="text-sm font-bold bg-zinc-950 text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition"
                  >
                    Open Bookings
                  </Link>
                </div>

                {actionRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-bold text-emerald-800">
                      No requests currently need a decision.
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      New Music and Design enquiries will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b text-zinc-500 text-xs uppercase font-bold tracking-wide">
                          <th className="p-4">Client</th>
                          <th className="p-4">Area</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Date / Deadline</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                        {actionRequests.map((request) => (
                          <tr
                            key={`${request.kind}-${request.id}`}
                            className="hover:bg-zinc-50/60"
                          >
                            <td className="p-4 font-bold text-zinc-950">
                              {request.client}
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${
                                  request.kind === "MUSIC"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {request.kind}
                              </span>
                            </td>

                            <td className="p-4 font-medium">
                              {request.service}
                            </td>

                            <td className="p-4 font-mono text-sm">
                              {dateLabel(request.deadline)}
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex border rounded-full px-2.5 py-1 text-xs font-bold uppercase ${statusClasses(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <Link
                                href="/admin/bookings"
                                className="inline-flex bg-zinc-950 text-white font-bold text-sm px-3 py-2 rounded-lg hover:bg-zinc-800 transition"
                              >
                                Review Request →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-zinc-50/60">
                  <h2 className="text-lg font-black">Recent Activity</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Latest activity across the Admin system.
                  </p>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="p-6 text-sm text-zinc-500">
                    No recent activity is available yet.
                  </div>
                ) : (
                  <div className="max-h-[470px] overflow-y-auto divide-y divide-zinc-100">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-4 flex items-start gap-3"
                      >
                        <ActivityBadge domain={activity.domain} />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-800 font-medium leading-relaxed">
                            {activity.description}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function DashboardLink({
  href,
  label,
  title,
  action,
  accent = "text-zinc-500",
}: {
  href: string;
  label: string;
  title: string;
  action: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-950 transition-all shadow-sm"
    >
      <span
        className={`${accent} font-bold uppercase text-xs tracking-wider block`}
      >
        {label}
      </span>

      <div className="flex justify-between items-center gap-3 mt-2">
        <span className="text-base font-black text-zinc-900">{title}</span>
        <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors whitespace-nowrap">
          {action}
        </span>
      </div>
    </Link>
  );
}

function MetricCard({
  label,
  value,
  detail,
  href,
  className = "bg-white border-zinc-200",
  textClass = "text-zinc-950",
}: {
  label: string;
  value: string;
  detail: string;
  href?: string;
  className?: string;
  textClass?: string;
}) {
  const content = (
    <div
      className={`${className} border rounded-xl p-5 shadow-sm h-full ${
        href ? "hover:border-zinc-400 transition" : ""
      }`}
    >
      <p className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>
        {label}
      </p>

      <p className={`text-3xl font-black mt-1 font-mono ${textClass}`}>
        {value}
      </p>

      <p className="text-sm text-zinc-600 mt-2 font-medium">{detail}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function CatalogueCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:border-zinc-400 transition"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="text-2xl font-black font-mono mt-1">
        {value.toLocaleString()}
      </p>
    </Link>
  );
}

function ActivityBadge({
  domain,
}: {
  domain: Activity["domain"];
}) {
  const classes: Record<Activity["domain"], string> = {
    ORDERS: "bg-emerald-100 text-emerald-800",
    BOOKINGS: "bg-blue-100 text-blue-800",
    MUSIC: "bg-purple-100 text-purple-800",
    BEATS: "bg-zinc-200 text-zinc-800",
    CLOTHING: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded text-xs font-black ${classes[domain]}`}
    >
      {domain}
    </span>
  );
}
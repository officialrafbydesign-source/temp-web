"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AdminLayout from "../components/AdminLayout";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type ProductType =
  | "beat"
  | "music"
  | "clothing"
  | "service"
  | "design"
  | "merch";

type ProductDetails = {
  id?: string;
  title?: string;
  name?: string;
  artworkUrl?: string;
  imageUrls?: string[];
  itemType?: string;

  release?: {
    title?: string;
    coverUrl?: string;
  };
};

type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};

type OrderItem = {
  id: string;
  productType: ProductType;
  productId?: string | null;
  beatId?: string | null;
  licenseId?: string | null;
  variantId?: string | null;
  title: string;
  unitAmount: number;
  quantity: number;
};

type Order = {
  id: string;
  email?: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  productType?: ProductType | null;
  productId?: string | null;
  licenseId?: string | null;
  quantity?: number | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  downloadUrl?: string | null;
  contractPdfUrl?: string | null;
  shippingAddress?: ShippingAddress | null;
  productDetails?: ProductDetails | null;
  items?: OrderItem[];
  createdAt: string;
};

type EditFormState = {
  status: OrderStatus;
  email: string;
  carrier: string;
  trackingNumber: string;
  downloadUrl: string;
  contractPdfUrl: string;
  shippingAddress: ShippingAddress;
};

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PRODUCT_TYPES: ProductType[] = [
  "beat",
  "music",
  "clothing",
  "service",
  "design",
  "merch",
];

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending:
    "bg-zinc-100 text-zinc-800 border-zinc-300",

  paid:
    "bg-blue-100 text-blue-800 border-blue-300",

  processing:
    "bg-amber-100 text-amber-800 border-amber-300",

  shipped:
    "bg-purple-100 text-purple-800 border-purple-300",

  delivered:
    "bg-emerald-100 text-emerald-800 border-emerald-300",

  cancelled:
    "bg-rose-100 text-rose-800 border-rose-300",
};

const ADDRESS_FIELDS: Array<{
  field: keyof ShippingAddress;
  label: string;
}> = [
  {
    field: "name",
    label: "Name",
  },
  {
    field: "line1",
    label: "Address line 1",
  },
  {
    field: "line2",
    label: "Address line 2",
  },
  {
    field: "city",
    label: "City",
  },
  {
    field: "postal_code",
    label: "Postal code",
  },
  {
    field: "country",
    label: "Country",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | OrderStatus>("all");

  const [
    productTypeFilter,
    setProductTypeFilter,
  ] =
    useState<"all" | ProductType>("all");

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState<
      Record<string, EditFormState>
    >({});

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          credentials: "include",
          cache: "no-store",
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

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load orders:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function getOrderTypes(order: Order) {
    const types =
      new Set<ProductType>();

    if (order.productType) {
      types.add(order.productType);
    }

    order.items?.forEach((item) => {
      types.add(item.productType);
    });

    return Array.from(types);
  }

  function getProductTitle(order: Order) {
    if (
      order.items &&
      order.items.length > 0
    ) {
      return order.items
        .map((item) => item.title)
        .join(", ");
    }

    const details =
      order.productDetails;

    return (
      details?.title ||
      details?.name ||
      details?.release?.title ||
      order.productType?.toUpperCase() ||
      "ORDER"
    );
  }

  function isPhysicalOrder(order: Order) {
    const types =
      getOrderTypes(order);

    if (
      types.includes("clothing") ||
      types.includes("merch")
    ) {
      return true;
    }

    if (
      types.includes("music") &&
      order.productDetails?.itemType?.toUpperCase() ===
        "PHYSICAL"
    ) {
      return true;
    }

    return Boolean(
      order.shippingAddress ||
        order.carrier ||
        order.trackingNumber
    );
  }

  const filteredOrders =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      return orders.filter((order) => {
        const types =
          getOrderTypes(order);

        const matchesSearch =
          !normalizedQuery ||
          order.id
            .toLowerCase()
            .includes(normalizedQuery) ||
          (order.email || "")
            .toLowerCase()
            .includes(normalizedQuery) ||
          types.some((type) =>
            type.includes(normalizedQuery)
          ) ||
          getProductTitle(order)
            .toLowerCase()
            .includes(normalizedQuery) ||
          (order.carrier || "")
            .toLowerCase()
            .includes(normalizedQuery) ||
          (order.trackingNumber || "")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesStatus =
          statusFilter === "all" ||
          order.status === statusFilter;

        const matchesProductType =
          productTypeFilter === "all" ||
          types.includes(
            productTypeFilter
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesProductType
        );
      });
    }, [
      orders,
      query,
      statusFilter,
      productTypeFilter,
    ]);

  function startEdit(order: Order) {
    setExpandedOrderId(order.id);

    setEditing((previous) => ({
      ...previous,

      [order.id]: {
        status: order.status,
        email: order.email || "",
        carrier: order.carrier || "",
        trackingNumber:
          order.trackingNumber || "",
        downloadUrl:
          order.downloadUrl || "",
        contractPdfUrl:
          order.contractPdfUrl || "",

        shippingAddress: {
          name:
            order.shippingAddress?.name ||
            "",

          line1:
            order.shippingAddress?.line1 ||
            "",

          line2:
            order.shippingAddress?.line2 ||
            "",

          city:
            order.shippingAddress?.city ||
            "",

          postal_code:
            order.shippingAddress
              ?.postal_code || "",

          country:
            order.shippingAddress
              ?.country || "",
        },
      },
    }));
  }

  function updateEditField<
    Key extends keyof EditFormState
  >(
    orderId: string,
    field: Key,
    value: EditFormState[Key]
  ) {
    setEditing((previous) => {
      const current =
        previous[orderId];

      if (!current) {
        return previous;
      }

      return {
        ...previous,

        [orderId]: {
          ...current,
          [field]: value,
        },
      };
    });
  }

  function updateAddressField(
    orderId: string,
    field: keyof ShippingAddress,
    value: string
  ) {
    setEditing((previous) => {
      const current =
        previous[orderId];

      if (!current) {
        return previous;
      }

      return {
        ...previous,

        [orderId]: {
          ...current,

          shippingAddress: {
            ...current.shippingAddress,
            [field]: value,
          },
        },
      };
    });
  }

  function cancelEdit(orderId: string) {
    setEditing((previous) => {
      const next = {
        ...previous,
      };

      delete next[orderId];

      return next;
    });
  }

  async function saveOrder(
    orderId: string
  ) {
    const edit =
      editing[orderId];

    if (!edit) {
      return;
    }

    try {
      setSavingId(orderId);

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "PATCH",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: orderId,
            status: edit.status,
            email: edit.email,
            carrier: edit.carrier,
            trackingNumber:
              edit.trackingNumber,
            downloadUrl:
              edit.downloadUrl,
            contractPdfUrl:
              edit.contractPdfUrl,
            shippingAddress:
              edit.shippingAddress,
          }),
        }
      );

      const updated =
        await response.json();

      if (!response.ok) {
        throw new Error(
          updated.error ||
            "Order update failed"
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updated,
              }
            : order
        )
      );

      cancelEdit(orderId);
    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );
    } finally {
      setSavingId(null);
    }
  }

  function toggleRowExpand(
    orderId: string
  ) {
    setExpandedOrderId(
      (previous) =>
        previous === orderId
          ? null
          : orderId
    );
  }

  if (loading) {
    return (
      <AdminLayout active="orders">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="animate-pulse text-sm text-zinc-500">
            Loading order records...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="orders">
      <div className="space-y-6 text-black [font-family:Arial,Helvetica,sans-serif]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Orders Admin
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage customer orders,
              shipping and digital
              fulfilment.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border-2 border-red-700 bg-red-50 p-4 font-bold text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATUSES.map((status) => {
            const count =
              orders.filter(
                (order) =>
                  order.status ===
                  status
              ).length;

            return (
              <button
                type="button"
                key={status}
                onClick={() =>
                  setStatusFilter(
                    (previous) =>
                      previous === status
                        ? "all"
                        : status
                  )
                }
                className={`rounded-xl border p-3 text-left transition ${
                  statusFilter === status
                    ? "bg-zinc-50 ring-2 ring-black"
                    : "bg-white hover:border-zinc-400"
                }`}
              >
                <p className="text-xs capitalize text-zinc-500">
                  {status}
                </p>

                <p className="mt-0.5 text-xl font-black">
                  {count}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row">
          <input
            className="flex-1 rounded-lg border border-zinc-300 p-2 text-sm outline-none focus:ring-2 focus:ring-black"
            placeholder="Search by full order ID, email, product, carrier or tracking number..."
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
          />

          <div className="flex gap-2">
            <select
              className="rounded-lg border border-zinc-300 bg-white p-2 text-sm outline-none"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | OrderStatus
                )
              }
            >
              <option value="all">
                All Statuses
              </option>

              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-zinc-300 bg-white p-2 text-sm outline-none"
              value={productTypeFilter}
              onChange={(event) =>
                setProductTypeFilter(
                  event.target.value as
                    | "all"
                    | ProductType
                )
              }
            >
              <option value="all">
                All Types
              </option>

              {PRODUCT_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-600">
                <tr>
                  <th className="w-12 p-3 text-left" />

                  <th className="min-w-[260px] p-3 text-left">
                    Order ID
                  </th>

                  <th className="p-3 text-left">
                    Customer
                  </th>

                  <th className="p-3 text-left">
                    Item Details
                  </th>

                  <th className="p-3 text-left">
                    Amount
                  </th>

                  <th className="p-3 text-left">
                    Status
                  </th>

                  <th className="p-3 text-left">
                    Carrier
                  </th>

                  <th className="p-3 text-left">
                    Tracking
                  </th>

                  <th className="p-3 text-left">
                    Date
                  </th>

                  <th className="p-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {filteredOrders.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-8 text-center text-zinc-500"
                    >
                      No matching orders
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(
                    (order) => {
                      const edit =
                        editing[order.id];

                      const isExpanded =
                        expandedOrderId ===
                        order.id;

                      const isPhysical =
                        isPhysicalOrder(
                          order
                        );

                      const types =
                        getOrderTypes(
                          order
                        );

                      return (
                        <Fragment
                          key={order.id}
                        >
                          <tr
                            onClick={() =>
                              toggleRowExpand(
                                order.id
                              )
                            }
                            className={`cursor-pointer transition hover:bg-zinc-50/80 ${
                              isExpanded
                                ? "bg-zinc-50"
                                : ""
                            }`}
                          >
                            <td className="p-3 text-center text-xs text-zinc-400">
                              {isExpanded
                                ? "▼"
                                : "▶"}
                            </td>

                            <td
                              className="p-3"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="break-all font-mono text-sm font-black text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-600"
                              >
                                {order.id}
                              </Link>
                            </td>

                            <td
                              className="p-3"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {edit ? (
                                <input
                                  className="w-full max-w-[220px] rounded border border-zinc-300 p-1.5 text-sm"
                                  value={
                                    edit.email
                                  }
                                  placeholder="Customer email"
                                  onChange={(event) =>
                                    updateEditField(
                                      order.id,
                                      "email",
                                      event.target
                                        .value
                                    )
                                  }
                                />
                              ) : (
                                <p className="font-bold text-zinc-900">
                                  {order.email ||
                                    "—"}
                                </p>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {types.map(
                                  (type) => (
                                    <span
                                      key={type}
                                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-black uppercase text-zinc-600"
                                    >
                                      {type}
                                    </span>
                                  )
                                )}
                              </div>

                              <p className="mt-1 max-w-[300px] font-bold text-zinc-700">
                                {getProductTitle(
                                  order
                                )}
                              </p>
                            </td>

                            <td className="p-3 font-mono font-bold">
                              £
                              {(
                                order.amount /
                                100
                              ).toFixed(2)}
                            </td>

                            <td
                              className="p-3"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {edit ? (
                                <select
                                  className="rounded border border-zinc-300 p-1.5 text-sm outline-none"
                                  value={
                                    edit.status
                                  }
                                  onChange={(event) =>
                                    updateEditField(
                                      order.id,
                                      "status",
                                      event.target
                                        .value as OrderStatus
                                    )
                                  }
                                >
                                  {STATUSES.map(
                                    (status) => (
                                      <option
                                        key={
                                          status
                                        }
                                        value={
                                          status
                                        }
                                      >
                                        {status}
                                      </option>
                                    )
                                  )}
                                </select>
                              ) : (
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${
                                    STATUS_CLASSES[
                                      order.status
                                    ]
                                  }`}
                                >
                                  {order.status}
                                </span>
                              )}
                            </td>

                            <td
                              className="p-3"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {edit ? (
                                <input
                                  className="w-32 rounded border border-zinc-300 p-1.5 text-sm"
                                  value={
                                    edit.carrier
                                  }
                                  placeholder="e.g. DHL"
                                  onChange={(event) =>
                                    updateEditField(
                                      order.id,
                                      "carrier",
                                      event.target
                                        .value
                                    )
                                  }
                                />
                              ) : (
                                <span className="text-zinc-600">
                                  {order.carrier ||
                                    "—"}
                                </span>
                              )}
                            </td>

                            <td
                              className="p-3"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {edit ? (
                                <input
                                  className="w-36 rounded border border-zinc-300 p-1.5 text-sm"
                                  value={
                                    edit.trackingNumber
                                  }
                                  placeholder="Tracking number"
                                  onChange={(event) =>
                                    updateEditField(
                                      order.id,
                                      "trackingNumber",
                                      event.target
                                        .value
                                    )
                                  }
                                />
                              ) : (
                                <span className="font-mono text-sm text-zinc-600">
                                  {order.trackingNumber ||
                                    "—"}
                                </span>
                              )}
                            </td>

                            <td className="whitespace-nowrap p-3 text-sm text-zinc-500">
                              {new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>

                            <td
                              className="p-3 text-right"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {edit ? (
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    disabled={
                                      savingId ===
                                      order.id
                                    }
                                    onClick={() =>
                                      saveOrder(
                                        order.id
                                      )
                                    }
                                    className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {savingId ===
                                    order.id
                                      ? "Saving..."
                                      : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      cancelEdit(
                                        order.id
                                      )
                                    }
                                    className="rounded bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700 transition hover:bg-zinc-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEdit(
                                      order
                                    )
                                  }
                                  className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-zinc-800"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-zinc-50/80">
                              <td
                                colSpan={10}
                                className="border-b border-zinc-200 p-4"
                              >
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                  <div className="rounded border border-zinc-200 bg-white p-4">
                                    <h2 className="mb-3 font-black text-zinc-800">
                                      Shipping and
                                      Customer
                                    </h2>

                                    {edit ? (
                                      <div className="space-y-2">
                                        {ADDRESS_FIELDS.map(
                                          ({
                                            field,
                                            label,
                                          }) => (
                                            <label
                                              key={
                                                field
                                              }
                                              className="block"
                                            >
                                              <span className="text-xs font-bold uppercase text-zinc-500">
                                                {
                                                  label
                                                }
                                              </span>

                                              <input
                                                className="mt-1 w-full rounded border border-zinc-300 p-1.5 text-sm"
                                                value={
                                                  edit
                                                    .shippingAddress[
                                                    field
                                                  ] ||
                                                  ""
                                                }
                                                onChange={(event) =>
                                                  updateAddressField(
                                                    order.id,
                                                    field,
                                                    event
                                                      .target
                                                      .value
                                                  )
                                                }
                                              />
                                            </label>
                                          )
                                        )}
                                      </div>
                                    ) : order.shippingAddress ? (
                                      <address className="space-y-0.5 not-italic text-zinc-600">
                                        <p className="font-bold text-zinc-900">
                                          {
                                            order
                                              .shippingAddress
                                              .name
                                          }
                                        </p>

                                        <p>
                                          {
                                            order
                                              .shippingAddress
                                              .line1
                                          }
                                        </p>

                                        {order
                                          .shippingAddress
                                          .line2 && (
                                          <p>
                                            {
                                              order
                                                .shippingAddress
                                                .line2
                                            }
                                          </p>
                                        )}

                                        <p>
                                          {
                                            order
                                              .shippingAddress
                                              .city
                                          }{" "}
                                          {
                                            order
                                              .shippingAddress
                                              .postal_code
                                          }
                                        </p>

                                        <p className="uppercase">
                                          {
                                            order
                                              .shippingAddress
                                              .country
                                          }
                                        </p>
                                      </address>
                                    ) : (
                                      <p className="italic text-zinc-400">
                                        {isPhysical
                                          ? "No shipping address provided."
                                          : "Digital order — no shipping address required."}
                                      </p>
                                    )}
                                  </div>

                                  <div className="rounded border border-zinc-200 bg-white p-4">
                                    <h2 className="mb-3 font-black text-zinc-800">
                                      Digital
                                      Fulfilment
                                    </h2>

                                    {edit ? (
                                      <div className="space-y-3">
                                        <label className="block">
                                          <span className="text-xs font-bold uppercase text-zinc-500">
                                            Download
                                            URL
                                          </span>

                                          <input
                                            className="mt-1 w-full rounded border border-zinc-300 p-1.5 font-mono text-sm"
                                            value={
                                              edit.downloadUrl
                                            }
                                            onChange={(event) =>
                                              updateEditField(
                                                order.id,
                                                "downloadUrl",
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                          />
                                        </label>

                                        <label className="block">
                                          <span className="text-xs font-bold uppercase text-zinc-500">
                                            Contract
                                            PDF URL
                                          </span>

                                          <input
                                            className="mt-1 w-full rounded border border-zinc-300 p-1.5 font-mono text-sm"
                                            value={
                                              edit.contractPdfUrl
                                            }
                                            onChange={(event) =>
                                              updateEditField(
                                                order.id,
                                                "contractPdfUrl",
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                          />
                                        </label>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {order.downloadUrl ? (
                                          <a
                                            href={
                                              order.downloadUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all font-bold text-indigo-700 underline"
                                          >
                                            Open
                                            download
                                            files
                                          </a>
                                        ) : (
                                          <p className="italic text-zinc-400">
                                            No
                                            order-level
                                            download
                                            link.
                                          </p>
                                        )}

                                        {order.contractPdfUrl && (
                                          <a
                                            href={
                                              order.contractPdfUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all font-bold text-indigo-700 underline"
                                          >
                                            Open licence
                                            agreement
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="rounded border border-zinc-200 bg-white p-4">
                                    <h2 className="mb-3 font-black text-zinc-800">
                                      System
                                      Information
                                    </h2>

                                    <div className="space-y-3 text-zinc-600">
                                      <div>
                                        <p className="text-xs font-bold uppercase text-zinc-500">
                                          Full Order
                                          ID
                                        </p>

                                        <Link
                                          href={`/admin/orders/${order.id}`}
                                          className="mt-1 block break-all font-mono font-black text-red-700 underline"
                                        >
                                          {
                                            order.id
                                          }
                                        </Link>
                                      </div>

                                      {order.productId && (
                                        <div>
                                          <p className="text-xs font-bold uppercase text-zinc-500">
                                            Product ID
                                          </p>

                                          <p className="break-all font-mono text-zinc-800">
                                            {
                                              order.productId
                                            }
                                          </p>
                                        </div>
                                      )}

                                      {order.licenseId && (
                                        <div>
                                          <p className="text-xs font-bold uppercase text-zinc-500">
                                            Licence ID
                                          </p>

                                          <p className="break-all font-mono text-zinc-800">
                                            {
                                              order.licenseId
                                            }
                                          </p>
                                        </div>
                                      )}

                                      <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="inline-flex rounded-lg border-2 border-black bg-black px-4 py-2 font-black text-white transition hover:bg-zinc-800"
                                      >
                                        View Full
                                        Order
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
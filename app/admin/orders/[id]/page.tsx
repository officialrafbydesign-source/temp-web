import Link from "next/link";
import { notFound } from "next/navigation";

import {
  prisma,
} from "@/lib/prisma";

import AdminLayout from "../../components/AdminLayout";

export const dynamic =
  "force-dynamic";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
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

function getShippingLines(
  value: unknown
) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return [];
  }

  const address =
    value as Record<
      string,
      unknown
    >;

  const values = [
    address.name,
    address.line1,
    address.line2,
    address.city,
    address.postal_code ||
      address.postalCode,
    address.country,
  ];

  return values
    .map((item) =>
      typeof item ===
      "string"
        ? item.trim()
        : ""
    )
    .filter(Boolean);
}

export default async function AdminOrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const {
    id,
  } = await params;

  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt:
              true,
          },
        },

        items: {
          orderBy: {
            createdAt:
              "asc",
          },
        },
      },
    });

  if (!order) {
    notFound();
  }

  const shippingLines =
    getShippingLines(
      order.shippingAddress
    );

  const customerEmail =
    order.user?.email ||
    order.email ||
    "No email recorded";

  const customerName =
    order.user?.name ||
    "Customer";

  return (
    <AdminLayout active="orders">
      <div className="space-y-8 [font-family:Arial,Helvetica,sans-serif]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm font-black text-red-700 underline underline-offset-4 hover:text-red-600"
            >
              ← Back to Orders
            </Link>

            <h1 className="mt-4 text-3xl font-black text-zinc-950">
              Order Details
            </h1>

            <p className="mt-2 break-all text-sm text-zinc-600">
              Order ID:{" "}
              {order.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-lg border-2 px-4 py-2 text-sm font-black ${getStatusClasses(
              order.status
            )}`}
          >
            {formatStatus(
              order.status
            )}
          </span>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border-2 border-black bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Order Total
            </p>

            <p className="mt-2 text-2xl font-black text-zinc-950">
              {formatMoney(
                order.amount
              )}
            </p>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Items
            </p>

            <p className="mt-2 text-2xl font-black text-zinc-950">
              {order.items.length ||
                order.quantity ||
                0}
            </p>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Created
            </p>

            <p className="mt-2 font-bold text-zinc-950">
              {order.createdAt.toLocaleString(
                "en-GB"
              )}
            </p>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Last Updated
            </p>

            <p className="mt-2 font-bold text-zinc-950">
              {order.updatedAt.toLocaleString(
                "en-GB"
              )}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border-2 border-black bg-white p-6">
            <h2 className="text-xl font-black text-zinc-950">
              Customer
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Name
                </dt>

                <dd className="mt-1 font-bold text-zinc-950">
                  {
                    customerName
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Email
                </dt>

                <dd className="mt-1 break-all font-bold text-zinc-950">
                  {
                    customerEmail
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Customer Account
                </dt>

                <dd className="mt-1 font-bold text-zinc-950">
                  {order.user
                    ? "Registered customer"
                    : "Guest order"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border-2 border-black bg-white p-6">
            <h2 className="text-xl font-black text-zinc-950">
              Payment
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Currency
                </dt>

                <dd className="mt-1 font-bold uppercase text-zinc-950">
                  {
                    order.currency
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Stripe Session
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-zinc-950">
                  {order.stripeSessionId ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Status
                </dt>

                <dd className="mt-1 font-bold text-zinc-950">
                  {formatStatus(
                    order.status
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="overflow-hidden rounded-xl border-2 border-black bg-white">
          <div className="border-b-2 border-black bg-zinc-950 px-5 py-4 text-white">
            <h2 className="text-xl font-black">
              Order Items
            </h2>
          </div>

          {order.items.length ===
          0 ? (
            <div className="p-6">
              <p className="font-bold text-zinc-700">
                This is a
                legacy order
                without separate
                order-item
                records.
              </p>

              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-black uppercase text-zinc-500">
                    Product Type
                  </dt>

                  <dd className="mt-1 font-bold text-zinc-950">
                    {order.productType ||
                      "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-black uppercase text-zinc-500">
                    Product ID
                  </dt>

                  <dd className="mt-1 break-all font-bold text-zinc-950">
                    {order.productId ||
                      "Not recorded"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-black uppercase text-zinc-500">
                    Quantity
                  </dt>

                  <dd className="mt-1 font-bold text-zinc-950">
                    {order.quantity ||
                      1}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600">
                    <th className="px-4 py-3">
                      Item
                    </th>

                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Quantity
                    </th>

                    <th className="px-4 py-3">
                      Unit Price
                    </th>

                    <th className="px-4 py-3">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <p className="font-black text-zinc-950">
                            {
                              item.title
                            }
                          </p>

                          <p className="mt-1 break-all text-xs text-zinc-500">
                            ID:{" "}
                            {
                              item.id
                            }
                          </p>

                          {item.licenseId && (
                            <p className="mt-1 break-all text-xs text-zinc-500">
                              Licence:{" "}
                              {
                                item.licenseId
                              }
                            </p>
                          )}

                          {item.variantId && (
                            <p className="mt-1 break-all text-xs text-zinc-500">
                              Variant:{" "}
                              {
                                item.variantId
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 font-bold uppercase">
                          {
                            item.productType
                          }
                        </td>

                        <td className="px-4 py-4 font-bold">
                          {
                            item.quantity
                          }
                        </td>

                        <td className="px-4 py-4 font-bold">
                          {formatMoney(
                            item.unitAmount
                          )}
                        </td>

                        <td className="px-4 py-4 font-black">
                          {formatMoney(
                            item.unitAmount *
                              item.quantity
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border-2 border-black bg-white p-6">
            <h2 className="text-xl font-black text-zinc-950">
              Delivery
            </h2>

            {shippingLines.length >
            0 ? (
              <address className="mt-4 not-italic leading-7 text-zinc-800">
                {shippingLines.map(
                  (
                    line
                  ) => (
                    <div
                      key={
                        line
                      }
                    >
                      {
                        line
                      }
                    </div>
                  )
                )}
              </address>
            ) : (
              <p className="mt-4 text-zinc-600">
                No shipping
                address is
                required or
                recorded.
              </p>
            )}

            <dl className="mt-5 space-y-4 border-t pt-5">
              <div>
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Carrier
                </dt>

                <dd className="mt-1 font-bold text-zinc-950">
                  {order.carrier ||
                    "Not assigned"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Tracking Number
                </dt>

                <dd className="mt-1 break-all font-bold text-zinc-950">
                  {order.trackingNumber ||
                    "Not assigned"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Shipped
                </dt>

                <dd className="mt-1 font-bold text-zinc-950">
                  {order.shippedAt
                    ? order.shippedAt.toLocaleString(
                        "en-GB"
                      )
                    : "Not shipped"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border-2 border-black bg-white p-6">
            <h2 className="text-xl font-black text-zinc-950">
              Digital
              Fulfilment
            </h2>

            <div className="mt-5 space-y-4">
              {order.downloadUrl ? (
                <a
                  href={
                    order.downloadUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border-2 border-black bg-red-600 px-4 py-3 text-center font-black text-white transition hover:bg-red-700"
                >
                  Open Stored
                  Download
                </a>
              ) : (
                <p className="text-zinc-600">
                  No legacy
                  order-level
                  download URL is
                  stored.
                </p>
              )}

              {order.contractPdfUrl ? (
                <a
                  href={
                    order.contractPdfUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border-2 border-black bg-blue-600 px-4 py-3 text-center font-black text-white transition hover:bg-blue-700"
                >
                  Open Contract
                  PDF
                </a>
              ) : (
                <p className="text-zinc-600">
                  No contract PDF
                  is stored for
                  this order.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
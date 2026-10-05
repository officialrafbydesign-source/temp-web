import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/account/LogoutButton";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

export const dynamic = "force-dynamic";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatProductType(productType: string) {
  return productType.charAt(0).toUpperCase() + productType.slice(1);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "border-green-800 bg-green-100 text-green-900";
    case "shipped":
      return "border-blue-800 bg-blue-100 text-blue-900";
    case "delivered":
      return "border-emerald-800 bg-emerald-100 text-emerald-900";
    case "cancelled":
      return "border-red-800 bg-red-100 text-red-900";
    default:
      return "border-amber-800 bg-amber-100 text-amber-900";
  }
}

function getStringValue(
  record: Record<string, unknown>,
  key: string
) {
  const value = record[key];
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function getShippingAddressLines(address: unknown) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return [];
  }

  const root = address as Record<string, unknown>;

  const nestedAddress =
    root.address &&
    typeof root.address === "object" &&
    !Array.isArray(root.address)
      ? (root.address as Record<string, unknown>)
      : root;

  const name =
    getStringValue(root, "name") ||
    getStringValue(root, "recipient");

  const line1 = getStringValue(nestedAddress, "line1");
  const line2 = getStringValue(nestedAddress, "line2");
  const city = getStringValue(nestedAddress, "city");
  const state = getStringValue(nestedAddress, "state");
  const postalCode =
    getStringValue(nestedAddress, "postal_code") ||
    getStringValue(nestedAddress, "postalCode");
  const country = getStringValue(nestedAddress, "country");

  const cityLine = [city, state, postalCode]
    .filter(Boolean)
    .join(", ");

  return [name, line1, line2, cityLine, country].filter(
    (line): line is string => Boolean(line)
  );
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const isFulfilledPayment = ["paid", "processing", "shipped", "delivered"].includes(
    order.status
  );

  const musicIds = order.items
    .filter((item) => item.productType === "music" && item.productId)
    .map((item) => item.productId as string);
  const musicProducts = await prisma.musicProduct.findMany({
    where: { id: { in: musicIds } },
    select: { id: true, itemType: true },
  });
  const physicalMusicIds = new Set(
    musicProducts.filter((product) => String(product.itemType).toUpperCase() === "PHYSICAL")
      .map((product) => product.id)
  );

  const hasPhysicalItems =
    Boolean(order.shippingAddress) ||
    order.items.some(
      (item) =>
        item.productType === "clothing" ||
        item.productType === "merch" ||
        (item.productType === "music" && physicalMusicIds.has(item.productId || ""))
    );

  const itemSubtotal = order.items.reduce(
    (total, item) => total + item.unitAmount * item.quantity,
    0
  );

  const deliveryAmount = Math.max(0, order.amount - itemSubtotal);
  const shippingAddressLines = getShippingAddressLines(
    order.shippingAddress
  );

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 border-b-2 border-black pb-6">
              <div>
                <Link
                  href="/account/orders"
                  className="text-sm font-black text-red-700 underline underline-offset-4 hover:text-red-600"
                >
                  ← Back to My Orders
                </Link>

                <h1 className="font-raf text-4xl sm:text-5xl uppercase mt-4">
                  Order Details
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="text-zinc-700">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>

                  <span
                    className={`rounded-full border-2 px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              <LogoutButton />
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="rounded-xl border-2 border-black p-5 sm:p-6">
                  <h2 className="text-2xl font-black">Purchased Items</h2>

                  {order.items.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {order.items.map((item) => {
                        const isDigital =
                          item.productType === "beat" ||
                          (item.productType === "music" && !physicalMusicIds.has(item.productId || ""));

                        return (
                          <article
                            key={item.id}
                            className="rounded-lg border-2 border-black bg-zinc-50 p-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="text-lg font-black break-words">
                                  {item.title}
                                </h3>

                                <p className="mt-1 text-sm text-zinc-700">
                                  {formatProductType(item.productType)} · Quantity {item.quantity}
                                </p>
                              </div>

                              <p className="text-lg font-black shrink-0">
                                £{((item.unitAmount * item.quantity) / 100).toFixed(2)}
                              </p>
                            </div>

                            {isDigital && isFulfilledPayment && (
                              <a
                                href={`/api/account/orders/${order.id}/items/${item.id}/download`}
                                className="mt-4 inline-flex items-center justify-center rounded-lg border-2 border-black bg-red-600 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700"
                              >
                                Download Purchase
                              </a>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border-2 border-black bg-zinc-50 p-4">
                      <p className="font-black">
                        {order.productType
                          ? `${formatProductType(order.productType)} purchase`
                          : "Purchase"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-700">
                        Quantity {order.quantity || 1}
                      </p>

                      {order.downloadUrl && isFulfilledPayment && (
                        <a
                          href={order.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center justify-center rounded-lg border-2 border-black bg-red-600 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700"
                        >
                          Download Purchase
                        </a>
                      )}
                    </div>
                  )}
                </section>

                {hasPhysicalItems && (
                  <section className="rounded-xl border-2 border-black p-5 sm:p-6">
                    <h2 className="text-2xl font-black">Delivery</h2>

                    <p className="mt-3 text-zinc-700">
                      UK delivery is estimated within 5 working days.
                    </p>

                    {shippingAddressLines.length > 0 && (
                      <div className="mt-5">
                        <h3 className="font-black">Delivery Address</h3>

                        <address className="mt-2 not-italic text-zinc-700 leading-7">
                          {shippingAddressLines.map((line, index) => (
                            <div key={`${line}-${index}`}>{line}</div>
                          ))}
                        </address>
                      </div>
                    )}

                    {(order.trackingNumber || order.carrier) && (
                      <div className="mt-5 rounded-lg border-2 border-black bg-zinc-50 p-4">
                        <h3 className="font-black">Tracking</h3>

                        {order.carrier && (
                          <p className="mt-2 text-zinc-700">
                            Carrier: {order.carrier}
                          </p>
                        )}

                        {order.trackingNumber && (
                          <p className="mt-1 text-zinc-700 break-all">
                            Tracking number: {order.trackingNumber}
                          </p>
                        )}

                        {order.shippedAt && (
                          <p className="mt-1 text-zinc-700">
                            Shipped: {formatDate(order.shippedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {order.contractPdfUrl && isFulfilledPayment && (
                  <section className="rounded-xl border-2 border-black p-5 sm:p-6">
                    <h2 className="text-2xl font-black">Documents</h2>

                    <a
                      href={order.contractPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center rounded-lg border-2 border-black bg-black px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-800"
                    >
                      View Licence Agreement
                    </a>
                  </section>
                )}
              </div>

              <aside className="h-fit rounded-xl border-2 border-black bg-zinc-50 p-5 sm:p-6">
                <h2 className="text-2xl font-black">Order Summary</h2>

                <dl className="mt-5 space-y-3">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-700">Order date</dt>
                    <dd className="font-bold text-right">
                      {formatDate(order.createdAt)}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-700">Customer</dt>
                    <dd className="font-bold text-right break-all">
                      {order.email || user.email}
                    </dd>
                  </div>

                  {order.items.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-700">Items</dt>
                      <dd className="font-bold">
                        £{(itemSubtotal / 100).toFixed(2)}
                      </dd>
                    </div>
                  )}

                  {hasPhysicalItems && order.items.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-700">UK delivery</dt>
                      <dd className="font-bold">
                        {deliveryAmount === 0
                          ? "Free"
                          : `£${(deliveryAmount / 100).toFixed(2)}`}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-t-2 border-black pt-4 text-xl">
                    <dt className="font-black">Total</dt>
                    <dd className="font-black">
                      £{(order.amount / 100).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

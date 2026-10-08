import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/account/LogoutButton";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: {
        in: ["paid", "processing", "shipped", "delivered", "cancelled"],
      },
    },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          productType: true,
          unitAmount: true,
          quantity: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden [font-family:Arial,Helvetica,sans-serif]">
      <RafAboutBackground />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 border-b-2 border-black pb-6">
              <div>
                <h1 className="font-raf text-4xl sm:text-5xl uppercase">
                  My Orders
                </h1>

                <p className="mt-2 text-base sm:text-lg text-zinc-700">
                  Signed in as {user.name || user.email}
                </p>
                <p className="mt-2 text-sm text-zinc-700">
                  For account closure or personal data requests, see our{" "}
                  <Link href="/all-about-raf/legal/privacy" className="font-bold underline underline-offset-2">
                    Privacy &amp; Cookies notice
                  </Link>.
                </p>
              </div>

              <LogoutButton />
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <h2 className="text-2xl font-black">
                  No completed orders yet
                </h2>

                <p className="mt-3 text-zinc-700">
                  Purchases made while signed in will appear here.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-flex items-center justify-center rounded-lg border-2 border-black bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-700"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                {orders.map((order) => {
                  const itemCount =
                    order.items.length > 0
                      ? order.items.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )
                      : order.quantity || 1;

                  const firstItem = order.items[0];

                  const orderSummary = firstItem
                    ? order.items.length > 1
                      ? `${firstItem.title} + ${order.items.length - 1} more`
                      : firstItem.title
                    : order.productType
                      ? `${formatStatus(order.productType)} purchase`
                      : "Order";

                  return (
                    <article
                      key={order.id}
                      className="rounded-xl border-2 border-black bg-white p-5 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg sm:text-xl font-black break-words">
                              {orderSummary}
                            </h2>

                            <span
                              className={`rounded-full border-2 px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClasses(
                                order.status
                              )}`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:text-base text-zinc-700">
                            <span>
                              Order #{order.id.slice(-8).toUpperCase()}
                            </span>

                            <span>{formatDate(order.createdAt)}</span>

                            <span>
                              {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:shrink-0">
                          <p className="text-2xl font-black">
                            £{(order.amount / 100).toFixed(2)}
                          </p>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center justify-center rounded-lg border-2 border-black bg-black px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-zinc-800"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

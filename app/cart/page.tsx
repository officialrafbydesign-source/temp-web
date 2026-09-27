"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const UK_DELIVERY_COST = 5;
const FREE_DELIVERY_THRESHOLD = 70;

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const router = useRouter();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const physicalSubtotal = cart
    .filter(
      (item) =>
        item.type === "clothing" ||
        item.type === "merch" ||
        (
          item.type === "music" &&
          item.itemType?.toUpperCase() === "PHYSICAL"
        )
    )
    .reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  const hasPhysicalProducts = physicalSubtotal > 0;

  const qualifiesForFreeDelivery =
    physicalSubtotal > FREE_DELIVERY_THRESHOLD;

  const deliveryCharge =
    hasPhysicalProducts && !qualifiesForFreeDelivery
      ? UK_DELIVERY_COST
      : 0;

  const cartTotal = subtotal + deliveryCharge;

  const amountUntilFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD + 0.01 - physicalSubtotal
  );

  if (cart.length === 0) {
    return (
      <main className="min-h-screen relative text-black overflow-x-hidden">
        <RafAboutBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl rounded-2xl border-4 border-black bg-white p-8 sm:p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xl sm:text-2xl font-bold">
              Your cart is empty
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 bg-black text-white px-7 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-zinc-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleClearCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (confirmed) {
      clearCart();
    }
  };

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden">
      <RafAboutBackground />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 pb-10 sm:pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <section className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl sm:text-5xl font-bold mb-8">
              Your Cart
            </h1>

            <div className="space-y-5">
              {cart.map((item) => {
                const isBeat = item.type === "beat";

                return (
                  <div
                    key={`${item.id}-${item.licenseId ?? "no-license"}-${item.variant ?? "default"}`}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 rounded-xl border-2 border-black bg-white p-5 sm:p-6 w-full"
                  >
                    <div className="flex gap-4 sm:gap-5 items-start min-w-0 flex-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-black shrink-0"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-lg sm:text-xl font-bold break-words">
                          {item.title}
                        </p>

                        <p className="text-base sm:text-lg text-zinc-700 mt-2">
                          £{item.price.toFixed(2)} × {item.quantity}
                        </p>

                        {item.variant && (
                          <p className="text-sm sm:text-base text-zinc-600 break-words mt-1">
                            {item.variant}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-4">
                          <div className="flex items-center rounded-lg border-2 border-black overflow-hidden">
                            <button
                              type="button"
                              aria-label={`Decrease quantity for ${item.title}`}
                              disabled={isBeat || item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                  item.licenseId,
                                  item.variant
                                )
                              }
                              className="h-10 w-10 bg-black text-white hover:bg-zinc-800 text-lg font-bold disabled:opacity-35 disabled:cursor-not-allowed"
                            >
                              −
                            </button>

                            <span className="min-w-12 px-3 text-center text-base sm:text-lg font-bold bg-white">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase quantity for ${item.title}`}
                              disabled={isBeat}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                  item.licenseId,
                                  item.variant
                                )
                              }
                              className="h-10 w-10 bg-black text-white hover:bg-zinc-800 text-lg font-bold disabled:opacity-35 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.id,
                                item.licenseId,
                                item.variant
                              )
                            }
                            className="text-base font-bold text-red-600 hover:text-red-500 underline underline-offset-4 transition"
                          >
                            Delete Item
                          </button>
                        </div>

                        {isBeat && (
                          <p className="mt-3 text-sm text-zinc-500">
                            Beat licences are limited to one of each licence per order.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-lg sm:text-xl font-bold shrink-0 text-right sm:pl-4">
                      £{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t-2 border-black pt-6">
              {hasPhysicalProducts && (
                <div className="mb-6 rounded-xl border-2 border-black bg-zinc-100 p-4 sm:p-5">
                  <p className="text-base sm:text-lg font-bold">
                    UK delivery: £5 — estimated within 5 working days.
                  </p>

                  <p className="mt-1 text-sm sm:text-base text-zinc-700">
                    Free UK delivery applies when physical products total over £70.
                    Digital products do not count towards the threshold.
                  </p>

                  <p
                    className={`mt-3 text-base font-bold ${
                      qualifiesForFreeDelivery
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {qualifiesForFreeDelivery
                      ? "Free UK delivery unlocked."
                      : `Add £${amountUntilFreeDelivery.toFixed(
                          2
                        )} more in physical products for free delivery.`}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  {hasPhysicalProducts && (
                    <>
                      <p className="text-base sm:text-lg font-semibold">
                        Items subtotal: £{subtotal.toFixed(2)}
                      </p>

                      <p className="text-base sm:text-lg font-semibold mt-1">
                        Delivery:{" "}
                        {qualifiesForFreeDelivery
                          ? "Free"
                          : `£${deliveryCharge.toFixed(2)}`}
                      </p>
                    </>
                  )}

                  <p className="text-2xl sm:text-3xl font-bold mt-2">
                    Total: £{cartTotal.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="bg-blue-600 text-white px-7 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="border-2 border-black bg-white text-black px-7 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-zinc-100 transition"
                >
                  Continue Shopping
                </button>

                <button
                  type="button"
                  onClick={handleClearCart}
                  className="bg-red-700 text-white px-7 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-red-800 transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
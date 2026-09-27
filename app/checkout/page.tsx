"use client";

import {
  useState,
} from "react";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const UK_DELIVERY_COST = 5;
const FREE_DELIVERY_THRESHOLD = 70;

export default function CheckoutPage() {
  const { cart } =
    useCart();

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    checkoutError,
    setCheckoutError,
  ] = useState<
    string | null
  >(null);

  const [
    accountRequired,
    setAccountRequired,
  ] = useState(false);

  const subtotal =
    cart.reduce(
      (acc, item) =>
        acc +
        item.price *
          item.quantity,
      0
    );

  const physicalSubtotal =
    cart
      .filter(
        (item) =>
          item.type ===
            "clothing" ||
          item.type ===
            "merch" ||
          (
            item.type ===
              "music" &&
            item.itemType
              ?.toUpperCase() ===
              "PHYSICAL"
          )
      )
      .reduce(
        (acc, item) =>
          acc +
          item.price *
            item.quantity,
        0
      );

  const hasPhysicalProducts =
    physicalSubtotal > 0;

  const qualifiesForFreeDelivery =
    physicalSubtotal >
    FREE_DELIVERY_THRESHOLD;

  const deliveryCharge =
    hasPhysicalProducts &&
    !qualifiesForFreeDelivery
      ? UK_DELIVERY_COST
      : 0;

  const total =
    subtotal +
    deliveryCharge;

  const handleCheckout =
    async () => {
      setCheckoutError(
        null
      );

      setAccountRequired(
        false
      );

      if (
        cart.length === 0
      ) {
        setCheckoutError(
          "Your cart is empty."
        );

        return;
      }

      setIsSubmitting(
        true
      );

      try {
        const res =
          await fetch(
            "/api/checkout/create-session",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  cart,
                  email:
                    "guest",
                }),
            }
          );

        const data =
          await res.json();

        if (
          data.code ===
          "ACCOUNT_REQUIRED"
        ) {
          setAccountRequired(
            true
          );

          return;
        }

        if (
          !res.ok ||
          data.error
        ) {
          setCheckoutError(
            data.error ||
              "Checkout could not be started."
          );

          return;
        }

        if (data.url) {
          window.location.href =
            data.url;

          return;
        }

        setCheckoutError(
          "Stripe did not return a checkout link."
        );
      } catch (error) {
        console.error(
          "Checkout failed:",
          error
        );

        setCheckoutError(
          "Checkout failed. Please try again."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  return (
    <main className="min-h-screen relative text-black overflow-x-hidden">
      <RafAboutBackground />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 pb-10 sm:pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="rounded-2xl border-4 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl sm:text-5xl font-bold mb-8">
              Checkout
            </h1>

            {cart.length ===
              0 && (
              <p className="text-lg">
                Your cart is
                empty.
              </p>
            )}

            {cart.length >
              0 && (
              <div className="space-y-5">
                {cart.map(
                  (item) => (
                    <div
                      key={`${item.id}-${item.licenseId ?? "no-license"}-${item.variant ?? "default"}`}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 rounded-xl border-2 border-black bg-white p-5 sm:p-6 w-full"
                    >
                      <div className="text-lg sm:text-xl font-bold">
                        {
                          item.title
                        }
                      </div>

                      <div className="text-base sm:text-lg font-semibold text-zinc-700">
                        £
                        {item.price.toFixed(
                          2
                        )}{" "}
                        ×{" "}
                        {
                          item.quantity
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-8 border-t-2 border-black pt-6">
              {hasPhysicalProducts && (
                <div className="mb-6 rounded-xl border-2 border-black bg-zinc-100 p-4 sm:p-5">
                  <p className="text-lg sm:text-xl font-bold">
                    {qualifiesForFreeDelivery
                      ? "Free UK Delivery"
                      : "UK Standard Delivery — £5"}
                  </p>

                  <p className="mt-1 text-sm sm:text-base text-zinc-700">
                    Estimated
                    delivery within
                    5 working days.
                    UK delivery only.
                  </p>

                  <p className="mt-2 text-sm sm:text-base text-zinc-700">
                    Free UK delivery
                    applies when
                    physical products
                    total over £70.
                    Digital products
                    do not count
                    towards the
                    threshold.
                  </p>
                </div>
              )}

              {hasPhysicalProducts && (
                <div className="mb-4 space-y-1 text-base sm:text-lg font-semibold">
                  <p>
                    Items subtotal:
                    £
                    {subtotal.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    Delivery:{" "}
                    {qualifiesForFreeDelivery
                      ? "Free"
                      : `£${deliveryCharge.toFixed(
                          2
                        )}`}
                  </p>
                </div>
              )}

              <div className="text-2xl sm:text-3xl font-bold">
                Total: £
                {total.toFixed(
                  2
                )}
              </div>

              {accountRequired && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border-2 border-black bg-amber-100 p-5"
                >
                  <p className="text-lg sm:text-xl font-bold">
                    Account
                    required for
                    digital purchases
                  </p>

                  <p className="mt-2 text-sm sm:text-base text-zinc-800">
                    Sign in or
                    create an account
                    before buying
                    beats or digital
                    music. Your
                    purchases will
                    remain available
                    from your order
                    history.
                  </p>

                  <p className="mt-2 text-sm sm:text-base text-zinc-700">
                    Your cart will
                    remain saved
                    while you sign
                    in.
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/login?returnTo=/checkout"
                      className="flex flex-1 items-center justify-center rounded-lg border-2 border-black bg-black px-6 py-3 text-base font-bold text-white transition hover:bg-zinc-800"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/register?returnTo=/checkout"
                      className="flex flex-1 items-center justify-center rounded-lg border-2 border-black bg-white px-6 py-3 text-base font-bold text-black transition hover:bg-zinc-100"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}

              {checkoutError && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border-2 border-red-700 bg-red-50 p-4 text-sm sm:text-base font-semibold text-red-800"
                >
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleCheckout
                }
                disabled={
                  cart.length ===
                    0 ||
                  isSubmitting
                }
                className="bg-blue-600 text-white px-7 py-3 mt-6 rounded-lg text-base sm:text-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed w-full"
              >
                {isSubmitting
                  ? "Preparing Payment..."
                  : "Proceed to Payment"}
              </button>

              <Link
                href="/cart"
                className="flex items-center justify-center border-2 border-black bg-white text-black px-7 py-3 mt-3 rounded-lg text-base sm:text-lg font-bold hover:bg-zinc-100 transition w-full"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
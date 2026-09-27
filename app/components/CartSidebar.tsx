"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate total price
  const total = cart.reduce(
    (acc, item: any) => acc + item.price * (item.quantity || 1),
    0
  );

  // Direct Checkout with Stripe API Route
  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Formats the items array to match what /api/checkout expects
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item: any) => ({
            id: item.id,
            productId: item.productId || item.id,
            licenseId: item.licenseId || null,
            productType: item.productType || item.type || "beat",
            title: item.title || item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image || item.artworkUrl || item.imageUrl || "",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect user directly to Stripe Hosted Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL received.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "An error occurred during checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-80 md:w-96 p-6 bg-zinc-950 text-white h-full shadow-2xl z-50 border-l-4 border-black flex flex-col justify-between font-mono">

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-4 border-black mb-6">
          <h2 className="text-lg font-black uppercase text-red-500 tracking-wider">
            YOUR CART ({cart.reduce((acc, i: any) => acc + (i.quantity || 1), 0)})
          </h2>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-900/50 border-2 border-red-600 rounded text-xs text-red-300">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Empty State */}
        {cart.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-12">
            Your cart is empty.
          </p>
        )}

        {/* Cart Item List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {cart.map((item: any, idx: number) => (
            <div
              key={`${item.id}-${item.licenseId || idx}`}
              className="flex justify-between items-center bg-zinc-900 border-2 border-black p-3 rounded"
            >
              <div className="flex-1 pr-2">
                <p className="text-xs font-bold text-zinc-100 line-clamp-1">
                  {item.title || item.name}
                </p>

                {item.licenseName && (
                  <p className="text-[10px] text-red-400 font-bold uppercase">
                    [{item.licenseName}]
                  </p>
                )}

                <p className="text-xs text-zinc-400 font-black mt-1">
                  £{item.price.toFixed(2)} × {item.quantity || 1}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-400 text-sm font-black p-1"
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Total & Checkout Buttons */}
      <div className="border-t-4 border-black pt-4 mt-4">
        <div className="flex justify-between items-center text-sm font-black uppercase mb-4">
          <span className="text-zinc-400">Total:</span>
          <span className="text-xl text-red-500">£{total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || loading}
          className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-black py-3 rounded border-2 border-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>CONNECTING TO STRIPE...</span>
            </>
          ) : (
            <span>PROCEED TO CHECKOUT ↗</span>
          )}
        </button>
      </div>

    </div>
  );
}
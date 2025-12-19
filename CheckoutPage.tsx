"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Retrieve cart from local storage and update state
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty! Please add items before proceeding.");
      return;
    }

    try {
      // Make the request to the backend to create a checkout session
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cart),
      });

      const { url, error } = await res.json();

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
        {cart.length === 0 && <p>Your cart is empty.</p>}

        {cart.map((item) => (
          <div key={item.product.id} className="flex justify-between mb-4">
            <div>{item.product.title}</div>
            <div>£{item.product.price.toFixed(2)} x {item.quantity}</div>
          </div>
        ))}

        <div className="mt-4 text-lg font-semibold">
          Total: £{total.toFixed(2)}
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 mt-6 rounded hover:bg-green-700 w-full"
          onClick={handleCheckout}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

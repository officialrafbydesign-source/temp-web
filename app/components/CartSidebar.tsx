"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  product: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
};

export default function CartSidebar() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  // Calculate the total cart price
  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Handle the checkout process
  const handleCheckout = async () => {
    const userId = "some-user-id"; // You should get this from your user auth logic

    const cartData = cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
    }));

    try {
      // Send cart data to your backend to create an order
      const res = await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({ userId, cart: cartData, amount: total }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.error) {
        console.error("Error creating order:", data.error);
      } else {
        console.log("Order created:", data.order.id);

        // Now that the order is created, proceed to checkout (Stripe)
        window.location.href = "/checkout"; // Redirect to Stripe checkout page (or success page)
      }
    } catch (err) {
      console.error("Error during checkout:", err);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-80 p-4 bg-white shadow-lg">
      <h2 className="text-xl font-semibold">Your Cart</h2>
      <div>
        {cart.length === 0 && <p>Your cart is empty.</p>}

        {cart.map((item, index) => (
          <div key={index} className="flex justify-between mb-4">
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

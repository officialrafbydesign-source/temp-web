"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  product: MusicProduct;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  // Handle removing an item
  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.product.id !== itemId));
  };

  // Calculate total
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item) => (
        <div key={item.product.id} className="flex items-center mb-4 border-b pb-4">
          <img
            src={item.product.coverUrl}
            alt={item.product.title}
            className="w-24 h-24 object-cover rounded mr-4"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{item.product.title}</h2>
            <p>{item.product.artist}</p>
            <p>£{item.product.price.toFixed(2)} x {item.quantity}</p>
            <p className="mt-2">{item.product.itemType === "PHYSICAL" ? `Stock: ${item.product.stock}` : "Digital Product"}</p>
          </div>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleRemoveFromCart(item.product.id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Total: £{total.toFixed(2)}</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push("/checkout")}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

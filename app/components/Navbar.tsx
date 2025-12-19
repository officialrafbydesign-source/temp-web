"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-between items-center">
      
      {/* Logo (Left) */}
      <Link href="/" className="text-2xl font-bold">
        RAF
      </Link>

      {/* Links (Center) */}
      <div className="space-x-6 hidden md:flex">
        <Link href="/beats">Beats</Link>
        <Link href="/clothing">Clothing</Link>
        <Link href="/shop">Music</Link>
        <Link href="/design">Design</Link>
      </div>

      {/* Cart Icon (Right) */}
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative">
          🛒
          {count > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 rounded-full">
              {count}
            </span>
          )}
        </button>

        {/* Mini Cart Dropdown */}
        {open && (
          <div className="absolute right-0 mt-3 w-72 bg-white text-black shadow-lg rounded-lg p-4 z-50">
            <h3 className="font-bold mb-3">Your Cart</h3>

            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty</p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.title}</span>
                    <span>£{item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <Link
                href="/checkout"
                className="block text-center bg-blue-600 text-white py-2 rounded"
              >
                Go to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

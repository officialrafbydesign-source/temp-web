"use client";

import { useEffect, useState } from "react";

type MusicProduct = {
  id: string;
  title: string;
  artist: string;
  price: number;
  coverUrl: string;
  itemType: "DIGITAL" | "PHYSICAL";
  stock?: number; // Optional for digital products
};

type CartItem = {
  product: MusicProduct;
  quantity: number;
};

export default function MusicShopPage() {
  const [items, setItems] = useState<MusicProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]); // Cart state
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    async function loadMusic() {
      try {
        const res = await fetch("/api/music");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to load music products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMusic();
  }, []);

  // Handle add to cart
  const handleAddToCart = (item: MusicProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.product.id === item.id);
      if (existingItem) {
        // If item already exists in cart, increase quantity for physical items
        if (item.itemType === "PHYSICAL" && existingItem.quantity < (item.stock || 0)) {
          return prevCart.map((cartItem) =>
            cartItem.product.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        // If it's a digital product, allow infinite quantity
        if (item.itemType === "DIGITAL") {
          return prevCart.map((cartItem) =>
            cartItem.product.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
      }
      // If not found in cart, add as new
      return [...prevCart, { product: item, quantity: 1 }];
    });
  };

  // Handle remove from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.product.id !== itemId));
  };

  // Handle cart quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.product.id === itemId
          ? { ...cartItem, quantity: quantity }
          : cartItem
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎧 Music Shop</h1>

      {loading && <p>Loading music products...</p>}
      {!loading && items.length === 0 && <p>No music items available.</p>}

      {/* Music Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 shadow">
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-bold">{item.title}</h2>
            <p className="text-gray-600">{item.artist}</p>

            <p className="text-gray-800 font-semibold mt-2">
              £{item.price.toFixed(2)}
            </p>

            <p className="text-gray-500 text-sm mt-1">
              {item.itemType === "PHYSICAL" ? `Stock available: ${item.stock}` : "Digital Product"}
            </p>

            <button
              className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 ${
                item.itemType === "PHYSICAL" && item.stock === 0 ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
              disabled={item.itemType === "PHYSICAL" && item.stock === 0}
              onClick={() => handleAddToCart(item)}
            >
              {item.itemType === "PHYSICAL" && item.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      <div className="mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          onClick={() => window.location.href = "/cart"}
        >
          Go to Cart ({cart.length})
        </button>
      </div>
    </div>
  );
}

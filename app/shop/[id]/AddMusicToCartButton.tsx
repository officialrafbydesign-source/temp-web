"use client";

import { useCart } from "@/context/CartContext"; 


export default function AddMusicToCartButton({ product }: any) {
  const { addToCart } = useCart();

  function handleAdd() {
    addToCart({
      id: product.id,
      type: "music",
      title: product.title,
      price: product.price,
      image: product.coverUrl,
      quantity: 1,
    });
  }

  return (
    <button
      onClick={handleAdd}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
    >
      Add to Cart
    </button>
  );
}

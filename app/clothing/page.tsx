"use client";

import { useEffect, useState } from "react";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  variants: Variant[];
};

addToCart({
  id: `${product.id}_${variant.size}_${variant.color}`,
  type: "clothing",
  title: product.name,
  price: product.price,
  image: product.imageUrl,
  quantity: 1,
  variant: `${variant.size} / ${variant.color}`,
});

export default function ClothingStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products"); // PUBLIC API
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">👕 Clothing Store</h1>

      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <p>No products available.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-bold">{product.name}</h2>
            {product.description && (
              <p className="text-gray-500">{product.description}</p>
            )}

            <p className="text-gray-600 font-semibold mt-2">
              £{product.price.toFixed(2)}
            </p>

            <h3 className="font-semibold mt-3">Variants</h3>
            <ul className="text-sm mb-4">
              {product.variants.map((v) => (
                <li key={v.id}>
                  {v.size} / {v.color} — Stock: {v.stock}
                </li>
              ))}
            </ul>

            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

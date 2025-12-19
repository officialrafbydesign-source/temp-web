"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout"; // adjust path if needed

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: Variant[];
};

export default function ClothingAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/products");
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
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">👕 Clothing Store Admin</h1>

        {loading && <p>Loading products...</p>}
        {!loading && products.length === 0 && <p>No products found.</p>}

        {!loading && products.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Price</th>
                <th className="border p-2 text-left">Variants</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.id}</td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">${p.price}</td>
                  <td className="border p-2">
                    {p.variants.map((v) => (
                      <div key={v.id}>
                        {v.size} / {v.color} - Stock: {v.stock}
                      </div>
                    ))}
                  </td>
                  <td className="border p-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}


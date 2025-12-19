"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Types for MusicProduct
type MusicProduct = {
  id: string;
  title: string;
  artist: string;
  price: number;
  stock: number;
  coverUrl: string;
  createdAt: string;
};

export default function MusicManagementPage() {
  const [musicProducts, setMusicProducts] = useState<MusicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [coverUrl, setCoverUrl] = useState("");
  const [stock, setStock] = useState<number | string>("");
  const [type, setType] = useState<"physical" | "digital">("digital");
  const [error, setError] = useState("");

  // Fetch Music Products
  useEffect(() => {
    async function fetchMusicProducts() {
      try {
        const res = await fetch("/api/admin/music-products");
        const data = await res.json();
        setMusicProducts(data);
      } catch (err) {
        console.error("Failed to fetch music products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMusicProducts();
  }, []);

  // Submit New Music Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/music-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          price: parseFloat(price as string),
          stock: type === "physical" ? parseInt(stock as string) : 0, // Only set stock if physical
          coverUrl,
          type,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Reset form on success
        setTitle("");
        setArtist("");
        setPrice("");
        setCoverUrl("");
        setStock("");
        setType("digital");
        alert("Music product added successfully!");
        setMusicProducts((prev) => [data, ...prev]); // Prepend the new product to the list
      } else {
        setError(data.error || "An error occurred while adding the product.");
      }
    } catch (err) {
      setError("Failed to add music product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎶 Music Management</h1>

      {/* New Music Product Form */}
      <h2 className="text-2xl font-semibold mb-4">Add New Music Product</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Artist</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Price (£)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Cover Image URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Product Type</label>
          <select
            className="w-full p-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value as "physical" | "digital")}
            required
          >
            <option value="digital">Digital</option>
            <option value="physical">Physical</option>
          </select>
        </div>

        {type === "physical" && (
          <div>
            <label className="block font-semibold">Stock Quantity</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>

      {/* Display Music Products */}
      <h2 className="text-2xl font-semibold mb-4">Current Music Products</h2>

      {loading && <p>Loading music products...</p>}
      {!loading && musicProducts.length === 0 && <p>No music products found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {musicProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow">
            <img
              src={product.coverUrl}
              alt={product.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-bold">{product.title}</h2>
            <p className="text-gray-500">Artist: {product.artist}</p>
            <p className="text-gray-500 font-semibold mt-2">£{product.price}</p>
            <p className="text-gray-500 mt-1">Stock: {product.stock}</p>
            <p className="text-gray-400 text-sm mt-1">
              Added: {new Date(product.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700">
                Edit
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

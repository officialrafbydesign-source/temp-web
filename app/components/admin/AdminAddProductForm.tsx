"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

type ItemType = "BEAT" | "MUSIC" | "CLOTHING";

export default function AdminAddProductForm() {
  const [itemType, setItemType] = useState<ItemType>("BEAT");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Category Specific States
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Please provide a title and upload artwork.");
      return;
    }

    setLoading(true);

    // 1. Setup targeted endpoints and dynamically collect field updates
    let endpoint = "/api/beats";
    let payload: Record<string, any> = {
      title,
      imageUrl: imageUrl, // Mapping to standard carousel layout fields
      genre: genre || "Hip Hop",
      bpm: parseInt(bpm) || 120
    };

    if (itemType === "MUSIC") {
      endpoint = "/api/music/release";
      payload = {
        title,
        artist,
        imageUrl: imageUrl
      };
    } else if (itemType === "CLOTHING") {
      endpoint = "/api/products";
      payload = {
        name: title,
        price: parseFloat(price) || 0,
        imageUrls: [imageUrl],
        variants: [
          { size: "M", color: "Black", stock: 10 }
        ]
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`${itemType} successfully saved directly to database!`);
        // Reset states cleanly
        setTitle("");
        setImageUrl("");
        setGenre("");
        setBpm("");
        setArtist("");
        setPrice("");
      } else {
        alert("Server failed to commit entries.");
      }
    } catch (err) {
      console.error(err);
      alert("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Dynamic Selector Badges */}
      <div>
        <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-2">Item Type Selection</label>
        <div className="grid grid-cols-3 gap-2">
          {(["BEAT", "MUSIC", "CLOTHING"] as ItemType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setItemType(type); setImageUrl(""); }}
              className={`py-2 text-xs font-black uppercase tracking-wider border-2 border-black rounded-lg transition-all ${
                itemType === type
                  ? "bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-0.5"
                  : "bg-zinc-950 text-zinc-500 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Universal Fields */}
        <div>
          <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-1">
            {itemType === "CLOTHING" ? "Product Name" : "Item Title"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border-2 border-black rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-mono"
            placeholder="Enter title text..."
          />
        </div>

        {/* Dynamic Context Fields */}
        {itemType === "BEAT" && (
          <>
            <div>
              <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-black rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
                placeholder="Trap, Drill, etc."
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-1">BPM</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-black rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
                placeholder="140"
              />
            </div>
          </>
        )}

        {itemType === "MUSIC" && (
          <div>
            <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-1">Artist Profile</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-black rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
              placeholder="Artist / Group name"
            />
          </div>
        )}

        {itemType === "CLOTHING" && (
          <div>
            <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-1">Price (£)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-black rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
              placeholder="29.99"
            />
          </div>
        )}
      </div>

      {/* Cloudinary Integration Section */}
      <div className="border-2 border-black rounded-xl p-4 bg-zinc-950/40">
        <label className="block text-xs uppercase font-black tracking-widest text-zinc-400 mb-2">
          {itemType === "CLOTHING" ? "Product Showcase Asset" : "Artwork Cover File"}
        </label>

        {imageUrl ? (
          <div className="space-y-2">
            <div className="text-xs text-green-400 font-mono bg-zinc-950 border-2 border-black p-3 rounded-lg break-all">
              ✅ Secure Delivery URL Generated:<br />
              <span className="text-white selection:bg-red-500">{imageUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs uppercase font-black tracking-wider text-red-500 hover:underline"
            >
              Change file asset
            </button>
          </div>
        ) : (
          <ImageUploader onUploadSuccess={(url) => setImageUrl(url)} />
        )}
      </div>

      {/* Submission Core */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg border-4 border-black bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 py-3 font-black tracking-wider uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
      >
        {loading ? "Processing Entries..." : `Save New ${itemType}`}
      </button>
    </form>
  );
}
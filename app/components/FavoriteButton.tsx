"use client";

import { useState, useEffect } from "react";

export default function FavoriteButton({ beatId, userId }: { beatId: string; userId?: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user/favorites?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites?.includes(beatId)) {
          setIsFavorited(true);
        }
      });
  }, [beatId, userId]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to save beats to your favorites!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, beatId }),
      });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        isFavorited ? "text-red-500 bg-red-50" : "text-zinc-400 hover:text-zinc-700 bg-zinc-100"
      }`}
      title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isFavorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
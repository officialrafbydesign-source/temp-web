"use client";

import { useState } from "react";

export default function BeatFilters({ onFilter }: any) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");

  const submit = () => {
    onFilter({ search, genre });
  };

  return (
    <div className="flex gap-4 mb-6">
      <input
        placeholder="Search beats..."
        className="border p-2 rounded flex-1"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <input
        placeholder="Genre"
        className="border p-2 rounded w-40"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />

      <button
        onClick={submit}
        className="px-4 bg-black text-white rounded"
      >
        Filter
      </button>
    </div>
  );
}

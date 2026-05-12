"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="flex-1 border rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm font-medium"
      >
        Search
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={() => { setQuery(""); router.push("/"); }}
          className="text-gray-500 hover:text-gray-700 text-sm px-2"
        >
          Clear
        </button>
      )}
    </form>
  );
}

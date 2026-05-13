"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <div className="relative flex-1">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="input-glass pl-10 pr-4 py-3 text-sm w-full"
        />
      </div>
      <button type="submit" className="btn-primary px-6 py-3 text-sm">
        Search
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={() => { setQuery(""); router.push("/"); }}
          className="text-slate-400 hover:text-white transition text-sm px-3 py-2 rounded-xl hover:bg-white/8"
        >
          Clear
        </button>
      )}
    </form>
  );
}

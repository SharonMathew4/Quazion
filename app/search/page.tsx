"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { PublicationCard } from "@/components/publications/publication-card";
import { Search, BookOpen } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const results = MOCK_PUBLICATIONS.filter((pub) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      pub.title.toLowerCase().includes(q) ||
      pub.abstract.toLowerCase().includes(q) ||
      pub.author.displayName.toLowerCase().includes(q) ||
      pub.category.name.toLowerCase().includes(q) ||
      pub.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      pub.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
          <Search className="w-4 h-4" />
          <span>Universal Archive Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Search Scientific Repository
        </h1>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl">
        <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 shadow-lg">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across titles, abstracts, authors, categories, tags..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none py-1"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-800">
        <span>
          Showing {results.length} publication{results.length === 1 ? "" : "s"}
          {query ? ` for &ldquo;${query}&rdquo;` : ""}
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-xl p-12 text-center max-w-lg mx-auto">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">
            {query ? "No publications matched your search" : "No publications in the archive"}
          </h3>
          <p className="text-xs text-slate-400">
            {query
              ? "Try searching for alternative topics or keywords."
              : "The archive currently has no published papers. Be the first to publish research."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-slate-400 font-mono text-sm">Loading archive index...</div>}>
      <SearchContent />
    </Suspense>
  );
}

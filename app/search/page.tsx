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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <Search className="w-4 h-4 text-rose-700" />
          <span>Universal Journal Archive Index</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Search Scientific Repository
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Index-wide search across manuscript titles, structured abstracts, verified faculty authors, DOIs, and disciplines.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-3xl">
        <div className="flex items-center bg-white border border-slate-300 rounded p-2 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 shadow-2xs">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across titles, abstracts, authors, categories, tags, DOIs..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none py-1 font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer font-mono"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-4 border-t border-slate-200">
        <span>
          Showing {results.length} manuscript{results.length === 1 ? "" : "s"}
          {query ? ` matching query &ldquo;${query}&rdquo;` : ""}
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
        <div className="academic-card rounded p-12 text-center max-w-lg mx-auto bg-white border border-dashed border-slate-200 shadow-2xs">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-serif text-base font-semibold text-slate-900 mb-1">
            {query ? "No manuscripts matched your search" : "No manuscripts in the archive"}
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            {query
              ? "Try searching for alternative scientific terms, author surnames, or broader disciplines."
              : "The archive currently has no published papers. Be the first to publish research."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-slate-600 font-mono text-sm">Loading archive index...</div>}>
      <SearchContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global Search Bar UI Component — Section 4
 * Provides primary entry point for scientific archive inquiry.
 * TEMPORARY MOCK UI — Form submits via GET query parameters to /search.
 */
export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const popularTopics = [
    { label: "Gravitational Waves", query: "gravitational waves" },
    { label: "Hubble Constant", query: "hubble tension" },
    { label: "Black Holes", query: "black hole" },
    { label: "Quantum Entanglement", query: "entanglement" },
    { label: "Exoplanets", query: "exoplanets" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}${
        selectedFilter !== "all" ? `&type=${selectedFilter}` : ""
      }`;
      router.push(searchUrl);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-950/80 border border-slate-800 rounded-2xl p-1.5 focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20 shadow-2xl transition-all"
      >
        <div className="flex items-center flex-1 px-3 py-1">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers, cosmological observations, DOIs, equations, authors..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none py-1.5 font-sans"
            aria-label="Search scientific archive"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 px-2 sm:px-0 border-t sm:border-t-0 border-slate-800/80">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-sky-500 cursor-pointer"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="research">Research Papers</option>
            <option value="review">Review Articles</option>
            <option value="note">Scientific Notes</option>
          </select>

          <Button type="submit" variant="primary" size="md" className="shrink-0 flex items-center gap-2">
            <span>Search</span>
            <kbd className="hidden md:inline-block text-[10px] bg-sky-950 px-1.5 py-0.5 rounded text-sky-300 border border-sky-700/50">
              /
            </kbd>
          </Button>
        </div>
      </form>

      {/* Popular Topics Ticker */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Popular topics:</span>
        </span>
        {popularTopics.map((topic, idx) => (
          <React.Fragment key={topic.query}>
            <button
              type="button"
              onClick={() => {
                setQuery(topic.query);
                router.push(`/search?q=${encodeURIComponent(topic.query)}`);
              }}
              className="text-slate-400 hover:text-sky-300 hover:underline decoration-sky-500/40 transition-colors cursor-pointer"
            >
              {topic.label}
            </button>
            {idx < popularTopics.length - 1 && <span className="text-slate-700">•</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

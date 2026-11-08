"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global Search Bar Component
 * Academic archival search input with discipline filtering and standard research query parameters.
 */
export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const popularTopics = [
    { label: "Gravitational Waves", query: "gravitational waves" },
    { label: "Cosmic Microwave Background", query: "cosmic microwave background" },
    { label: "Topological Insulators", query: "topological insulators" },
    { label: "Quantum Coherence", query: "quantum coherence" },
    { label: "Exoplanet Atmospheres", query: "exoplanet atmospheres" },
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
    <div className="w-full max-w-3xl mx-auto space-y-3 font-sans">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-slate-300 rounded-md p-1.5 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-rose-500/20 shadow-xs transition-all"
      >
        <div className="flex items-center flex-1 px-3 py-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research papers, DOIs (10.1126/...), authors, equations..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5 font-sans"
            aria-label="Search scientific archive"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0 px-2 sm:px-0 border-t sm:border-t-0 border-slate-200">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer font-sans"
            aria-label="Filter by type"
          >
            <option value="all">All Content</option>
            <option value="research">Research Articles</option>
            <option value="review">Review Articles</option>
            <option value="preprint">Preprints</option>
          </select>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4"
          >
            <span>Search</span>
            <kbd className="hidden md:inline-block text-[10px] bg-rose-800/60 px-1 py-0.5 rounded text-rose-100 font-mono">
              /
            </kbd>
          </Button>
        </div>
      </form>

      {/* Suggested Inquiries */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
          Suggested Inquiries:
        </span>
        {popularTopics.map((topic, idx) => (
          <React.Fragment key={topic.query}>
            <button
              type="button"
              onClick={() => {
                setQuery(topic.query);
                router.push(`/search?q=${encodeURIComponent(topic.query)}`);
              }}
              className="text-slate-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer text-xs"
            >
              {topic.label}
            </button>
            {idx < popularTopics.length - 1 && (
              <span className="text-slate-300">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

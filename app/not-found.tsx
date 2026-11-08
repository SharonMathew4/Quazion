import React from "react";
import Link from "next/link";
import { BookOpen, Search, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50 font-sans">
      <div className="max-w-lg w-full academic-card p-8 sm:p-10 rounded-md bg-white border border-slate-300 shadow-sm text-center space-y-6">
        
        {/* Brand/Code icon */}
        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 font-mono text-sm font-bold shadow-2xs">
          404
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Archival Catalog Notice
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manuscript or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            The requested scientific paper, category handle, or researcher profile does not exist in the active catalog or may have been archived.
          </p>
        </div>

        {/* Quick Search Shortcut */}
        <form action="/search" method="GET" className="max-w-md mx-auto pt-1">
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded p-1.5 focus-within:border-slate-500 focus-within:bg-white shadow-2xs transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-2 mr-2" />
            <input
              type="text"
              name="q"
              placeholder="Search paper titles, DOIs, authors..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" className="text-xs h-7 px-3">
              Search
            </Button>
          </div>
        </form>

        {/* Popular Shortcuts */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Repository Home</span>
            </Button>
          </Link>
          <Link href="/publications">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Disciplines</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


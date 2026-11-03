import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { Calendar, Clock, RefreshCw, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PublicationHeaderProps {
  publication: Publication;
}

/**
 * PublicationHeader Component
 * Journal-grade header section displaying manuscript title, publication type,
 * category badge, publication date, updated date, and reading time.
 */
export function PublicationHeader({ publication }: PublicationHeaderProps) {
  return (
    <header className="space-y-6 border-b border-slate-800/80 pb-8">
      {/* Back Link */}
      <div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Open Archive</span>
        </Link>
      </div>

      {/* Badges & Reading Time */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={publication.category} />
          <Badge variant="outline" className="font-mono text-xs text-slate-300">
            {publication.publicationType}
          </Badge>
        </div>

        {publication.readingTimeMinutes && (
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {publication.readingTimeMinutes} min read
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
        {publication.title}
      </h1>

      {/* Author & Timestamps */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/contributors/${publication.author.username}`}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-mono font-bold text-sky-400 text-sm hover:border-sky-500 transition-colors"
          >
            {publication.author.displayName.charAt(0)}
          </Link>
          <div>
            <Link
              href={`/contributors/${publication.author.username}`}
              className="text-sm sm:text-base font-semibold text-slate-200 hover:text-sky-400 transition-colors"
            >
              {publication.author.displayName}
            </Link>
            <p className="text-xs text-slate-400 font-sans">
              {publication.author.affiliation || "Independent Researcher"}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Published: {publication.publishedAt || publication.createdAt}
          </span>

          {publication.updatedAt && (
            <span className="flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-4">
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              Updated: {publication.updatedAt}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

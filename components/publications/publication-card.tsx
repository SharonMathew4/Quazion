import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { Tag } from "./tag";
import { Eye, Heart, Download, Clock, ArrowUpRight } from "lucide-react";

interface PublicationCardProps {
  publication: Publication;
}

/**
 * PublicationCard Component
 * Refactored modular card for scientific repository listings.
 */
export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <article className="cosmic-card rounded-2xl p-5 md:p-6 flex flex-col justify-between group bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all">
      <div>
        {/* Header Badges: Category + Publication Type */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={publication.category} />
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {publication.publicationType}
            </span>
          </div>

          {publication.readingTimeMinutes && (
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              {publication.readingTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug mb-2">
          <Link
            href={`/publications/${publication.slug}`}
            className="flex items-start gap-1"
          >
            <span>{publication.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 text-sky-400" />
          </Link>
        </h3>

        {/* Abstract snippet */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 font-sans">
          {publication.abstract}
        </p>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {publication.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} label={tag} variant="subtle" />
          ))}
        </div>
      </div>

      {/* Footer metadata: Author + Stats */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
        <Link
          href={`/contributors/${publication.author.username}`}
          className="flex items-center gap-2 hover:text-slate-200 transition-colors group/author"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-sky-400 font-bold">
            {publication.author.displayName.charAt(0)}
          </div>
          <span className="font-medium text-slate-300 group-hover/author:text-sky-400">
            {publication.author.displayName}
          </span>
        </Link>

        {/* Community engagement counters */}
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            {publication.views}
          </span>
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="w-3.5 h-3.5 text-rose-500/70" />
            {publication.likes}
          </span>
          <span className="flex items-center gap-1" title="Downloads">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {publication.downloads}
          </span>
        </div>
      </div>
    </article>
  );
}

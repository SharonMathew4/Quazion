import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { ArrowUpRight, Clock } from "lucide-react";

interface RelatedPublicationCardProps {
  publication: Publication;
}

/**
 * RelatedPublicationCard Component
 * Compact card for displaying related scientific manuscripts.
 */
export function RelatedPublicationCard({ publication }: RelatedPublicationCardProps) {
  return (
    <article className="cosmic-card p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all group flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={publication.category} clickable={false} />
          {publication.readingTimeMinutes && (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {publication.readingTimeMinutes} min
            </span>
          )}
        </div>

        <h3 className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
          <Link href={`/publications/${publication.slug}`} className="flex items-start gap-1">
            <span>{publication.title}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 text-sky-400" />
          </Link>
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
          {publication.abstract}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="text-slate-400">By {publication.author.displayName}</span>
        <span className="text-slate-500">{publication.publishedAt || publication.createdAt}</span>
      </div>
    </article>
  );
}

import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { InlineMathText } from "./math-renderer";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RelatedPublicationCardProps {
  publication: Publication;
}

/**
 * RelatedPublicationCard Component
 * Compact academic paper card for related manuscript recommendations.
 */
export function RelatedPublicationCard({ publication }: RelatedPublicationCardProps) {
  const formattedDate = formatDate(publication.publishedAt || publication.createdAt);

  return (
    <article className="academic-card p-4 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all group flex flex-col justify-between space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={publication.category} clickable={false} />
          {publication.readingTimeMinutes && (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {publication.readingTimeMinutes} min
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2 leading-snug">
          <Link href={`/publications/${publication.slug}`} className="flex items-start gap-1">
            <span>
              <InlineMathText text={publication.title} />
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 text-rose-700" />
          </Link>
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
          <InlineMathText text={publication.abstract} />
        </p>
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
        <span className="font-medium text-slate-700">By {publication.author.displayName}</span>
        <span className="font-mono">{formattedDate}</span>
      </div>
    </article>
  );
}

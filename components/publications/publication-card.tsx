import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { Tag } from "./tag";
import { InlineMathText } from "./math-renderer";
import { Eye, Heart, Download, Clock, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PublicationCardProps {
  publication: Publication;
}

/**
 * PublicationCard Component
 * Journal-grade card for scientific papers, preprints, and review articles.
 */
export function PublicationCard({ publication }: PublicationCardProps) {
  const isEndorsed = (publication.endorsementsCount || 0) > 0;
  const formattedDate = formatDate(publication.publishedAt || publication.createdAt);

  return (
    <article className="academic-card p-6 flex flex-col justify-between group bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all rounded-md">
      <div>
        {/* Header Badges: Category + Article Type + Review Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={publication.category} />
            {publication.sourceName === "arXiv.org" || publication.isExternal ? (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                arXiv.org
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                Quazion Original
              </span>
            )}
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
              {publication.publicationType}
            </span>
            {publication.version && publication.version > 1 && (
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200">
                v{publication.version}
              </span>
            )}
            {isEndorsed && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Peer Endorsed</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-sans">
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Open Access</span>
            </span>
            {publication.readingTimeMinutes && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {publication.readingTimeMinutes} min
              </span>
            )}
          </div>
        </div>

        {/* Paper Title */}
        <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2 leading-snug mb-2">
          <Link
            href={`/publications/${publication.slug}`}
            className="flex items-start gap-1"
          >
            <span>
              <InlineMathText text={publication.title} />
            </span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 text-rose-700" />
          </Link>
        </h3>

        {/* Abstract Snippet */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 font-sans">
          <InlineMathText text={publication.abstract} />
        </p>

        {/* Academic Keywords (No social hashtags) */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
              Keywords:
            </span>
            {publication.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} label={tag} variant="subtle" />
            ))}
          </div>
        )}
      </div>

      {/* Footer Metadata: Author + Publication Date & Telemetry */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-sans">
        <Link
          href={`/contributors/${publication.author.username}`}
          className="flex items-center gap-2 hover:text-rose-700 transition-colors group/author"
        >
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">
            {(publication.author?.displayName || publication.author?.username || "R").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-800 group-hover/author:text-rose-700">
            {publication.author?.displayName || publication.author?.username || "Researcher"}
          </span>
          {publication.author.affiliation && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              • {publication.author.affiliation}
            </span>
          )}
        </Link>

        {/* Scholarly metrics */}
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
          <span title="Published Date" className="text-slate-500 hidden md:inline">
            {formattedDate}
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {publication.views}
          </span>
          <span className="flex items-center gap-1" title="Endorsements">
            <Heart className="w-3.5 h-3.5 text-rose-600/70" />
            {publication.likes}
          </span>
          <span className="flex items-center gap-1" title="Downloads">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            {publication.downloads}
          </span>
        </div>
      </div>
    </article>
  );
}

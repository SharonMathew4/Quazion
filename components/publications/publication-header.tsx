import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { Calendar, Clock, RefreshCw, ArrowLeft, CheckCircle2, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PublicationHeaderProps {
  publication: Publication;
}

/**
 * PublicationHeader Component
 * Journal-grade header section displaying manuscript title, publication type,
 * category badge, publication date, updated date, version, and endorsement badges.
 */
export function PublicationHeader({ publication }: PublicationHeaderProps) {
  const version = publication.version || 1;
  const isEndorsed = (publication.endorsementsCount || 0) > 0;

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

          {/* Version badge */}
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 flex items-center gap-1">
            <History className="w-3 h-3 text-sky-400" />
            v{version}
          </span>

          {/* Peer Endorsement Badge */}
          {isEndorsed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Peer Endorsed ({publication.endorsementsCount})</span>
            </Badge>
          )}
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

      {/* Changelog banner if revised */}
      {publication.changelogNotes && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
          <span className="text-sky-400 font-semibold uppercase tracking-wider shrink-0">v{version} Notes:</span>
          <span>{publication.changelogNotes}</span>
        </div>
      )}

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
            Published: {formatDate(publication.publishedAt || publication.createdAt)}
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

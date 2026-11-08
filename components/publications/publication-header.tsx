import React from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { CategoryBadge } from "./category-badge";
import { Calendar, Clock, RefreshCw, ArrowLeft, CheckCircle2, History, ShieldCheck, Download, Share2, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface PublicationHeaderProps {
  publication: Publication;
}

/**
 * PublicationHeader Component
 * Science.org-inspired academic manuscript header with citation strip,
 * serif title, ORCID author byline, and institutional action tools.
 */
export function PublicationHeader({ publication }: PublicationHeaderProps) {
  const version = publication.version || 1;
  const isEndorsed = (publication.endorsementsCount || 0) > 0;
  const doi = `10.5281/quazion.${publication.id}`;
  const pubDate = formatDate(publication.publishedAt || publication.createdAt);

  return (
    <header className="space-y-5 border-b border-slate-200 pb-8 font-sans">
      {/* ──────────────── Breadcrumb & Navigation ──────────────── */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-sans">
        <Link
          href="/publications"
          className="hover:text-rose-700 transition-colors inline-flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Research Articles</span>
        </Link>
        <span>/</span>
        <Link
          href={`/explore?category=${encodeURIComponent(publication.category.slug)}`}
          className="hover:text-rose-700 transition-colors"
        >
          {publication.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-xs sm:max-w-md">
          {publication.title}
        </span>
      </nav>

      {/* ──────────────── Institutional Citation Ribbon ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm">
            {publication.publicationType}
          </span>
          <CategoryBadge category={publication.category} clickable={false} />
          
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Open Access (CC BY 4.0)</span>
          </span>

          {version > 1 && (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200 flex items-center gap-1">
              <History className="w-3 h-3 text-slate-500" />
              <span>Version {version}</span>
            </span>
          )}

          {isEndorsed && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Peer Endorsed ({publication.endorsementsCount})</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>DOI: <strong className="text-slate-700 select-all font-semibold">{doi}</strong></span>
          {publication.readingTimeMinutes && (
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {publication.readingTimeMinutes} min read
            </span>
          )}
        </div>
      </div>

      {/* ──────────────── Main Manuscript Title ──────────────── */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.18]">
        {publication.title}
      </h1>

      {/* Revision notes if applicable */}
      {publication.changelogNotes && (
        <div className="p-3 rounded-sm bg-slate-50 border-l-3 border-slate-400 text-xs font-mono text-slate-700">
          <span className="font-bold text-slate-900 uppercase tracking-wider mr-2">Version {version} Revision Note:</span>
          <span>{publication.changelogNotes}</span>
        </div>
      )}

      {/* ──────────────── Authors Byline & Affiliations ──────────────── */}
      <div className="space-y-2 pt-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
          <span className="text-slate-500 font-serif italic text-base">By</span>
          <Link
            href={`/contributors/${publication.author.username}`}
            className="font-bold text-slate-900 hover:text-rose-700 transition-colors inline-flex items-center gap-1"
          >
            <span>{publication.author.displayName}</span>
            {publication.author.orcid && (
              <span
                className="w-3.5 h-3.5 rounded-full bg-[#a6ce39] text-white flex items-center justify-center text-[9px] font-bold"
                title={`ORCID: ${publication.author.orcid}`}
              >
                iD
              </span>
            )}
            <sup className="text-xs text-slate-500 font-sans">1</sup>
          </Link>
          {publication.author.role && (
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs border border-slate-200">
              {publication.author.role}
            </span>
          )}
        </div>

        {/* Institutional Affiliation Line */}
        <p className="text-xs text-slate-500 font-sans">
          <sup className="text-slate-400 font-mono">1</sup> {publication.author.affiliation || "Independent Researcher"}
        </p>

        {/* Publication Metadata Dates */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Published: <strong className="text-slate-700 font-medium">{pubDate}</strong>
          </span>
          {publication.updatedAt && (
            <span className="flex items-center gap-1 border-l border-slate-200 pl-4">
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              Latest Proof: {publication.updatedAt}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

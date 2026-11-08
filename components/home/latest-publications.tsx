import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Eye, Heart, Download, FileText } from "lucide-react";
import { Publication } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface LatestPublicationsProps {
  publications: Publication[];
}

/**
 * Latest Publications Section — Section 7
 * Live feed showcase of recently published research works across the repository.
 */
export function LatestPublications({ publications }: LatestPublicationsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-1">
            <FileText className="w-3.5 h-3.5 text-rose-700" />
            <span>Recent Additions</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Latest Archive Publications
          </h2>
        </div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold text-rose-700 hover:text-rose-800 group transition-colors"
        >
          <span>Browse full repository</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {publications.length > 0 ? (
        <div className="space-y-4">
          {publications.map((pub) => (
            <article
              key={pub.id}
              className="academic-card p-5 rounded bg-white border border-slate-200 shadow-2xs hover:border-slate-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                  <Badge variant="accent">{pub.category.name}</Badge>
                  <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {pub.publicationType}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(pub.publishedAt || pub.createdAt)}
                  </span>
                  {pub.readingTimeMinutes && (
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {pub.readingTimeMinutes} min
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  <Link href={`/publications/${pub.slug}`}>
                    {pub.title}
                  </Link>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans">
                  {pub.abstract}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-sans">
                  <span className="text-slate-900 font-semibold">
                    By {pub.author.displayName}
                  </span>
                  {pub.author.affiliation && (
                    <span className="text-slate-500 border-l border-slate-200 pl-3 hidden sm:inline">
                      {pub.author.affiliation}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0 gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1" title="Views">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {pub.views}
                  </span>
                  <span className="flex items-center gap-1" title="Likes">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    {pub.likes}
                  </span>
                  <span className="flex items-center gap-1" title="Downloads">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    {pub.downloads}
                  </span>
                </div>

                <Link
                  href={`/publications/${pub.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold font-mono uppercase text-rose-700 hover:text-rose-800 transition-colors"
                >
                  <span>Read paper</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="academic-card rounded p-10 text-center border border-dashed border-slate-200 bg-white shadow-2xs">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-serif text-sm font-semibold text-slate-900">No archive additions yet</h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            New research publications will appear in this real-time stream as they are submitted and published.
          </p>
        </div>
      )}
    </section>
  );
}

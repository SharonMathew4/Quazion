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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Recent Additions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Latest Archive Publications
          </h2>
        </div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 font-medium group transition-colors"
        >
          <span>Browse full repository</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {publications.length > 0 ? (
        <div className="space-y-4">
          {publications.map((pub) => (
            <article
              key={pub.id}
              className="cosmic-card p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <Badge variant="accent">{pub.category.name}</Badge>
                  <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {pub.publicationType}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatDate(pub.publishedAt || pub.createdAt)}
                  </span>
                  {pub.readingTimeMinutes && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {pub.readingTimeMinutes} min
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                  <Link href={`/publications/${pub.slug}`}>
                    {pub.title}
                  </Link>
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {pub.abstract}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="text-slate-300 font-medium">
                    By {pub.author.displayName}
                  </span>
                  {pub.author.affiliation && (
                    <span className="text-slate-500 border-l border-slate-800 pl-3 hidden sm:inline">
                      {pub.author.affiliation}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 shrink-0 gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1" title="Views">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {pub.views}
                  </span>
                  <span className="flex items-center gap-1" title="Likes">
                    <Heart className="w-3.5 h-3.5 text-rose-500/70" />
                    {pub.likes}
                  </span>
                  <span className="flex items-center gap-1" title="Downloads">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    {pub.downloads}
                  </span>
                </div>

                <Link
                  href={`/publications/${pub.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Read paper</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-2xl p-10 text-center border border-dashed border-slate-800">
          <FileText className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No archive additions yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            New research publications will appear in this real-time stream as they are submitted and published.
          </p>
        </div>
      )}
    </section>
  );
}

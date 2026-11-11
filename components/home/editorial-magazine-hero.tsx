"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { 
  ArrowRight, 
  Clock, 
  Heart, 
  Eye, 
  BookOpen,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/publications/category-badge";
import { QuickReadModal } from "@/components/publications/quick-read-modal";
import { InlineMathText } from "@/components/publications/math-renderer";
import { formatDate } from "@/lib/utils";

interface EditorialMagazineHeroProps {
  leadPublication?: Publication | null;
  sidePublications?: Publication[];
}

/**
 * EditorialMagazineHero Component
 * Science.org-inspired editorial lead story grid presenting primary research articles and dispatches.
 */
export function EditorialMagazineHero({
  leadPublication,
  sidePublications = [],
}: EditorialMagazineHeroProps) {
  const [activeModalPub, setActiveModalPub] = useState<Publication | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!leadPublication) return null;

  const leadDate = formatDate(leadPublication.publishedAt || leadPublication.createdAt);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-2 pb-8 font-sans">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Research Highlights &amp; Editorial Cover
            </h2>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500 hidden sm:inline">
              Curated peer-reviewed breakthroughs from recent issues
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Open Peer Review
            </span>
            <Link
              href="/publications"
              className="text-rose-700 hover:text-rose-900 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Explore Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Magazine Feature Grid (Science.org Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Lead Story (7 Columns) */}
          <article className="lg:col-span-7 flex flex-col justify-between academic-card bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 hover:shadow-md transition-all group">
            {/* Visual Cover Header */}
            <div className="relative h-64 sm:h-76 w-full overflow-hidden bg-slate-100 border-b border-slate-200">
              {leadPublication.coverImage && (
                <img
                  src={leadPublication.coverImage}
                  alt={leadPublication.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              )}

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-sm bg-rose-700 text-white font-sans text-[10px] font-bold tracking-wider uppercase shadow-xs">
                  Cover Story
                </span>
                {leadPublication.sourceName === "arXiv.org" || leadPublication.isExternal ? (
                  <span className="px-2 py-0.5 rounded-sm bg-slate-900/90 text-white font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                    arXiv.org
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-sm bg-blue-700 text-white font-sans text-[10px] font-bold tracking-wider uppercase shadow-xs">
                    Quazion Original
                  </span>
                )}
                <CategoryBadge category={leadPublication.category} clickable={false} />
                <span className="px-2 py-0.5 rounded-sm bg-slate-900 text-white font-sans text-[10px] uppercase font-bold tracking-wider">
                  {leadPublication.publicationType}
                </span>
              </div>

              {/* Author & Read Time overlay on bottom edge */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-[10px]">
                    {leadPublication.author.displayName.charAt(0)}
                  </div>
                  <span className="font-semibold text-white">
                    {leadPublication.author.displayName}
                  </span>
                  {leadPublication.author.affiliation && (
                    <span className="text-slate-300 hidden sm:inline text-[11px]">
                      • {leadPublication.author.affiliation}
                    </span>
                  )}
                </div>

                {leadPublication.readingTimeMinutes && (
                  <span className="flex items-center gap-1 text-[11px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-200">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {leadPublication.readingTimeMinutes} min read
                  </span>
                )}
              </div>
            </div>

            {/* Editorial Lead Body */}
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-rose-700 transition-colors">
                  <Link href={`/publications/${leadPublication.slug}`}>
                    <InlineMathText text={leadPublication.title} />
                  </Link>
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-sans line-clamp-3">
                  <InlineMathText text={leadPublication.abstract} />
                </p>

                {/* Key scientific takeaway highlight */}
                <div className="p-3.5 rounded-sm bg-rose-50/70 border-l-3 border-rose-700 text-xs text-slate-800 italic leading-relaxed">
                  <strong>Abstract Finding:</strong>{" "}
                  <InlineMathText text={leadPublication.abstract} maxLength={180} />
                </div>
              </div>

              {/* Actions & Metrics Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Link href={`/publications/${leadPublication.slug}`}>
                    <Button variant="primary" size="sm" className="flex items-center gap-1.5 font-sans font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Manuscript</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalPub(leadPublication)}
                    className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Quick Abstract</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span title="Published">{leadDate}</span>
                  <span className="flex items-center gap-1" title="Views">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{leadPublication.views}</span>
                  </span>
                  <button
                    onClick={() => toggleLike(leadPublication.id)}
                    className={`flex items-center gap-1 hover:text-rose-700 transition-colors cursor-pointer ${
                      likes[leadPublication.id] ? "text-rose-700 font-bold" : ""
                    }`}
                    title="Peer Endorsement"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        likes[leadPublication.id] ? "fill-rose-600 text-rose-600" : "text-rose-600"
                      }`}
                    />
                    <span>{leadPublication.likes + (likes[leadPublication.id] ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Right Column: First Release & Curated Dispatches (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
                <span>First Release &amp; Research Dispatches</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Peer-Reviewed</span>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              {sidePublications.slice(0, 3).map((pub) => {
                const pubDate = formatDate(pub.publishedAt || pub.createdAt);
                return (
                  <article
                    key={pub.id}
                    className="academic-card p-4 sm:p-5 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between group space-y-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <CategoryBadge category={pub.category} clickable={false} />
                        <span className="text-[11px] font-mono text-slate-500">
                          {pubDate}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/publications/${pub.slug}`}>
                          <InlineMathText text={pub.title} />
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                        <InlineMathText text={pub.abstract} />
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium text-slate-800 text-[11px]">
                        By {pub.author.displayName}
                      </span>
                      <Link
                        href={`/publications/${pub.slug}`}
                        className="text-rose-700 hover:text-rose-900 font-semibold text-xs flex items-center gap-0.5"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Read Modal Dialog */}
      {activeModalPub && (
        <QuickReadModal
          publication={activeModalPub}
          isOpen={!!activeModalPub}
          onClose={() => setActiveModalPub(null)}
        />
      )}
    </>
  );
}

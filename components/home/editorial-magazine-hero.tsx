"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Heart, 
  Eye, 
  Flame, 
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickReadModal } from "@/components/publications/quick-read-modal";

interface EditorialMagazineHeroProps {
  leadPublication?: Publication | null;
  sidePublications?: Publication[];
}

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

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold uppercase tracking-wider">Lead Discoveries</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Curated high-impact scientific breakthroughs
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Weekly Issue Vol. 42
            </span>
            <Link
              href="/publications"
              className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 group font-medium"
            >
              <span>Explore Archive</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Magazine Feature Grid (Science.org Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Lead Story (Large Widescreen Card - 7 Columns) */}
          <article className="lg:col-span-7 flex flex-col justify-between cosmic-card rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition-all group relative">
            {/* Visual Cover Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              {leadPublication.coverImage && (
                <img
                  src={leadPublication.coverImage}
                  alt={leadPublication.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
              )}
              {/* Gradient Darkening for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-slate-950 font-mono text-[11px] font-bold tracking-wider flex items-center gap-1 shadow-lg">
                  <Flame className="w-3 h-3 fill-slate-950" />
                  COVER STORY
                </span>
                <span className="px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-500/30 text-sky-300 font-mono text-[11px] font-semibold backdrop-blur-md">
                  {leadPublication.category.name}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-slate-300 font-mono text-[11px] backdrop-blur-md">
                  {leadPublication.publicationType}
                </span>
              </div>

              {/* Author & Read Time overlay on bottom edge */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  {leadPublication.author.avatarUrl && (
                    <img
                      src={leadPublication.author.avatarUrl}
                      alt={leadPublication.author.displayName}
                      className="w-6 h-6 rounded-full object-cover border border-sky-400/50"
                    />
                  )}
                  <span className="font-medium text-slate-100">
                    {leadPublication.author.displayName}
                  </span>
                  {leadPublication.author.affiliation && (
                    <span className="text-slate-400 hidden sm:inline text-[11px]">
                      • {leadPublication.author.affiliation}
                    </span>
                  )}
                </div>

                {leadPublication.readingTimeMinutes && (
                  <span className="flex items-center gap-1 font-mono text-slate-300 text-[11px] bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-md">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {leadPublication.readingTimeMinutes} min read
                  </span>
                )}
              </div>
            </div>

            {/* Editorial Lead Body */}
            <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight group-hover:text-sky-300 transition-colors">
                  <Link href={`/publications/${leadPublication.slug}`}>
                    {leadPublication.title}
                  </Link>
                </h2>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {leadPublication.abstract}
                </p>

                {/* Key takeaway highlight */}
                <div className="p-3 rounded-xl bg-sky-950/20 border-l-2 border-sky-400 text-xs text-sky-200 italic">
                  💡 <strong>Lead Takeaway:</strong> {leadPublication.abstract.slice(0, 160)}...
                </div>
              </div>

              {/* Actions & Metrics Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <Link href={`/publications/${leadPublication.slug}`}>
                    <Button size="sm" className="flex items-center gap-1.5 font-sans">
                      <span>Read Full Research</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalPub(leadPublication)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-sky-400"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Quick Preview</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <button
                    onClick={() => toggleLike(leadPublication.id)}
                    className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                      likes[leadPublication.id] ? "text-rose-500 font-bold" : ""
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likes[leadPublication.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{leadPublication.likes + (likes[leadPublication.id] ? 1 : 0)}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{leadPublication.views}</span>
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Right Column: First Release & Editor's Picks (Stacked - 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>First Release &amp; Editor&apos;s Picks</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Fast-tracked studies</span>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              {sidePublications.slice(0, 2).map((pub) => {
                const isLiked = !!likes[pub.id];

                return (
                  <article
                    key={pub.id}
                    className="cosmic-card p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between group space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400">
                            {pub.category.name}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {pub.publicationType}
                          </span>
                        </div>
                        {pub.readingTimeMinutes && (
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pub.readingTimeMinutes}m
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/publications/${pub.slug}`}>
                          {pub.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 font-sans leading-relaxed">
                        {pub.abstract}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        {pub.author.avatarUrl && (
                          <img
                            src={pub.author.avatarUrl}
                            alt={pub.author.displayName}
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                        )}
                        <span className="text-slate-300 font-medium truncate max-w-[140px]">
                          {pub.author.displayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                        <button
                          onClick={() => toggleLike(pub.id)}
                          className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                            isLiked ? "text-rose-500" : ""
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                          <span>{pub.likes + (isLiked ? 1 : 0)}</span>
                        </button>

                        <button
                          onClick={() => setActiveModalPub(pub)}
                          className="text-sky-400 hover:text-sky-300 text-[11px] font-medium"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Read Modal */}
      <QuickReadModal
        publication={activeModalPub}
        isOpen={!!activeModalPub}
        onClose={() => setActiveModalPub(null)}
        onLikeToggle={toggleLike}
        isLiked={activeModalPub ? !!likes[activeModalPub.id] : false}
      />
    </>
  );
}

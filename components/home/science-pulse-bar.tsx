"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, BookOpen, Scale } from "lucide-react";
import { Publication } from "@/types";
import { InlineMathText } from "@/components/publications/math-renderer";

interface SciencePulseBarProps {
  publications?: Publication[];
}

/**
 * SciencePulseBar Component
 * Institutional Dispatch Ribbon displaying latest accepted research and open access mandates.
 */
export function SciencePulseBar({ publications = [] }: SciencePulseBarProps) {
  const tickerItems =
    publications.length > 0
      ? publications.slice(0, 5).map((p) => ({
          tag: p.category?.name?.toUpperCase() || "RESEARCH",
          title: p.title,
          href: `/publications/${p.slug}`,
        }))
      : [
          {
            tag: "OPEN ARCHIVE",
            title: "QUAZION Open Science Archive — Publishing peer-moderated research without friction",
            href: "/creator/publications/new",
          },
          {
            tag: "CALL FOR PAPERS",
            title: "Special Issue: High-Precision Observational Data & Relativistic Astrophysics",
            href: "/creator/publications/new",
          },
          {
            tag: "PEER REVIEW",
            title: "Double-blind, transparent scientific moderation for academic researchers worldwide",
            href: "/about#peer-review",
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  const activeItem = tickerItems[currentIndex] || tickerItems[0];

  return (
    <div className="w-full bg-slate-50/80 border-b border-slate-200/80 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 min-h-[36px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Institutional Dispatch Ticker */}
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-rose-700 text-white font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
            DISPATCH
          </span>

          <div className="flex items-center gap-2 truncate">
            <Link
              href={activeItem.href}
              className="text-slate-700 hover:text-rose-700 transition-colors truncate font-sans text-xs flex items-center gap-1.5 group font-medium"
            >
              <span className="text-[11px] font-mono text-slate-400 font-normal shrink-0">
                [{activeItem.tag}]
              </span>
              <span className="truncate">
                <InlineMathText text={activeItem.title} />
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-rose-700 transition-colors shrink-0" />
            </Link>
          </div>
        </div>

        {/* Scholarly Standards Trust Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-slate-500 font-sans text-[11px] shrink-0">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Access Mandate</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Double-Blind Review</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero APC Fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

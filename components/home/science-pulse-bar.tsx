"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, BookOpen, ArrowUpRight, Flame, Shield } from "lucide-react";
import { Publication } from "@/types";

interface SciencePulseBarProps {
  publications?: Publication[];
}

export function SciencePulseBar({ publications = [] }: SciencePulseBarProps) {
  const tickerItems = publications.length > 0
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
          tag: "CREATOR STUDIO",
          title: "Author, submit, and preserve scientific papers, datasets, and proofs",
          href: "/creator/publications/new",
        },
        {
          tag: "PEER MODERATION",
          title: "Transparent open-access digital publishing medium for global researchers",
          href: "/explore",
        },
      ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  const activeItem = tickerItems[currentIndex] || tickerItems[0];

  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Live Ticker */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[11px] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping inline-block" />
            <Radio className="w-3 h-3" />
            <span>PULSE</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-400 shrink-0">
              {activeItem.tag}
            </span>
            <Link
              href={activeItem.href}
              className="text-slate-300 hover:text-sky-300 transition-colors truncate font-sans text-xs flex items-center gap-1 group"
            >
              <span className="truncate">{activeItem.title}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
            </Link>
          </div>
        </div>

        {/* Live Network Indicators */}
        <div className="hidden lg:flex items-center gap-5 text-slate-400 font-mono text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span><strong className="text-slate-200">Open Access</strong> Repository</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong className="text-slate-200">100%</strong> Transparent Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span><strong className="text-slate-200">Zero</strong> Paywalls</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { FileText, Compass } from "lucide-react";
import { GlobalSearchBar } from "./global-search-bar";

/**
 * Editorial Masthead & Hero Component
 * Rebuilt as a dignified academic journal header with research inquiry tools.
 */
export function HeroSection() {
  const academicDisciplines = [
    { label: "Astrophysics", slug: "astrophysics" },
    { label: "Quantum Mechanics", slug: "quantum-mechanics" },
    { label: "Cosmology", slug: "cosmology" },
    { label: "Mathematics & Analysis", slug: "mathematics-analysis" },
    { label: "Theoretical Physics", slug: "theoretical-physics" },
  ];

  return (
    <section className="relative pt-8 sm:pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
      {/* Journal Identification Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-slate-200 bg-white text-slate-700 text-xs font-sans mb-4 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-800">
          Peer-Reviewed Open Science Archive &amp; Preprint Repository
        </span>
      </div>

      {/* Primary Scholarly Headline */}
      <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15] mb-4">
        Advancing Global Science Through <br className="hidden sm:inline" />
        <span className="text-rose-800">
          Open Inquiry &amp; Peer Review
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-sans">
        A premier digital publishing medium for peer-moderated research papers, observational astrophysical datasets, theoretical formulations, and mathematical proofs.
      </p>

      {/* Archival Research Inquiry Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <GlobalSearchBar />
      </div>

      {/* Discipline Navigation Directory */}
      <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-sans text-slate-600">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
          Browse Disciplines:
        </span>
        {academicDisciplines.map((d) => (
          <Link
            key={d.slug}
            href={`/explore?domain=${d.slug}`}
            className="px-2.5 py-1 rounded-sm bg-white border border-slate-200 hover:border-slate-400 hover:text-rose-800 text-slate-700 transition-colors font-medium shadow-2xs"
          >
            {d.label}
          </Link>
        ))}
        <Link
          href="/creator/publications/new"
          className="px-3 py-1 rounded-sm bg-rose-700 text-white hover:bg-rose-800 transition-colors font-semibold flex items-center gap-1.5 shadow-2xs ml-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Submit Manuscript</span>
        </Link>
      </div>
    </section>
  );
}

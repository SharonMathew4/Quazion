import React from "react";
import Link from "next/link";
import { Sparkles, FileText } from "lucide-react";
import { GlobalSearchBar } from "./global-search-bar";

/**
 * Editorial Masthead & Hero Component
 * Visual Identity Header with Brand & Tagline "Exploring Knowledge Beyond Boundaries"
 */
export function HeroSection() {
  return (
    <section className="relative pt-6 sm:pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
      {/* Subtle cosmic starlight backdrop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-sky-500/5 blur-[120px] -z-10 pointer-events-none rounded-full" />

      {/* Brand Tagline Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/40 text-sky-300 text-xs font-mono mb-4 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Open Scientific Knowledge &amp; Digital Publishing Medium</span>
      </div>

      {/* Primary Brand Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1] mb-3">
        Exploring Knowledge <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200">
          Beyond Boundaries
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6 font-sans">
        Discover peer-moderated papers, astrophysical observations, mathematical proofs, and theoretical essays across all domains.
      </p>

      {/* Global Search Bar UI */}
      <div className="max-w-2xl mx-auto mb-6">
        <GlobalSearchBar />
      </div>

      {/* Quick Action Badges */}
      <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-mono text-slate-400">
        <span className="text-slate-500">Popular domains:</span>
        <Link href="/explore?domain=astrophysics" className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition-colors">
          #Astrophysics
        </Link>
        <Link href="/explore?domain=quantum-mechanics" className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition-colors">
          #Quantum
        </Link>
        <Link href="/explore?domain=cosmology" className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition-colors">
          #Cosmology
        </Link>
        <Link href="/creator/publications/new" className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-colors font-semibold flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>Publish Paper</span>
        </Link>
      </div>
    </section>
  );
}

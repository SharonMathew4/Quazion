import React from "react";
import Link from "next/link";
import { Sparkles, Compass, FileText, ShieldCheck, Database, Award, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearchBar } from "./global-search-bar";

/**
 * Hero Section Component — Section 3
 * Visual Identity Header with Brand & Tagline "Exploring Knowledge Beyond Boundaries"
 */
export function HeroSection() {
  return (
    <section className="relative pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
      {/* Subtle cosmic starlight backdrop glow (minimal & elegant, avoiding excessive neon) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/5 blur-[140px] -z-10 pointer-events-none rounded-full" />

      {/* Brand Tagline Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/20 bg-sky-950/30 text-sky-300 text-xs font-mono mb-8 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Open Scientific Knowledge &amp; Digital Publishing Medium</span>
      </div>

      {/* Primary Brand Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-5xl mx-auto leading-[1.1] mb-6">
        Exploring Knowledge <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200">
          Beyond Boundaries
        </span>
      </h1>

      {/* Brand Subtitle / Description */}
      <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 font-sans">
        QUAZION is a transparent, open-access scientific archive. Discover peer-moderated papers,
        cosmological observational data, mathematical proofs, and theoretical essays without paywalls or academic friction.
      </p>

      {/* Global Search Bar UI */}
      <div className="mb-12">
        <GlobalSearchBar />
      </div>

      {/* Primary Call to Action Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
        <Link href="/explore">
          <Button variant="secondary" size="lg" className="flex items-center gap-2 px-6 py-3">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Explore Scientific Domains</span>
          </Button>
        </Link>
        <Link href="/creator/publications/new">
          <Button variant="outline" size="lg" className="flex items-center gap-2 px-6 py-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Submit Publication</span>
          </Button>
        </Link>
      </div>

      {/* Trust & Metric Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/60">
        <div className="p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <span className="block text-sm font-bold text-slate-200">100% Open Access</span>
          <span className="text-xs text-slate-500">Zero paywalls or fees</span>
        </div>
        <div className="p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <Database className="w-5 h-5 text-sky-400" />
          </div>
          <span className="block text-sm font-bold text-slate-200">6 Major Domains</span>
          <span className="text-xs text-slate-500">Astrophysics to Quantum</span>
        </div>
        <div className="p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <Award className="w-5 h-5 text-sky-400" />
          </div>
          <span className="block text-sm font-bold text-slate-200">Peer Moderated</span>
          <span className="text-xs text-slate-500">Community review rigor</span>
        </div>
        <div className="p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <Eye className="w-5 h-5 text-sky-400" />
          </div>
          <span className="block text-sm font-bold text-slate-200">Transparent</span>
          <span className="text-xs text-slate-500">Public metrics &amp; DOIs</span>
        </div>
      </div>
    </section>
  );
}

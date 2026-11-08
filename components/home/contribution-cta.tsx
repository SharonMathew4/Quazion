import React from "react";
import Link from "next/link";
import { ShieldCheck, FileCheck, Award, Binary, ArrowRight, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Contribution CTA Banner Component
 * Academic Call for Papers and Open Science submission invitation for researchers.
 */
export function ContributionCta() {
  const publishingPerks = [
    {
      title: "Universal Open Access",
      desc: "Free for readers and authors alike — zero paywalls and zero author processing charges (APC).",
      icon: ShieldCheck,
    },
    {
      title: "Double-Blind Peer Review",
      desc: "Methodological rigor verified by accredited domain specialists and post-publication inquiry.",
      icon: Award,
    },
    {
      title: "Native LaTeX & Equations",
      desc: "Typeset complex mathematical proofs, tensor fields, and formulas with print-grade KaTeX.",
      icon: Binary,
    },
    {
      title: "Permanent DOI Citation",
      desc: "Preserved with permanent Crossref digital handles, ORCID attribution, and BibTeX indexing.",
      icon: FileCheck,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6 font-sans">
      <div className="rounded-md border border-slate-300 bg-white p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-rose-200 bg-rose-50 text-rose-800 text-xs font-sans font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
            <span>Call for Papers • Peer-Moderated Submissions</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            Publish Your Research With Quazion Open Science
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            Scientific progress demands open, unencumbered dissemination. Whether you are reporting cosmological simulations, 
            investigating condensed matter phenomena, or publishing novel proofs, QUAZION provides a rigorous, 
            permanent medium to share your discoveries with the global scientific community.
          </p>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {publishingPerks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="p-5 rounded-md bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="p-2 rounded bg-white border border-slate-200 w-fit text-rose-700">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{perk.title}</h3>
                <p className="text-xs text-slate-600 leading-normal">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/creator/publications/new">
            <Button variant="primary" size="lg" className="flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4" />
              <span>Submit Manuscript for Review</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/about#guidelines">
            <Button variant="outline" size="lg" className="flex items-center gap-2 text-slate-700">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Author Guidelines &amp; Formatting</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

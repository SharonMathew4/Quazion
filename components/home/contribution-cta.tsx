import React from "react";
import Link from "next/link";
import { ShieldCheck, FileCheck, Award, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Contribution CTA Banner Section — Section 9
 * Open Archive Philosophy and Call-To-Action for researchers to publish on QUAZION.
 */
export function ContributionCta() {
  const publishingPerks = [
    {
      title: "Universal Open Access",
      desc: "Free for readers and authors alike — zero paywalls or publishing fees.",
      icon: ShieldCheck,
    },
    {
      title: "Peer-Moderated Quality",
      desc: "Community review and moderation ensures rigor and factual integrity.",
      icon: Award,
    },
    {
      title: "LaTeX & Equations Native",
      desc: "Built-in support for mathematical formulas, charts, and code snippets.",
      icon: Sparkles,
    },
    {
      title: "Immutable Digital Handle",
      desc: "Permanent record preservation with structured DOI metadata.",
      icon: FileCheck,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-[#090d15] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        {/* Subtle background gradient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-mono mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Science Publishing Medium</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-4 tracking-tight">
            Publish Your Research &amp; Observations Openly
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            QUAZION is built on the belief that scientific discovery belongs to humanity.
            Whether you are an astrophysicist reporting compact binary simulations, a theorist investigating spacetime metrics,
            or an educator explaining quantum state dynamics, QUAZION provides a transparent platform to publish and preserve your work.
          </p>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {publishingPerks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="p-2 rounded-lg bg-slate-900 w-fit text-sky-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">{perk.title}</h3>
                <p className="text-xs text-slate-400 leading-normal">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/creator/publications/new">
            <Button variant="primary" size="lg" className="flex items-center gap-2 px-6 py-3">
              <span>Submit Your Publication</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="px-6 py-3">
              Read Editorial Guidelines
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

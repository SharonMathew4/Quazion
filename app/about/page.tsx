import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Globe, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About QUAZION — Open Scientific Knowledge & Publishing",
  description: "Learn about the mission, publishing philosophy, and open-access standards of QUAZION.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* 1. Header & Identity */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Identity &amp; Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
          About QUAZION
        </h1>
        <p className="text-lg text-slate-300 italic font-medium">
          &ldquo;Exploring Knowledge Beyond Boundaries&rdquo;
        </p>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          QUAZION is an open scientific knowledge repository and digital publishing medium. 
          Our core objective is to dismantle paywalls and bureaucratic barriers to scientific dissemination, 
          empowering researchers, educators, and independent thinkers to publish and access knowledge freely.
        </p>
      </div>

      {/* 2. Core Pillars */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-400" />
          <span>Core Philosophies</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="cosmic-card p-5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-100 text-base">
              1. Universal Open Access
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every publication, observational note, and educational article hosted on QUAZION is free to read, reference, and download. No subscription fees, paywalls, or mandatory visitor accounts.
            </p>
          </div>

          <div className="cosmic-card p-5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-100 text-base">
              2. Scientific Authenticity
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We provide clear distinction between theoretical research papers, observational logs, reviews, and community educational essays, keeping presentation rigorous and trustworthy.
            </p>
          </div>

          <div className="cosmic-card p-5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-100 text-base">
              3. Contributor Ownership
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authors maintain full copyright and recognition for their work, with permanent timestamps, public profiles, and transparent engagement metrics.
            </p>
          </div>

          <div className="cosmic-card p-5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-100 text-base">
              4. Zero Commercialization of Science
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              QUAZION is not a social media feed or ad-driven platform. The architecture is engineered around long-form readability, mathematical formulas, and scientific discovery.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Publication Distinction & Moderation */}
      <section id="moderation" className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Scale className="w-5 h-5 text-sky-400" />
          <span>Publishing &amp; Moderation Model</span>
        </h2>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Important Scientific Notice</span>
          </div>
          <p>
            QUAZION distinguishes clearly between community open publishing and formal institutional peer review. Hosting a manuscript on QUAZION means the work has fulfilled our platform formatting and community standards.
          </p>
          <p>
            Publications are categorized strictly by intent:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
            <li><strong>Research Paper:</strong> Original theoretical derivations, mathematical models, or empirical findings.</li>
            <li><strong>Observation Report:</strong> Telescopic, astronomical, or experimental laboratory data logs.</li>
            <li><strong>Review Article:</strong> Comprehensive literature surveys summarizing current paradigms.</li>
            <li><strong>Educational Article &amp; Tutorial:</strong> Accessible pedagogical breakdowns explaining core concepts.</li>
            <li><strong>Scientific Note &amp; Commentary:</strong> Concise insights, hypotheses, or critical commentary.</li>
          </ul>
        </div>
      </section>

      {/* 4. Call to Action */}
      <div className="cosmic-card rounded-2xl p-8 text-center space-y-4 border-slate-700/60">
        <h3 className="text-xl font-bold text-slate-100">
          Ready to share your scientific insights?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Sign in to the Creator Studio to begin authoring and publishing your research today.
        </p>
        <div className="pt-2">
          <Link href="/auth/login">
            <Button variant="primary" size="md" className="gap-2">
              <span>Open Creator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}

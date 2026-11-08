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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* 1. Header & Identity */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5 text-rose-700" />
          <span>Institutional Mission &amp; Editorial Charter</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          About QUAZION
        </h1>
        <p className="font-serif text-lg text-slate-700 italic font-medium">
          &ldquo;Exploring Knowledge Beyond Boundaries&rdquo;
        </p>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
          QUAZION is a peer-moderated open science archive and academic publishing medium. 
          Our core objective is to dismantle commercial paywalls and bureaucratic friction in scientific dissemination, 
          empowering university faculties, independent researchers, and scholarly institutions to publish and read peer-reviewed knowledge freely under Creative Commons.
        </p>
      </div>

      {/* 2. Core Pillars */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-rose-700" />
          <span>Scholarly Principles</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base">
              1. Universal Open Access
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Every manuscript, observational log, and pedagogical paper on QUAZION is free to read, cite, and download as standard PDF under the CC BY 4.0 license. Zero subscription paywalls, zero author-processing charges (APCs).
            </p>
          </div>

          <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base">
              2. Academic Authenticity &amp; ORCID
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              We enforce verified researcher identities via official ORCID OAuth 2.0 integration, guaranteeing transparent author attribution, institutional affiliations, and permanent bibliographic records.
            </p>
          </div>

          <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base">
              3. Contributor Intellectual Ownership
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Authors retain complete intellectual copyright over their manuscripts, supported by digital object identifiers (DOIs), versioned changelogs, and immutable cryptographic timestamps.
            </p>
          </div>

          <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base">
              4. Non-Commercial Academic Integrity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              QUAZION rejects sensational algorithmic feeds and third-party advertising. The platform adheres strictly to COPE (Committee on Publication Ethics) principles and scholarly typography standards.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Publication Distinction & Moderation */}
      <section id="moderation" className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
          <Scale className="w-5 h-5 text-rose-700" />
          <span>Publishing &amp; Moderation Standards</span>
        </h2>

        <div className="p-6 rounded bg-slate-50 border border-slate-200 space-y-4 text-sm text-slate-800 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Ethical Publication Compliance</span>
          </div>
          <p className="text-xs font-sans text-slate-700 leading-relaxed">
            QUAZION distinguishes clearly between community open publishing and formal institutional peer review. Hosting a manuscript on QUAZION means the work has fulfilled our platform formatting and community standards.
          </p>
          <p className="text-xs font-sans font-semibold text-slate-900">
            Manuscript categories include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 font-sans">
            <li><strong className="text-slate-900 font-semibold font-mono">Research Paper:</strong> Original theoretical derivations, mathematical models, or empirical findings.</li>
            <li><strong className="text-slate-900 font-semibold font-mono">Observation Report:</strong> Telescopic, astronomical, or experimental laboratory data logs.</li>
            <li><strong className="text-slate-900 font-semibold font-mono">Review Article:</strong> Comprehensive literature surveys summarizing current paradigms.</li>
            <li><strong className="text-slate-900 font-semibold font-mono">Educational Article &amp; Tutorial:</strong> Accessible pedagogical breakdowns explaining core concepts.</li>
            <li><strong className="text-slate-900 font-semibold font-mono">Scientific Note &amp; Commentary:</strong> Concise insights, hypotheses, or critical commentary.</li>
          </ul>
        </div>
      </section>

      {/* 4. Call to Action */}
      <div className="academic-card rounded bg-white p-8 text-center space-y-4 border border-slate-200 shadow-2xs">
        <h3 className="font-serif text-xl font-bold text-slate-900">
          Ready to submit your scientific manuscript?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-sans">
          Sign in via institutional credentials or ORCID iD to begin authoring and submitting your research to the archive.
        </p>
        <div className="pt-2">
          <Link href="/creator/publications/new">
            <Button variant="primary" size="md" className="gap-2 font-semibold">
              <span>Submit Manuscript</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}

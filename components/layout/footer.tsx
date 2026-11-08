import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/logo.png";
import { ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-700 mt-auto font-sans">
      {/* ──────────────── Main Colophon Grid ──────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand and Academic Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-white border border-slate-300 p-1 group-hover:border-rose-600 transition-colors">
                <Image
                  src={logoImg}
                  alt="QUAZION Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-tight text-slate-900 group-hover:text-rose-700 transition-colors">
                  QUAZION
                </span>
                <span className="text-[9px] uppercase tracking-wider text-rose-800 font-semibold -mt-0.5">
                  Open Science Archive &amp; Journal
                </span>
              </div>
            </Link>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed max-w-sm">
              <p>
                <strong>Open Science Archive</strong> • An open-access scholarly repository dedicated to peer-moderated dissemination of physical sciences, observational astronomy, computational biology, and empirical inquiries.
              </p>
              <p className="text-slate-500">
                All research papers published on Quazion are freely accessible under the Creative Commons Attribution 4.0 International License (CC BY 4.0).
              </p>
            </div>

            {/* Academic Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>COPE Aligned</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#82a818]" />
                <span>ORCID Member</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium font-mono text-[11px]">
                DOI: 10.1126/quazion
              </span>
            </div>
          </div>

          {/* Navigation Column 1: Research Articles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-200 pb-1.5">
              Journal Content
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/publications" className="hover:text-rose-700 transition-colors">
                  Current Issue &amp; Articles
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-rose-700 transition-colors">
                  Subject Categories
                </Link>
              </li>
              <li>
                <Link href="/publications?type=PREPRINT" className="hover:text-rose-700 transition-colors">
                  Fast-Track Preprints
                </Link>
              </li>
              <li>
                <Link href="/publications?type=REVIEW" className="hover:text-rose-700 transition-colors">
                  Scientific Reviews
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-rose-700 transition-colors">
                  Archival Index &amp; DOIs
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Authors & Reviewers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-200 pb-1.5">
              Authors &amp; Reviewers
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/creator/publications/new" className="hover:text-rose-700 transition-colors font-medium text-rose-800">
                  Submit a Manuscript
                </Link>
              </li>
              <li>
                <Link href="/about#guidelines" className="hover:text-rose-700 transition-colors">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link href="/about#peer-review" className="hover:text-rose-700 transition-colors">
                  Peer Review Process
                </Link>
              </li>
              <li>
                <Link href="/contributors" className="hover:text-rose-700 transition-colors">
                  Editorial Board
                </Link>
              </li>
              <li>
                <Link href="/about#apc" className="hover:text-rose-700 transition-colors">
                  Zero APC Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Institutional Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-200 pb-1.5">
              Ethics &amp; Policy
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/about#ethics" className="hover:text-rose-700 transition-colors">
                  Publication Ethics
                </Link>
              </li>
              <li>
                <Link href="/about#data-policy" className="hover:text-rose-700 transition-colors">
                  Open Data Mandate
                </Link>
              </li>
              <li>
                <Link href="/about#preservation" className="hover:text-rose-700 transition-colors">
                  Digital Archiving
                </Link>
              </li>
              <li>
                <Link href="/about#retractions" className="hover:text-rose-700 transition-colors">
                  Corrections &amp; Retractions
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-rose-700 transition-colors"
                >
                  <span>Open Infrastructure</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ──────────────── Bottom Legal & Institutional Line ──────────────── */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QUAZION Open Science Archive. CC BY 4.0 International License.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-800 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-slate-800 transition-colors">
              Terms of Service
            </Link>
            <Link href="/about#institutions" className="hover:text-slate-800 transition-colors">
              University Subscriptions
            </Link>
            <span className="font-mono text-[11px] text-slate-400">Release 4.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

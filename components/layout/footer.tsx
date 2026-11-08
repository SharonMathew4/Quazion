import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#06080d] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand and Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 p-0.5 group-hover:border-sky-500/50 transition-colors">
                <Image
                  src="/icon.svg"
                  alt="QUAZION Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-base tracking-widest text-slate-100 font-mono group-hover:text-sky-300 transition-colors">
                QUAZION
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed italic">
              &ldquo;Exploring Knowledge Beyond Boundaries&rdquo;
            </p>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              An open, public scientific knowledge repository and publishing medium.
              Dedicated to unconstrained dissemination of research, observational data,
              educational science essays, and community inquiry.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Repository
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/explore" className="hover:text-sky-400 transition-colors">
                  Explore Topics
                </Link>
              </li>
              <li>
                <Link href="/publications" className="hover:text-sky-400 transition-colors">
                  All Publications
                </Link>
              </li>
              <li>
                <Link href="/contributors" className="hover:text-sky-400 transition-colors">
                  Contributors
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-sky-400 transition-colors">
                  Archive Search
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Publishing
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/auth/login" className="hover:text-sky-400 transition-colors">
                  Creator Studio
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-400 transition-colors">
                  Publishing Workflow
                </Link>
              </li>
              <li>
                <Link href="/about#moderation" className="hover:text-sky-400 transition-colors">
                  Editorial Philosophy
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-sky-400 transition-colors"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QUAZION. Open Scientific Knowledge.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms &amp; Open Access
            </Link>
            <span>v0.1.0-alpha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

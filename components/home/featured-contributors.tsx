import React from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Profile } from "@/types";
import { ContributorCard } from "./contributor-card";

interface FeaturedContributorsProps {
  contributors: Profile[];
}

/**
 * Featured Contributors Section — Section 8
 * Highlights prominent researchers, scientists, and educators in the QUAZION network.
 */
export function FeaturedContributors({ contributors }: FeaturedContributorsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-rose-700" />
            <span>Community Scholars</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Featured Scientific Contributors
          </h2>
        </div>
        <Link
          href="/contributors"
          className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold text-rose-700 hover:text-rose-800 group transition-colors"
        >
          <span>View all contributors</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {contributors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.id} contributor={contributor} />
          ))}
        </div>
      ) : (
        <div className="academic-card rounded p-10 text-center border border-dashed border-slate-200 bg-white shadow-2xs">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-serif text-sm font-semibold text-slate-900">No community contributors yet</h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Registered researchers, reviewers, and scientific authors will be showcased here.
          </p>
        </div>
      )}
    </section>
  );
}

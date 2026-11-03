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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Community Scholars</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Featured Scientific Contributors
          </h2>
        </div>
        <Link
          href="/contributors"
          className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 font-medium group transition-colors"
        >
          <span>View all contributors</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {contributors.map((contributor) => (
          <ContributorCard key={contributor.id} contributor={contributor} />
        ))}
      </div>
    </section>
  );
}

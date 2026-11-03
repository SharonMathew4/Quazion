import React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Publication } from "@/types";
import { PublicationCard } from "@/components/publications/publication-card";

interface FeaturedPublicationsProps {
  publications: Publication[];
}

/**
 * Featured Publications Section — Section 6
 * Highlights top peer-moderated scientific research papers.
 */
export function FeaturedPublications({ publications }: FeaturedPublicationsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400/20" />
            <span>Curated Research</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Featured Scientific Papers
          </h2>
        </div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 font-medium group transition-colors"
        >
          <span>Explore all publications</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {publications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-2xl p-10 text-center border border-dashed border-slate-800">
          <Star className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No featured papers yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Curated papers will be highlighted here as the scientific archive grows.
          </p>
        </div>
      )}
    </section>
  );
}

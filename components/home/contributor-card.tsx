import React from "react";
import Link from "next/link";
import { Profile } from "@/types";
import { BookOpen, Eye, ShieldCheck, ExternalLink } from "lucide-react";

interface ContributorCardProps {
  contributor: Profile;
}

/**
 * Reusable Contributor Profile Card Component
 */
export function ContributorCard({ contributor }: ContributorCardProps) {
  return (
    <article className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs hover:border-slate-400 transition-all flex flex-col justify-between group font-sans">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-serif font-bold text-lg text-white">
              {contributor.displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base group-hover:text-rose-700 transition-colors">
                <Link href={`/contributors/${contributor.username}`}>
                  {contributor.displayName}
                </Link>
              </h3>
              <p className="text-xs text-slate-600 font-sans">
                {contributor.affiliation || "Independent Researcher"}
              </p>
            </div>
          </div>
        </div>

        {/* ORCID Identifier badge if present */}
        {contributor.orcid && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono mb-3 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>ORCID: {contributor.orcid}</span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6 font-sans">
          {contributor.bio || "Active contributor on the QUAZION open scientific repository."}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Publications">
            <BookOpen className="w-3.5 h-3.5 text-rose-700" />
            {contributor.totalPublications ?? 0} papers
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {contributor.totalViews ?? 0}
          </span>
        </div>

        <Link
          href={`/contributors/${contributor.username}`}
          className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 transition-colors font-sans font-semibold text-xs"
        >
          <span>View record</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );
}

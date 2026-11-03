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
    <article className="cosmic-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center font-mono font-bold text-lg text-sky-400 group-hover:border-sky-500/50 transition-colors">
              {contributor.displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base group-hover:text-sky-300 transition-colors">
                <Link href={`/contributors/${contributor.username}`}>
                  {contributor.displayName}
                </Link>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                {contributor.affiliation || "Independent Researcher"}
              </p>
            </div>
          </div>
        </div>

        {/* ORCID Identifier badge if present */}
        {contributor.orcid && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono mb-3">
            <ShieldCheck className="w-3 h-3" />
            <span>ORCID: {contributor.orcid}</span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-6 font-sans">
          {contributor.bio || "Active contributor on the QUAZION open scientific repository."}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1" title="Publications">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            {contributor.totalPublications ?? 0} papers
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            {contributor.totalViews ?? 0}
          </span>
        </div>

        <Link
          href={`/contributors/${contributor.username}`}
          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-sans font-medium"
        >
          <span>View profile</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );
}

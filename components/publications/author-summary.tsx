import React from "react";
import Link from "next/link";
import { Profile } from "@/types";
import { ShieldCheck, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuthorSummaryProps {
  author: Profile;
}

/**
 * AuthorSummary Component
 * Sidebar card presenting author credentials, affiliation, ORCID badge,
 * bio snippet, and total publication metrics.
 */
export function AuthorSummary({ author }: AuthorSummaryProps) {
  return (
    <div className="cosmic-card p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center font-mono font-bold text-lg text-sky-400">
          {author.displayName.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-base">
              <Link href={`/contributors/${author.username}`} className="hover:text-sky-300 transition-colors">
                {author.displayName}
              </Link>
            </h3>
            <Badge variant="accent" className="text-[10px] px-1.5 py-0">
              {author.role}
            </Badge>
          </div>
          <p className="text-xs text-sky-400 font-sans mt-0.5">
            {author.affiliation || "Independent Researcher"}
          </p>
        </div>
      </div>

      {author.orcid && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ORCID: {author.orcid}</span>
        </div>
      )}

      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans">
        {author.bio || "Scientific contributor publishing open research on QUAZION."}
      </p>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>{author.totalPublications ?? 1} publications</span>
        </span>

        <Link
          href={`/contributors/${author.username}`}
          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-sans font-medium transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Profile } from "@/types";
import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuthorSummaryProps {
  author: Profile;
}

/**
 * AuthorSummary Component
 * Academic faculty and principal investigator card for the manuscript sidebar.
 */
export function AuthorSummary({ author }: AuthorSummaryProps) {
  return (
    <div className="academic-card p-6 rounded-md bg-white border border-slate-200 space-y-4 font-sans shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-lg text-slate-800 shrink-0">
          {author.displayName.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              <Link
                href={`/contributors/${author.username}`}
                className="hover:text-rose-700 transition-colors"
              >
                {author.displayName}
              </Link>
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-xs border border-slate-200">
              {author.role}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            {author.affiliation || "Faculty / Scientific Researcher"}
          </p>
        </div>
      </div>

      {author.orcid && (
        <a
          href={`https://orcid.org/${author.orcid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono hover:border-slate-300 transition-colors"
        >
          <span className="w-3 h-3 rounded-full bg-[#a6ce39] text-white flex items-center justify-center text-[8px] font-bold">
            iD
          </span>
          <span>ORCID: {author.orcid}</span>
        </a>
      )}

      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-sans">
        {author.bio || "Active scientific researcher and contributor publishing open access literature on QUAZION."}
      </p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-sans">
        <span className="flex items-center gap-1.5 text-slate-600">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{author.totalPublications ?? 1} publications</span>
        </span>

        <Link
          href={`/contributors/${author.username}`}
          className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold transition-colors text-xs"
        >
          <span>Author Profile</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Publication } from "@/types";
import { ShieldCheck, Check, FileCode, Share2 } from "lucide-react";

interface PublicationMetaProps {
  publication: Publication;
}

/**
 * PublicationMeta Component
 * Metadata box providing digital citation handles (DOI), open access licensing,
 * BibTeX citation exporter, and manuscript sharing links.
 */
export function PublicationMeta({ publication }: PublicationMetaProps) {
  const [copied, setCopied] = useState(false);
  const doi = `10.5281/quazion.${publication.id}`;

  const bibtex = `@article{quazion_${publication.id.replace(/-/g, "_")},
  title = {${publication.title}},
  author = {${publication.author.displayName}},
  journal = {QUAZION Open Scientific Archive},
  year = {${new Date(publication.publishedAt || publication.createdAt).getFullYear()}},
  doi = {${doi}}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: publication.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard.");
    }
  };

  return (
    <div className="cosmic-card p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider">Universal Open Access (CC BY 4.0)</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-500">DOI:</span>
          <span className="text-sky-400 select-all">{doi}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300">
        <div>
          <span className="text-slate-500">Cite as: </span>
          <span className="text-slate-200">
            {publication.author.displayName} ({new Date(publication.publishedAt || publication.createdAt).getFullYear()}). &ldquo;{publication.title}&rdquo;. <em className="text-sky-300">QUAZION Open Archive</em>.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-sky-400" />}
            <span>{copied ? "Copied BibTeX" : "Copy BibTeX"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Share Article"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

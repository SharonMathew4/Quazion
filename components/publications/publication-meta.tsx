"use client";

import React, { useState } from "react";
import { Publication } from "@/types";
import { ShieldCheck, Check, FileCode, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicationMetaProps {
  publication: Publication;
}

/**
 * PublicationMeta Component
 * Scholarly citation box providing permanent DOI handles, Open Access licensing,
 * BibTeX citation exporter, and article sharing utilities.
 */
export function PublicationMeta({ publication }: PublicationMetaProps) {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const doi = `10.5281/quazion.${publication.id}`;
  const year = new Date(publication.publishedAt || publication.createdAt).getFullYear();

  const standardCitation = `${publication.author.displayName} (${year}). "${publication.title}". QUAZION Open Science Archive. https://doi.org/${doi}`;

  const bibtex = `@article{quazion_${publication.id.replace(/-/g, "_")},
  title = {${publication.title}},
  author = {${publication.author.displayName}},
  journal = {QUAZION Open Science Archive},
  year = {${year}},
  doi = {${doi}},
  url = {https://quazion.org/publications/${publication.slug}}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(standardCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: publication.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Manuscript link copied to clipboard.");
    }
  };

  return (
    <div className="academic-card p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-4 font-sans text-xs shadow-2xs">
      {/* Top Status & DOI Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Universal Open Access (CC BY 4.0 International)
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
          <span className="text-slate-400 font-sans">Permanent DOI:</span>
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-700 hover:underline font-semibold"
          >
            https://doi.org/{doi}
          </a>
        </div>
      </div>

      {/* Recommended Citation Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
        <div className="space-y-1">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block">
            How to Cite:
          </span>
          <p className="text-slate-800 text-xs leading-relaxed font-sans bg-slate-50 p-2.5 rounded border border-slate-200">
            {publication.author.displayName} ({year}). &ldquo;{publication.title}&rdquo;.{" "}
            <em className="text-slate-900 font-serif">QUAZION Open Science Archive</em>.{" "}
            <span className="font-mono text-slate-600 text-[11px]">doi:{doi}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 sm:self-end">
          <button
            type="button"
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer text-xs font-medium"
            title="Copy formatted citation"
          >
            {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedCitation ? "Copied" : "Copy Citation"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer text-xs font-medium"
            title="Export BibTeX citation record"
          >
            {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedBibtex ? "Copied BibTeX" : "Export BibTeX"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 transition-colors cursor-pointer"
            title="Share Manuscript Handle"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

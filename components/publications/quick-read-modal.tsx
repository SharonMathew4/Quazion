"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Publication } from "@/types";
import { 
  X, 
  ExternalLink, 
  Heart, 
  Bookmark, 
  Share2, 
  Clock, 
  BookOpen, 
  FileText,
  Check,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import { formatDate } from "@/lib/utils";

interface QuickReadModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: (pubId: string) => void;
  isLiked?: boolean;
}

/**
 * QuickReadModal Component
 * Academic abstract modal dialog for reviewing manuscript details without leaving the feed.
 */
export function QuickReadModal({
  publication,
  isOpen,
  onClose,
  onLikeToggle,
  isLiked = false,
}: QuickReadModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !publication) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/publications/${publication.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-300 rounded-md shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-700" />
            <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Research Abstract &amp; Metadata
            </span>
            <CategoryBadge category={publication.category} clickable={false} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
              {publication.publicationType}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-800">
          {/* Title */}
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {publication.title}
            </h2>

            {/* Author Byline */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                By {publication.author.displayName}
              </span>
              {publication.author.affiliation && (
                <span className="text-slate-500 border-l border-slate-200 pl-3">
                  {publication.author.affiliation}
                </span>
              )}
              <span className="text-slate-500 border-l border-slate-200 pl-3 font-mono">
                {formatDate(publication.publishedAt || publication.createdAt)}
              </span>
              {publication.readingTimeMinutes && (
                <span className="flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-3 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {publication.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>

          {/* Key Discovery Highlight Box */}
          <div className="p-4 rounded-sm bg-rose-50/70 border-l-3 border-rose-700 text-xs sm:text-sm leading-relaxed space-y-1 text-slate-800">
            <span className="font-bold text-rose-800 uppercase tracking-wider block text-[10px]">
              Principal Scientific Finding
            </span>
            <p className="italic text-slate-700">
              &ldquo;{publication.abstract.slice(0, 260)}...&rdquo;
            </p>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Abstract</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              {publication.abstract}
            </p>
          </div>

          {/* Academic Keywords */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                Keywords:
              </span>
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* References Preview */}
          {publication.references && publication.references.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Selected Citations ({publication.references.length})</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-600">
                {publication.references.slice(0, 3).map((ref) => (
                  <li key={ref.id} className="truncate">
                    • <strong className="text-slate-800">{ref.authors}</strong> ({ref.year || "n.d."}): {ref.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-t border-slate-200 bg-slate-50 gap-3">
          {/* Interaction buttons */}
          <div className="flex items-center gap-2 text-xs font-sans">
            <button
              onClick={() => onLikeToggle && onLikeToggle(publication.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all cursor-pointer ${
                isLiked
                  ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-600 text-rose-600" : "text-rose-600"}`} />
              <span>{isLiked ? "Endorsed" : "Endorse"} ({publication.likes + (isLiked ? 1 : 0)})</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all cursor-pointer ${
                saved
                  ? "bg-slate-900 border-slate-900 text-white font-medium"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
              <span>{saved ? "Saved" : "Save for Citation"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border bg-white border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer font-mono text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Copied" : "Copy DOI"}</span>
            </button>
          </div>

          {/* Full paper link */}
          <Link
            href={`/publications/${publication.slug}`}
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            <Button variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold">
              <FileText className="w-4 h-4" />
              <span>Read Full Manuscript</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

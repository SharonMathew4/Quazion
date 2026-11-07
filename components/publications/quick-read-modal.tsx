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
  Sparkles, 
  BookOpen, 
  FileText,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface QuickReadModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: (pubId: string) => void;
  isLiked?: boolean;
}

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col cosmic-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-mono text-xs text-sky-400 uppercase tracking-wider">
              Quick Research Preview
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-slate-700 text-slate-300">
              {publication.category.name}
            </Badge>
            <Badge variant="accent" className="text-[11px] font-mono">
              {publication.publicationType}
            </Badge>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-200">
          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
              {publication.title}
            </h2>

            {/* Author Byline */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                By {publication.author.displayName}
              </span>
              {publication.author.affiliation && (
                <span className="text-slate-400 border-l border-slate-800 pl-3">
                  {publication.author.affiliation}
                </span>
              )}
              <span className="text-slate-500 border-l border-slate-800 pl-3">
                {formatDate(publication.publishedAt || publication.createdAt)}
              </span>
              {publication.readingTimeMinutes && (
                <span className="flex items-center gap-1 text-slate-400 border-l border-slate-800 pl-3">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  {publication.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>

          {/* Cover Image if available */}
          {publication.coverImage && (
            <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={publication.coverImage}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          )}

          {/* Key Discovery Highlight Box */}
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 text-sky-200 text-xs sm:text-sm leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-sky-400 font-semibold">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Core Scientific Finding</span>
            </div>
            <p className="italic text-slate-300">
              &ldquo;{publication.abstract.slice(0, 240)}...&rdquo;
            </p>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Abstract</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {publication.abstract}
            </p>
          </div>

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* References Preview */}
          {publication.references && publication.references.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Selected Citations ({publication.references.length})</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {publication.references.slice(0, 3).map((ref) => (
                  <li key={ref.id} className="truncate">
                    • <strong className="text-slate-300">{ref.authors}</strong> ({ref.year || "n.d."}): {ref.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 gap-3">
          {/* Social interaction buttons */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => onLikeToggle && onLikeToggle(publication.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isLiked
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-rose-400"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{publication.likes + (isLiked ? 1 : 0)}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                saved
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-amber-400"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800/60 border-slate-700 text-slate-300 hover:text-sky-300 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Share DOI"}</span>
            </button>
          </div>

          {/* Full paper link */}
          <Link
            href={`/publications/${publication.slug}`}
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              <span>Read Full Manuscript</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

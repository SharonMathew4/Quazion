import React from "react";
import { Publication } from "@/types";
import { BookMarked, Sparkles } from "lucide-react";
import { Tag } from "./tag";

interface PublicationContentProps {
  publication: Publication;
}

/**
 * PublicationContent Component
 * Journal-grade scientific manuscript content renderer supporting:
 * - Dynamic manuscript content authored in Creator Studio
 * - Dynamic bibliographic references from database
 * - Demonstrative fallback for sample layout
 */
export function PublicationContent({ publication }: PublicationContentProps) {
  const hasDynamicContent = Boolean(publication.content && publication.content.trim().length > 0);
  const hasDynamicReferences = Boolean(publication.references && publication.references.length > 0);

  return (
    <article className="space-y-10 text-slate-200 leading-relaxed font-sans text-base sm:text-lg">
      {/* 1. Abstract Callout Box */}
      <section className="bg-slate-900/80 border-l-4 border-sky-400 p-6 sm:p-8 rounded-r-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Abstract</span>
        </div>
        <p className="text-base sm:text-lg text-slate-200 leading-relaxed italic font-serif">
          &ldquo;{publication.abstract}&rdquo;
        </p>

        {publication.keywords && publication.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-slate-500">Keywords:</span>
            {publication.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-slate-950 text-sky-300 px-2.5 py-0.5 rounded border border-slate-800"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 2. Main Article Body */}
      <div className="space-y-8 font-sans">
        {hasDynamicContent ? (
          <div className="space-y-6 font-sans">
            {publication.content!.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xl font-bold text-slate-100 mt-6 tracking-tight">
                    {trimmed.replace(/^###\s+/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight mt-8">
                    {trimmed.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={idx} className="text-3xl sm:text-4xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight mt-10">
                    {trimmed.replace(/^#\s+/, "")}
                  </h1>
                );
              }
              return (
                <p key={idx} className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ) : (
          /* Fallback Sample Layout for Visual Scaffolding */
          <>
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
                1. Introduction &amp; Theoretical Background
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                The study of relativistic compact binary mergers requires reconciling non-linear numerical relativity with precise interferometer observables. Intermediate-mass black holes (IMBHs) spanning the 100 to 100,000 solar mass range occupy a critical cosmological niche between stellar remnants and supermassive black hole kernels residing in galactic cores.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
                2. Mathematical Formalism
              </h2>
              <div className="my-6 p-6 rounded-2xl bg-[#090d15] border border-slate-800 text-center font-mono text-sky-300 text-lg sm:text-xl shadow-2xl space-y-2">
                <div className="tracking-widest">
                  R_s = \frac&#123;2 G M&#125;&#123;c^2&#125;
                </div>
                <span className="text-xs text-slate-500 font-mono block">
                  (Equation 1: Schwarzschild Metric Event Horizon Radius)
                </span>
              </div>
            </section>
          </>
        )}

        {/* Tags Row */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Subject Tags:</span>
              {publication.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        {/* References Bibliography Section */}
        <section className="bg-[#080d14] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-4 font-sans">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
            <BookMarked className="w-4 h-4 text-sky-400" />
            <span>References &amp; Bibliography</span>
          </div>

          {hasDynamicReferences ? (
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-400 space-y-3 leading-relaxed font-mono">
              {publication.references!.map((ref, idx) => (
                <li key={ref.id || idx}>
                  <span className="text-slate-300 font-medium">{ref.authors}</span>{" "}
                  {ref.year && <span>({ref.year}). </span>}
                  &ldquo;{ref.title}&rdquo;
                  {ref.source && <span className="text-slate-400"> — {ref.source}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 font-mono italic">
              No formal bibliographic citations listed for this document.
            </p>
          )}
        </section>

      </div>
    </article>
  );
}

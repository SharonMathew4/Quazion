import React from "react";
import { Publication } from "@/types";
import { BookMarked, Sparkles } from "lucide-react";
import { Tag } from "./tag";
import { MathRenderer } from "./math-renderer";

interface PublicationContentProps {
  publication: Publication;
}

const FALLBACK_SAMPLE_CONTENT = `## 1. Introduction & Theoretical Background

The study of relativistic compact binary mergers requires reconciling non-linear numerical relativity with precise interferometer observables. Intermediate-mass black holes (IMBHs) spanning the 100 to 100,000 solar mass range occupy a critical cosmological niche between stellar remnants and supermassive black hole kernels residing in galactic cores.

## 2. Mathematical Formalism

The metric describing an uncharged, non-rotating spherically symmetric spacetime in standard Schwarzschild coordinates is expressed as:

$$ds^2 = -\\left(1 - \\frac{2GM}{c^2 r}\\right) c^2 dt^2 + \\left(1 - \\frac{2GM}{c^2 r}\\right)^{-1} dr^2 + r^2 (d\\theta^2 + \\sin^2\\theta d\\phi^2)$$

The corresponding Schwarzschild event horizon radius $R_s$ is given by:

$$R_s = \\frac{2GM}{c^2}$$

Where $G$ represents the Newtonian gravitational constant, $M$ denotes the central gravitational mass, and $c$ designates the vacuum speed of light.

## 3. Observational Predictions

When integrating gravitational wave waveforms with orbital frequency $\\omega$, the quadrupole strain radiation is given by:

$$h_+(t) = \\frac{4G}{c^4 r} \\left(\\frac{d^2 Q_{ij}}{dt^2}\\right)$$

Observations in high-cadence gravitational wave detectors provide an unprecedented laboratory for testing strong-field general relativity against quantum corrections.`;

/**
 * PublicationContent Component
 * Journal-grade scientific manuscript content renderer supporting:
 * - Dynamic manuscript content with inline ($...$) and block ($$...$$) LaTeX formulas
 * - KaTeX mathematical proofs and theorems
 * - Dynamic bibliographic references from database
 */
export function PublicationContent({ publication }: PublicationContentProps) {
  const contentToRender =
    publication.content && publication.content.trim().length > 0
      ? publication.content
      : FALLBACK_SAMPLE_CONTENT;

  const hasDynamicReferences = Boolean(publication.references && publication.references.length > 0);

  return (
    <article className="space-y-10 text-slate-200 leading-relaxed font-sans text-base sm:text-lg">
      {/* 1. Abstract Callout Box */}
      <section className="bg-slate-900/80 border-l-4 border-sky-400 p-6 sm:p-8 rounded-r-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
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

      {/* 2. Main Article Body with KaTeX Scientific Markdown */}
      <MathRenderer content={contentToRender} />

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
                {ref.doi && (
                  <span className="text-sky-400 ml-1">
                    [DOI: {ref.doi}]
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500 font-mono italic">
            No formal bibliographic citations listed for this document.
          </p>
        )}
      </section>
    </article>
  );
}

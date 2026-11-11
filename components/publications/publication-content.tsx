import React from "react";
import { Publication } from "@/types";
import { BookMarked, FileText, Download, ExternalLink } from "lucide-react";
import { Tag } from "./tag";
import { MathRenderer, InlineMathText } from "./math-renderer";

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

## 3. Observational Predictions & Boundary Conditions

When integrating gravitational wave waveforms with orbital frequency $\\omega$, the quadrupole strain radiation is given by:

$$h_+(t) = \\frac{4G}{c^4 r} \\left(\\frac{d^2 Q_{ij}}{dt^2}\\right)$$

High-cadence observations provide an unprecedented laboratory for testing strong-field general relativity against quantum corrections and post-Newtonian expansions.`;

/**
 * PublicationContent Component
 * Science.org-grade scientific manuscript content renderer supporting:
 * - Structured abstract callout
 * - Dynamic manuscript content with inline and display LaTeX KaTeX formulas
 * - Indexed bibliographic references from peer review databases
 */
export function PublicationContent({ publication }: PublicationContentProps) {
  const contentToRender =
    publication.content && publication.content.trim().length > 0
      ? publication.content
      : FALLBACK_SAMPLE_CONTENT;

  const hasDynamicReferences = Boolean(publication.references && publication.references.length > 0);

  return (
    <article className="space-y-10 text-slate-800 leading-relaxed font-serif text-base sm:text-lg">
      {/* 1. Abstract Callout Box */}
      <section className="bg-slate-50 border-l-4 border-rose-700 p-6 sm:p-8 rounded-r-md space-y-3 border-y border-r border-slate-200 shadow-2xs font-sans">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-800">
          <FileText className="w-4 h-4 text-rose-700" />
          <span>Abstract</span>
        </div>
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed italic font-serif">
          &ldquo;<InlineMathText text={publication.abstract} />&rdquo;
        </p>

        {publication.keywords && publication.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 text-xs font-sans text-slate-600">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              Keywords:
            </span>
            {publication.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-white text-slate-800 px-2 py-0.5 rounded-sm border border-slate-200 font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 2. Official Manuscript Document / PDF Access Box */}
      {publication.documentUrl && (
        <section className="bg-white border border-slate-200 rounded-md p-5 shadow-xs font-sans space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-700" />
                  <span>Full Manuscript Document</span>
                </span>
                {publication.sourceName === "arXiv.org" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                    Verified arXiv Preprint
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Official peer/archive document available for direct reading and download.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={publication.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-rose-700 text-white hover:bg-rose-800 transition-colors text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open / Download PDF</span>
              </a>
              {publication.sourceUrl && (
                <a
                  href={publication.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors text-xs font-medium border border-slate-200"
                >
                  <span>{publication.sourceName || "Source Portal"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Article Body with KaTeX Scientific Markdown */}
      <MathRenderer content={contentToRender} />

      {/* Keywords / Tags Row */}
      {publication.tags && publication.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Subject Classifications:
            </span>
            {publication.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>
      )}

      {/* 3. References Bibliography Section */}
      <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-4 font-sans shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          <BookMarked className="w-4 h-4 text-rose-700" />
          <span>References &amp; Bibliographic Citations</span>
        </div>

        {hasDynamicReferences ? (
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed font-sans">
            {publication.references!.map((ref, idx) => (
              <li key={ref.id || idx} className="pl-1">
                <span className="text-slate-900 font-bold">{ref.authors}</span>{" "}
                {ref.year && <span>({ref.year}). </span>}
                &ldquo;<InlineMathText text={ref.title} />&rdquo;
                {ref.source && <span className="text-slate-600"> — {ref.source}</span>}
                {ref.doi && (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-700 hover:underline ml-1 font-mono text-xs"
                  >
                    [DOI: {ref.doi}]
                  </a>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500 font-sans italic">
            No formal bibliographic citations listed for this document.
          </p>
        )}
      </section>
    </article>
  );
}

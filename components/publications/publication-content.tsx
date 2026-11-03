import React from "react";
import { Publication } from "@/types";
import { BookMarked, Sparkles } from "lucide-react";
import { Tag } from "./tag";

interface PublicationContentProps {
  publication: Publication;
}

/**
 * PublicationContent Component
 * Journal-grade long-form scientific manuscript content renderer supporting:
 * - Headings (h1, h2, h3, h4)
 * - Structured Paragraphs
 * - Lists (ordered & unordered)
 * - Blockquotes
 * - Figures with Captions & Labels
 * - Responsive Data Tables
 * - Mathematical Equations (Display Math Blocks & Inline Math)
 * - References Bibliography Section
 */
export function PublicationContent({ publication }: PublicationContentProps) {
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

        {publication.keywords.length > 0 && (
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

      {/* 2. Main Long-Form Article Body */}
      <div className="space-y-8 font-sans">
        
        {/* Section 1: Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
            1. Introduction &amp; Theoretical Background
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            The study of relativistic compact binary mergers requires reconciling non-linear numerical relativity with precise interferometer observables. Intermediate-mass black holes (IMBHs) spanning the $10^2 - 10^5 \, M_\odot$ mass range occupy a critical cosmological niche between stellar remnants and supermassive black hole kernels residing in galactic cores.
          </p>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Prior observational surveys using ground-based interferometry have constrained stellar-mass black hole merger rates; however, capturing strain tensor perturbations $h_&#123;ij&#125;(t)$ across low-frequency horizons necessitates orbital space interferometry.
          </p>
        </section>

        {/* Section 2: Mathematical Formalism & Equations */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
            2. Mathematical Formalism &amp; Metric Perturbations
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            In a vacuum spacetime perturbed by linear gravitational radiation, the Einstein field equations simplify under the transverse-traceless (TT) gauge. The Schwarzschild metric boundary is characterized by the fundamental event horizon radius:
          </p>

          {/* Display Math Equation Block 1 */}
          <div className="my-6 p-6 rounded-2xl bg-[#090d15] border border-slate-800 text-center font-mono text-sky-300 text-lg sm:text-xl shadow-2xl space-y-2">
            <div className="tracking-widest">
              R_s = \frac&#123;2 G M&#125;&#123;c^2&#125; = 2.95 \times 10^3 \left( \frac&#123;M&#125;&#123;M_\odot&#125; \right) \, \text&#123;meters&#125;
            </div>
            <span className="text-xs text-slate-500 font-mono block">
              (Equation 1: Event Horizon Radius in Vacuum Kerr/Schwarzschild Metric)
            </span>
          </div>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            During ringdown, the dominant quadrupolar strain mode decays exponentially according to complex quasinormal mode frequencies $\omega_&#123;lnm&#125; = \omega_R - i \gamma$:
          </p>

          {/* Display Math Equation Block 2 */}
          <div className="my-6 p-6 rounded-2xl bg-[#090d15] border border-slate-800 text-center font-mono text-sky-300 text-lg sm:text-xl shadow-2xl space-y-2">
            <div className="tracking-widest">
              h_+(t) - i h_\times(t) = \sum_&#123;l,m&#125; A_&#123;lm&#125; \exp\left( -i \omega_&#123;lm&#125; t - \frac&#123;t&#125;&#123;\tau_&#123;lm&#125;&#125; \right) Y_&#123;lm&#125;(\theta, \phi)
            </div>
            <span className="text-xs text-slate-500 font-mono block">
              (Equation 2: Quadrupolar Strain Ringdown Mode Decomposition)
            </span>
          </div>
        </section>

        {/* Section 3: Figures with Captions */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
            3. Numerical Relativity Simulations &amp; Observational Figures
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            We performed 3D adaptive mesh hydrodynamic grid simulations across binary mass ratios $q = m_1 / m_2 \in [1, 10]$. Figure 1 illustrates simulated strain profiles during coalesce and ringdown.
          </p>

          {/* Figure Container Component */}
          <figure className="my-8 cosmic-card rounded-2xl p-4 sm:p-6 bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="relative w-full h-64 sm:h-80 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
              {/* Simulated Spectral Chart Diagram */}
              <div className="w-full h-full flex items-end justify-between gap-2 px-6 pt-10 pb-4">
                {[20, 45, 30, 85, 95, 60, 40, 25, 15, 10].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-gradient-to-t from-sky-600/40 via-sky-400/80 to-indigo-300 rounded-t transition-all group-hover:brightness-125"
                  />
                ))}
              </div>
              <div className="absolute top-4 left-4 text-xs font-mono text-sky-400 bg-slate-950/90 px-3 py-1 rounded border border-slate-800">
                Simulated Waveform h(t) [Strain vs Time (ms)]
              </div>
            </div>
            <figcaption className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed text-center italic pt-1">
              <strong className="text-slate-200 font-mono not-italic">Figure 1:</strong> Gravitational strain amplitude $h(t)$ recorded during binary black hole coalescence and quasinormal ringdown phase ($q=1.5$, dimensionless spin $a/M = 0.70$).
            </figcaption>
          </figure>
        </section>

        {/* Section 4: Data Tables & Key Results */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
            4. Observational Results &amp; Parameter Estimates
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Table 1 summarizes key numerical parameters derived from interferometer strain responses across multiple detector configurations.
          </p>

          {/* Table Component */}
          <div className="my-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs sm:text-sm font-sans">
              <thead className="bg-slate-950 font-mono text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Simulation Run</th>
                  <th className="p-3.5">Mass Ratio ($q$)</th>
                  <th className="p-3.5">Primary Mass ($M_1/M_\odot$)</th>
                  <th className="p-3.5">Ringdown Freq (Hz)</th>
                  <th className="p-3.5">Radiated Energy ($\% M c^2$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3.5 font-mono text-sky-400">SIM-BBH-001</td>
                  <td className="p-3.5">1.00</td>
                  <td className="p-3.5">250.0</td>
                  <td className="p-3.5 font-mono">142.5</td>
                  <td className="p-3.5 font-mono">4.82%</td>
                </tr>
                <tr className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3.5 font-mono text-sky-400">SIM-BBH-002</td>
                  <td className="p-3.5">1.50</td>
                  <td className="p-3.5">380.0</td>
                  <td className="p-3.5 font-mono">98.2</td>
                  <td className="p-3.5 font-mono">4.15%</td>
                </tr>
                <tr className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3.5 font-mono text-sky-400">SIM-BBH-003</td>
                  <td className="p-3.5">2.25</td>
                  <td className="p-3.5">500.0</td>
                  <td className="p-3.5 font-mono">71.4</td>
                  <td className="p-3.5 font-mono">3.90%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Blockquotes & Lists */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 tracking-tight">
            5. Key Scientific Takeaways &amp; Observational Criteria
          </h2>

          <blockquote className="my-6 border-l-4 border-indigo-500 pl-6 py-2 italic text-slate-300 font-serif text-lg">
            &ldquo;The detection of intermediate-mass binary ringdown strain provides an unconstrained laboratory for testing general relativity under extreme curvature regimes.&rdquo;
          </blockquote>

          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-2">
            Primary Observational Criteria:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300 text-base sm:text-lg pl-2">
            <li>Strain signal-to-noise ratio $\text&#123;SNR&#125; \ge 12$ across space-based interferometers.</li>
            <li>Unambiguous mode resolution separating $l=2, m=2$ and $l=3, m=3$ harmonics.</li>
            <li>Constraints on remnant black hole dimensionless spin parameter $a / M &lt; 0.998$.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-200 mt-6 mb-2">
            Sequential Detection Workflow:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 text-base sm:text-lg pl-2 font-sans">
            <li>Raw time-domain strain sampling at sub-millisecond cadence.</li>
            <li>Matche-filtered template bank alignment using numerical relativity waveforms.</li>
            <li>Parameter estimation via Markov Chain Monte Carlo (MCMC) Bayesian inference.</li>
          </ol>
        </section>

        {/* Tags Row */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Subject Tags:</span>
            {publication.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>

        {/* References Bibliography Section */}
        <section className="bg-[#080d14] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-4 font-sans">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
            <BookMarked className="w-4 h-4 text-sky-400" />
            <span>References &amp; Bibliography</span>
          </div>
          <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-400 space-y-3 leading-relaxed font-mono">
            <li>
              Abbott, B. P., et al. (2016). &ldquo;Observation of Gravitational Waves from a Binary Black Hole Merger.&rdquo; <em className="text-slate-300">Physical Review Letters</em>, 116(6), 061102.
            </li>
            <li>
              Misner, C. W., Thorne, K. S., &amp; Wheeler, J. A. (1973). <em className="text-slate-300">Gravitation</em>. W. H. Freeman and Company, San Francisco.
            </li>
            <li>
              Hawking, S. W. (1975). &ldquo;Particle creation by black holes.&rdquo; <em className="text-slate-300">Communications in Mathematical Physics</em>, 43(3), 199–220.
            </li>
            <li>
              Press, W. H., &amp; Teukolsky, S. A. (1973). &ldquo;Perturbations of a rotating black hole.&rdquo; <em className="text-slate-300">The Astrophysical Journal</em>, 185, 635–648.
            </li>
          </ol>
        </section>

      </div>
    </article>
  );
}

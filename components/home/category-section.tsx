import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Atom, Compass, Binary, Cpu, Layers, Dna, HeartPulse, Brain, FlaskConical } from "lucide-react";
import { Category } from "@/types";

interface CategorySectionProps {
  categories: Category[];
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Globe,
  Atom,
  Compass,
  Binary,
  Cpu,
  Dna,
  HeartPulse,
  Brain,
  FlaskConical,
};

/**
 * Scientific Category Section — Section 5
 * Displays the 6 core scientific disciplines with paper counts & descriptions.
 */
export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-1">
            <Layers className="w-3.5 h-3.5 text-rose-700" />
            <span>Disciplines</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Browse by Scientific Domain
          </h2>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold text-rose-700 hover:text-rose-800 group transition-colors"
        >
          <span>Explore all domains</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const IconComponent = (category.iconName && iconMap[category.iconName]) || Atom;

          return (
            <Link
              key={category.id}
              href={`/publications?category=${category.slug}`}
              className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs hover:border-slate-400 transition-all block group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-rose-700 group-hover:bg-rose-50 transition-all">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {category.publicationCount ?? 0} papers
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-rose-700 transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

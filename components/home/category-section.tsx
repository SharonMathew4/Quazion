import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Atom, Compass, Binary, Cpu, Layers } from "lucide-react";
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
};

/**
 * Scientific Category Section — Section 5
 * Displays the 6 core scientific disciplines with paper counts & descriptions.
 */
export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Disciplines</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Browse by Scientific Domain
          </h2>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 font-medium group transition-colors"
        >
          <span>Explore all domains</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const IconComponent = (category.iconName && iconMap[category.iconName]) || Atom;

          return (
            <Link
              key={category.id}
              href={`/publications?category=${category.slug}`}
              className="cosmic-card p-6 rounded-2xl block group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 group-hover:border-sky-500/40 group-hover:scale-105 transition-all">
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                  {category.publicationCount ?? 0} papers
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-100 group-hover:text-sky-300 transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed font-sans">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

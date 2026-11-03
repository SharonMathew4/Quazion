import Link from "next/link";
import { MOCK_CATEGORIES, MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { ArrowRight, Compass, BookOpen } from "lucide-react";
import { PublicationCard } from "@/components/publications/publication-card";

export const metadata = {
  title: "Explore Scientific Domains — QUAZION",
  description: "Browse open research, publications, and notes by scientific category.",
};

export default function ExplorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
          <Compass className="w-4 h-4" />
          <span>Scientific Disciplines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Explore Research Categories
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
          From astrophysics and cosmological simulations to mathematical physics and quantum systems. 
          Select a discipline to dive into peer-moderated papers and essays.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="cosmic-card p-6 rounded-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-xl font-bold text-slate-100">
                  {category.name}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                  {category.publicationCount} publications
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {category.description}
              </p>
            </div>

            <Link
              href={`/publications?category=${category.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Browse {category.name} publications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Recent additions across domains */}
      <div className="pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h2 className="text-xl font-bold text-slate-100">
              Featured Across Disciplines
            </h2>
          </div>
          <Link
            href="/publications"
            className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>All publications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {MOCK_PUBLICATIONS.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PUBLICATIONS.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <div className="cosmic-card rounded-2xl p-8 text-center border border-dashed border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              No publications have been uploaded across disciplines yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

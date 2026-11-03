import Link from "next/link";
import { MOCK_AUTHORS } from "@/lib/mock-data";
import { Users, BookOpen, Eye, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contributors Directory — QUAZION",
  description: "Discover researchers, educators, and authors publishing on QUAZION.",
};

export default function ContributorsPage() {
  const contributors = Object.values(MOCK_AUTHORS);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
          <Users className="w-4 h-4" />
          <span>Scientific Community</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Contributors &amp; Researchers
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
          Discover scientists, mathematicians, and educational writers sharing open discoveries and knowledge across QUAZION.
        </p>
      </div>

      {/* Grid of Contributors */}
      {contributors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((author) => (
            <div
              key={author.id}
              className="cosmic-card p-6 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-mono text-sky-400 font-bold">
                    {author.displayName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      {author.displayName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      @{author.username}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-sky-400/90 font-medium mb-3">
                  {author.affiliation}
                </p>

                <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed mb-6">
                  {author.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    {author.totalPublications} papers
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {author.totalViews}
                  </span>
                </div>

                <Link
                  href={`/contributors/${author.username}`}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-2xl p-12 text-center max-w-lg mx-auto border border-dashed border-slate-800">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">
            No contributors found
          </h3>
          <p className="text-xs text-slate-400">
            There are currently no public contributors registered. Authors will appear here once their research is published.
          </p>
        </div>
      )}
    </div>
  );
}

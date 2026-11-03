import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_AUTHORS, MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { PublicationCard } from "@/components/publications/publication-card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const author = Object.values(MOCK_AUTHORS).find((a) => a.username === username);
  if (!author) return { title: "Contributor Not Found — QUAZION" };
  return {
    title: `${author.displayName} (@${author.username}) — QUAZION`,
    description: author.bio,
  };
}

export default async function ContributorProfilePage({ params }: Props) {
  const { username } = await params;
  const author = Object.values(MOCK_AUTHORS).find((a) => a.username === username);

  if (!author) {
    notFound();
  }

  // Filter publications by this author
  const authorPublications = MOCK_PUBLICATIONS.filter(
    (pub) => pub.author.username === author.username
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/contributors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to contributors</span>
        </Link>
      </div>

      {/* Contributor Profile Header Card */}
      <div className="cosmic-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl font-mono text-sky-400 font-bold shadow-xl">
              {author.displayName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                  {author.displayName}
                </h1>
                <Badge variant="accent">{author.role}</Badge>
              </div>
              <p className="text-sm font-mono text-slate-400">
                @{author.username}
              </p>
              <p className="text-xs text-sky-400 font-medium">
                {author.affiliation}
              </p>
            </div>
          </div>

          {/* Aggregate Community Metrics */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-slate-400 font-mono text-xs w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-100">
                {author.totalPublications}
              </div>
              <div className="text-[11px] text-slate-500">Papers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-100">
                {author.totalViews}
              </div>
              <div className="text-[11px] text-slate-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-100">
                {author.totalLikes}
              </div>
              <div className="text-[11px] text-slate-500">Likes</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Biography &amp; Research Interests
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {author.bio}
          </p>
        </div>
      </div>

      {/* Author's Publications Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <h2 className="text-2xl font-bold text-slate-100">
            Publications by {author.displayName}
          </h2>
        </div>

        {authorPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <div className="cosmic-card p-8 rounded-xl text-center text-slate-400 text-sm">
            No public publications currently listed.
          </div>
        )}
      </div>
    </div>
  );
}

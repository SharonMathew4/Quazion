import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { PublicationHeader } from "@/components/publications/publication-header";
import { PublicationMeta } from "@/components/publications/publication-meta";
import { PublicationContent } from "@/components/publications/publication-content";
import { PublicationStats } from "@/components/publications/publication-stats";
import { AuthorSummary } from "@/components/publications/author-summary";
import { RelatedPublicationCard } from "@/components/publications/related-publication-card";
import { BookOpen } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pub = MOCK_PUBLICATIONS.find((p) => p.slug === slug);
  if (!pub) return { title: "Publication Not Found — QUAZION" };
  return {
    title: `${pub.title} — QUAZION Open Science`,
    description: pub.abstract,
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pub = MOCK_PUBLICATIONS.find((p) => p.slug === slug);

  if (!pub) {
    notFound();
  }

  // Filter related publications (same category or general recommendations excluding current)
  const related = MOCK_PUBLICATIONS.filter(
    (p) => p.id !== pub.id && (p.category.id === pub.category.id || true)
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Article Header (Title, Type, Category, Author, Dates) */}
      <PublicationHeader publication={pub} />

      {/* Main Grid: Reading Pane + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Journal Article Pane (8 Cols) */}
        <main className="lg:col-span-8 space-y-10">
          {/* Metadata Citation Box */}
          <PublicationMeta publication={pub} />

          {/* Long-Form Scientific Article Content */}
          <PublicationContent publication={pub} />

          {/* Bottom Community Engagement Bar */}
          <section className="pt-8 border-t border-slate-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Article Reader Interaction &amp; Telemetry
            </h3>
            <PublicationStats
              publicationId={pub.id}
              views={pub.views}
              likes={pub.likes}
              downloads={pub.downloads}
              title={pub.title}
              showDemoNotice={true}
            />
          </section>
        </main>

        {/* Sidebar Pane (4 Cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Author Summary Panel */}
          <AuthorSummary author={pub.author} />

          {/* Related Manuscripts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400">
              <BookOpen className="w-4 h-4" />
              <span>Related Manuscripts</span>
            </div>

            <div className="space-y-4">
              {related.map((relPub) => (
                <RelatedPublicationCard key={relPub.id} publication={relPub} />
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

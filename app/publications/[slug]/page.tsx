import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { PublicationHeader } from "@/components/publications/publication-header";
import { PublicationMeta } from "@/components/publications/publication-meta";
import { PublicationContent } from "@/components/publications/publication-content";
import { PublicationStats } from "@/components/publications/publication-stats";
import { AuthorSummary } from "@/components/publications/author-summary";
import { RelatedPublicationCard } from "@/components/publications/related-publication-card";
import { PeerReviewSection } from "@/components/publications/peer-review-section";
import { DiscussionComments } from "@/components/publications/discussion-comments";
import { BookOpen } from "lucide-react";
import { Publication, Reference } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: p, error } = await supabase
      .from("publications")
      .select(`
        id,
        title,
        slug,
        abstract,
        content,
        publication_type,
        status,
        tags,
        keywords,
        views_count,
        likes_count,
        downloads_count,
        reading_time_minutes,
        version,
        changelog_notes,
        endorsements_count,
        created_at,
        published_at,
        category:categories(id, name, slug, description),
        author:profiles(id, username, display_name, avatar_url, bio, affiliation, orcid, role, created_at),
        references:publication_references(id, title, authors, year, source, doi, url)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && p) {
      try {
        await supabase.rpc("record_publication_view", { p_pub_id: p.id });
      } catch {
        // Safe fallback
      }

      interface RawRef {
        id: string;
        title: string;
        authors: string;
        year?: number | null;
        source?: string | null;
        doi?: string | null;
        url?: string | null;
      }
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      const aut = Array.isArray(p.author) ? p.author[0] : p.author;
      const refs = ((p.references || []) as unknown as RawRef[]).map((r) => ({
        id: r.id,
        title: r.title,
        authors: r.authors,
        year: r.year ?? undefined,
        source: r.source ?? undefined,
        doi: r.doi ?? undefined,
        url: r.url ?? undefined,
      })) as Reference[];

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        abstract: p.abstract,
        content: p.content,
        publicationType: p.publication_type,
        category: cat || { id: "gen", name: "General Science", slug: "general", description: "" },
        author: aut
          ? {
              id: aut.id,
              username: aut.username,
              displayName: aut.display_name,
              avatarUrl: aut.avatar_url,
              bio: aut.bio,
              affiliation: aut.affiliation,
              orcid: aut.orcid,
              role: aut.role || "CREATOR",
              createdAt: aut.created_at,
            }
          : {
              id: "author",
              username: "researcher",
              displayName: "Researcher",
              role: "CREATOR",
              createdAt: p.created_at,
            },
        tags: p.tags || [],
        keywords: p.keywords || [],
        status: p.status,
        views: p.views_count || 0,
        likes: p.likes_count || 0,
        downloads: p.downloads_count || 0,
        readingTimeMinutes: p.reading_time_minutes || 5,
        version: p.version || 1,
        changelogNotes: p.changelog_notes || undefined,
        endorsementsCount: p.endorsements_count || 0,
        references: refs,
        createdAt: p.created_at,
        publishedAt: p.published_at,
      };
    }
  } catch (err) {
    console.warn("Error fetching publication by slug:", err);
  }

  // Fallback to static mock publications
  const fallback = MOCK_PUBLICATIONS.find((p) => p.slug === slug);
  return fallback || null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return { title: "Publication Not Found — QUAZION" };
  return {
    title: `${pub.title} — QUAZION Open Science`,
    description: pub.abstract,
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);

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
              showDemoNotice={false}
            />
          </section>

          {/* Post-Publication Peer Review Section */}
          <PeerReviewSection publicationId={pub.id} authorId={pub.author.id} />

          {/* Open Scientific Discussion & Questions */}
          <DiscussionComments publicationId={pub.id} />
        </main>

        {/* Sidebar Pane (4 Cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Author Summary Panel */}
          <AuthorSummary author={pub.author} />

          {/* Related Manuscripts Section */}
          {related.length > 0 && (
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
          )}
        </aside>

      </div>
    </div>
  );
}

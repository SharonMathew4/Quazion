import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchArxivPublications } from "@/lib/arxiv";
import { MOCK_CATEGORIES, MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { ArrowRight, Compass, BookOpen } from "lucide-react";
import { PublicationCard } from "@/components/publications/publication-card";
import { Category, Publication } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore Scientific Domains — QUAZION",
  description: "Browse open research, publications, and notes by scientific category.",
};

export default async function ExplorePage() {
  let categories: Category[] = MOCK_CATEGORIES;
  let publications: Publication[] = MOCK_PUBLICATIONS;

  try {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch categories
    const { data: dbCategories } = await supabase
      .from("categories")
      .select("id, name, slug, description, icon_name")
      .order("name");

    // Fetch published publications count
    const { data: dbPubs } = await supabase
      .from("publications")
      .select("id, category_id")
      .eq("status", "PUBLISHED");

    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        iconName: c.icon_name || "Atom",
        publicationCount: dbPubs ? dbPubs.filter((p) => p.category_id === c.id).length : 0,
      }));
    }

    // 2. Fetch featured additions across domains
    const { data: recentPubsData } = await supabase
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
        created_at,
        published_at,
        category:categories(id, name, slug, description),
        author:profiles(id, username, display_name, avatar_url, bio, affiliation, orcid, role, created_at)
      `)
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(6);

    if (recentPubsData && recentPubsData.length > 0) {
      interface RawExplorePub {
        id: string;
        title: string;
        slug: string;
        abstract: string;
        content: string | null;
        publication_type: Publication["publicationType"];
        status: Publication["status"];
        tags: string[] | null;
        keywords: string[] | null;
        views_count: number | null;
        likes_count: number | null;
        downloads_count: number | null;
        reading_time_minutes: number | null;
        created_at: string;
        published_at: string | null;
        category?: Category | Category[] | null;
        author?: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          affiliation?: string | null;
          orcid?: string | null;
          role?: string | null;
          created_at: string;
        } | Array<{
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          affiliation?: string | null;
          orcid?: string | null;
          role?: string | null;
          created_at: string;
        }> | null;
      }

      publications = (recentPubsData as unknown as RawExplorePub[]).map((p) => {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category;
        const aut = Array.isArray(p.author) ? p.author[0] : p.author;

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          abstract: p.abstract,
          content: p.content || undefined,
          publicationType: p.publication_type,
          category: cat || { id: "gen", name: "General Science", slug: "general", description: "" },
          author: aut
            ? {
                id: aut.id,
                username: aut.username,
                displayName: aut.display_name,
                avatarUrl: aut.avatar_url || undefined,
                bio: aut.bio || undefined,
                affiliation: aut.affiliation || undefined,
                orcid: aut.orcid || undefined,
                role: (aut.role as Publication["author"]["role"]) || "CREATOR",
                createdAt: aut.created_at,
              }
            : {
                id: "author",
                username: "researcher",
                displayName: "Researcher",
                role: "CREATOR" as const,
                createdAt: p.created_at,
              },
          tags: p.tags || [],
          keywords: p.keywords || [],
          status: p.status,
          views: p.views_count || 0,
          likes: p.likes_count || 0,
          downloads: p.downloads_count || 0,
          readingTimeMinutes: p.reading_time_minutes || 5,
          createdAt: p.created_at,
          publishedAt: p.published_at || undefined,
        };
      });
    }
  } catch (err) {
    console.warn("[SERVER] Notice: failed to load explore data from Supabase, using fallback:", err);
  }

  // If local publications are empty, populate featured additions from arXiv
  if (publications.length === 0) {
    try {
      publications = await fetchArxivPublications({ limit: 6 });
    } catch {
      // keep fallback
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <Compass className="w-4 h-4 text-rose-700" />
          <span>Academic Disciplinary Directory</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Explore Research Disciplines
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base font-sans leading-relaxed">
          From astrophysics and cosmological simulations to mathematical physics and quantum computation. 
          Select a discipline to inspect peer-reviewed manuscripts and scholarly dispatches.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs hover:border-slate-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  {category.name}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {category.publicationCount ?? 0} papers
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6 font-sans">
                {category.description}
              </p>
            </div>

            <Link
              href={`/publications?category=${category.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors uppercase tracking-wider font-mono pt-3 border-t border-slate-100"
            >
              <span>Browse {category.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Recent additions across domains */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-700" />
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Featured Across Disciplines
            </h2>
          </div>
          <Link
            href="/publications"
            className="text-xs font-mono font-medium text-rose-700 hover:text-rose-800 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Complete Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <div className="academic-card rounded p-8 text-center border border-dashed border-slate-200 bg-white shadow-2xs">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-sans">
              No publications have been uploaded across disciplines yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

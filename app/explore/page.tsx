import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MOCK_CATEGORIES, MOCK_PUBLICATIONS } from "@/lib/mock-data";
import { ArrowRight, Compass, BookOpen } from "lucide-react";
import { PublicationCard } from "@/components/publications/publication-card";
import { Category, Publication } from "@/types";

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
    console.warn("Failed to load explore data from Supabase:", err);
  }

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
        {categories.map((category) => (
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
                  {category.publicationCount ?? 0} publications
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

        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((pub) => (
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

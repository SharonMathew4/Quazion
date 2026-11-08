"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PUBLICATIONS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { PublicationCard } from "@/components/publications/publication-card";
import { PublicationSkeletonGrid } from "@/components/publications/publication-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { PublicationType, Publication, Category } from "@/types";
import { Filter, SlidersHorizontal, BookOpen } from "lucide-react";
import { reportClientError } from "@/lib/client-logger";

const PUBLICATION_TYPES: PublicationType[] = [
  "Research Paper",
  "Review Article",
  "Scientific Note",
  "Research Report",
  "Observation Report",
  "Educational Article",
  "Tutorial",
  "Lecture Note",
  "Editorial",
  "Science Essay",
  "Commentary",
];

export default function PublicationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "views" | "likes">("newest");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);

  const loadPublications = React.useCallback(async () => {
    setLoading(true);
    setCatalogNotice(null);
    try {
      const supabase = createClient();

      // 1. Fetch categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug, description, icon_name")
        .order("name");

      if (catData && catData.length > 0) {
        setCategories(catData as Category[]);
      }

      // 2. Fetch published papers from Supabase
      const { data: pubData, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        reportClientError("PublicationsCatalog_SupabaseFetch", error);
      }

      if (!error && pubData && pubData.length > 0) {
        interface RawCatalogPub {
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

        const mapped: Publication[] = (pubData as unknown as RawCatalogPub[]).map((p) => {
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

        // Fetch arXiv preprints to supplement directory
        let combined = mapped;
        try {
          const arxivRes = await fetch("/api/arxiv?limit=20");
          if (arxivRes.ok) {
            const { publications: arxivPubs } = await arxivRes.json();
            if (Array.isArray(arxivPubs) && arxivPubs.length > 0) {
              combined = [...mapped, ...arxivPubs];
            }
          }
        } catch (arxivErr) {
          reportClientError("PublicationsCatalog_ArxivFallback", arxivErr);
        }
        setPublications(combined);
      } else {
        // If database has no published papers, fetch directly from arXiv API route
        try {
          const arxivRes = await fetch("/api/arxiv?limit=25");
          if (arxivRes.ok) {
            const { publications: arxivPubs } = await arxivRes.json();
            if (Array.isArray(arxivPubs) && arxivPubs.length > 0) {
              setPublications(arxivPubs);
              return;
            }
          }
        } catch (err) {
          reportClientError("PublicationsCatalog_DirectArxiv", err);
        }
        setPublications(MOCK_PUBLICATIONS);
      }
    } catch (err) {
      reportClientError("PublicationsCatalog_FatalLoad", err);
      try {
        const arxivRes = await fetch("/api/arxiv?limit=25");
        if (arxivRes.ok) {
          const { publications: arxivPubs } = await arxivRes.json();
          if (Array.isArray(arxivPubs) && arxivPubs.length > 0) {
            setPublications(arxivPubs);
            setCatalogNotice("Displaying external preprints while the community archive is syncing.");
            return;
          }
        }
      } catch {
        setPublications(MOCK_PUBLICATIONS);
        setCatalogNotice("Archive index is currently operating in offline mode.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await Promise.resolve();
      if (isMounted) {
        await loadPublications();
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadPublications]);

  // Filter publications
  const filteredPublications = publications
    .filter((pub) => {
      if (selectedCategory !== "all" && pub.category.slug !== selectedCategory) {
        return false;
      }
      if (selectedType !== "all" && pub.publicationType !== selectedType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "likes") return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <BookOpen className="w-4 h-4 text-rose-700" />
          <span>Journal Archive Catalog</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Scientific Publications &amp; Manuscripts
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Index of peer-moderated open access research papers, review articles, observational logs, and theoretical treatises across all scientific disciplines.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Discipline:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-slate-500 cursor-pointer font-sans"
          >
            <option value="all">All Disciplines</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono font-medium ml-2">
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-slate-500 cursor-pointer font-sans"
          >
            <option value="all">All Types</option>
            {PUBLICATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-600 font-mono font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "views" | "likes")}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-slate-500 cursor-pointer font-sans"
          >
            <option value="newest">Most Recent</option>
            <option value="views">Most Read</option>
            <option value="likes">Most Endorsed</option>
          </select>
        </div>
      </div>

      {/* Archival Status / Graceful Degradation Notice */}
      {catalogNotice && (
        <ErrorBanner
          message={catalogNotice}
          onRetry={loadPublications}
          onDismiss={() => setCatalogNotice(null)}
          title="Archive Notice"
        />
      )}

      {/* Publications Listing */}
      {loading ? (
        <PublicationSkeletonGrid count={6} />
      ) : filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          badge="No Results"
          title={
            selectedCategory !== "all" || selectedType !== "all"
              ? "No manuscripts match the active filter"
              : "No publications found in the archive"
          }
          description={
            selectedCategory !== "all" || selectedType !== "all"
              ? "Try resetting the discipline or document format filter to view more research from the universal open archive."
              : "There are currently no research manuscripts published in this index. You can be the first to contribute."
          }
          primaryAction={
            selectedCategory !== "all" || selectedType !== "all"
              ? {
                  label: "Reset All Filters",
                  onClick: () => {
                    setSelectedCategory("all");
                    setSelectedType("all");
                  },
                }
              : {
                  label: "Submit a Manuscript",
                  href: "/creator/publications/new",
                }
          }
          secondaryAction={
            selectedCategory !== "all" || selectedType !== "all"
              ? {
                  label: "Refresh Catalog",
                  onClick: loadPublications,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

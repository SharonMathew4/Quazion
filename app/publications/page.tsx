"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PUBLICATIONS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { PublicationCard } from "@/components/publications/publication-card";
import { PublicationType, Publication, Category } from "@/types";
import { Filter, SlidersHorizontal, BookOpen, Loader2 } from "lucide-react";

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

  useEffect(() => {
    async function loadPublications() {
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

          setPublications(mapped);
        } else {
          // Fallback to static mock publications if database has no published papers yet
          setPublications(MOCK_PUBLICATIONS);
        }
      } catch (err) {
        console.warn("Failed to fetch published papers:", err);
        setPublications(MOCK_PUBLICATIONS);
      } finally {
        setLoading(false);
      }
    }

    loadPublications();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Open Archive Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Scientific Publications
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
          Search and filter all open research papers, review articles, observational logs, and scientific notes.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Disciplines</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
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
          <span className="text-xs text-slate-400 font-mono">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "views" | "likes")}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Publications Listing */}
      {loading ? (
        <div className="py-20 text-center flex items-center justify-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          <span>Querying open publication archive...</span>
        </div>
      ) : filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-2xl p-12 text-center max-w-lg mx-auto border border-dashed border-slate-800">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">
            No publications found
          </h3>
          <p className="text-xs text-slate-400">
            There are currently no publications matching this filter.
          </p>
        </div>
      )}
    </div>
  );
}

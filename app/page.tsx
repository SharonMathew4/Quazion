import React from "react";
import { SciencePulseBar } from "@/components/home/science-pulse-bar";
import { HeroSection } from "@/components/home/hero-section";
import { EditorialMagazineHero } from "@/components/home/editorial-magazine-hero";
import { SocialScienceFeed } from "@/components/home/social-science-feed";
import { ContributionCta } from "@/components/home/contribution-cta";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Category, Publication, Profile } from "@/types";
import {
  MOCK_CATEGORIES,
  MOCK_PUBLICATIONS,
  MOCK_FEATURED_CONTRIBUTORS,
} from "@/lib/mock-data";

interface RawPubItem {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  content: string | null;
  publication_type: Publication["publicationType"];
  status: Publication["status"];
  cover_image?: string | null;
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

function mapRawPublication(raw: RawPubItem): Publication {
  const authorData = Array.isArray(raw.author)
    ? raw.author[0]
    : raw.author;
  const categoryData = Array.isArray(raw.category)
    ? raw.category[0]
    : raw.category;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    abstract: raw.abstract,
    content: raw.content || "",
    coverImage: raw.cover_image || "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
    category: categoryData || {
      id: "cat-general",
      name: "General Science",
      slug: "general-science",
      description: "Interdisciplinary scientific inquiries",
      iconName: "Atom",
      publicationCount: 0,
    },
    author: authorData
      ? {
          id: authorData.id,
          username: authorData.username,
          displayName: authorData.display_name || authorData.username,
          avatarUrl: authorData.avatar_url || undefined,
          bio: authorData.bio || undefined,
          affiliation: authorData.affiliation || undefined,
          orcid: authorData.orcid || undefined,
          role: (authorData.role as "ADMIN" | "EDITOR" | "REVIEWER" | "CREATOR" | "READER") || "CREATOR",
          createdAt: authorData.created_at,
          totalPublications: 1,
        }
      : {
          id: "anonymous",
          username: "researcher",
          displayName: "QUAZION Contributor",
          role: "CREATOR",
          createdAt: new Date().toISOString(),
          totalPublications: 1,
        },
    publicationType: raw.publication_type || "Research Paper",
    status: raw.status || "PUBLISHED",
    tags: raw.tags || [],
    keywords: raw.keywords || [],
    views: raw.views_count ?? 120,
    likes: raw.likes_count ?? 8,
    downloads: raw.downloads_count ?? 2,
    readingTimeMinutes: raw.reading_time_minutes ?? 6,
    createdAt: raw.created_at,
    publishedAt: raw.published_at || raw.created_at,
  };
}

export const revalidate = 60;

export default async function Home() {
  let categories: Category[] = MOCK_CATEGORIES;
  let allPublications: Publication[] = [...MOCK_PUBLICATIONS];
  let contributors: Profile[] = MOCK_FEATURED_CONTRIBUTORS;

  try {
    const supabase = await createServerSupabaseClient();

    // Fetch live categories, published papers, and contributors concurrently to eliminate TTFB bottleneck
    const [categoriesRes, publicationsRes, profilesRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, icon_name")
        .order("name", { ascending: true }),
      supabase
        .from("publications")
        .select(`
          id,
          title,
          slug,
          abstract,
          publication_type,
          status,
          cover_image,
          tags,
          keywords,
          views_count,
          likes_count,
          downloads_count,
          reading_time_minutes,
          created_at,
          published_at,
          category:categories(id, name, slug, description, icon_name),
          author:profiles(id, username, display_name, avatar_url, bio, affiliation, orcid, role, created_at)
        `)
        .eq("status", "PUBLISHED")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, affiliation, orcid, role, created_at")
        .limit(6),
    ]);

    const dbCategories = categoriesRes.data;
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories.map((c) => {
        const mockMatch = MOCK_CATEGORIES.find((mc) => mc.slug === c.slug);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          iconName: c.icon_name || mockMatch?.iconName || "Atom",
          publicationCount: mockMatch?.publicationCount || 0,
        };
      });
    }

    const liveData = publicationsRes.data;
    if (liveData && liveData.length > 0) {
      allPublications = (liveData as unknown as RawPubItem[]).map(mapRawPublication);
    } else {
      allPublications = [];
    }

    const liveProfiles = profilesRes.data;
    if (liveProfiles && liveProfiles.length > 0) {
      contributors = liveProfiles.map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url || undefined,
        bio: p.bio || undefined,
        affiliation: p.affiliation || undefined,
        orcid: p.orcid || undefined,
        role: (p.role as Profile["role"]) || "CREATOR",
        createdAt: p.created_at,
        totalPublications: 1,
      }));
    } else {
      contributors = [];
    }
  } catch {
    allPublications = [];
    contributors = [];
  }

  const leadPub = allPublications[0] || null;
  const sidePubs = allPublications.slice(1, 4);

  return (
    <div className="flex flex-col pb-20 overflow-hidden space-y-6">
      {/* 1. Live Research Pulse Ticker */}
      <SciencePulseBar publications={allPublications} />

      {/* 2. Editorial Masthead & Tagline */}
      <HeroSection />

      {/* 3. Science.org-Inspired Editorial Lead Magazine Story Grid (renders when publications exist) */}
      {leadPub && (
        <EditorialMagazineHero
          leadPublication={leadPub}
          sidePublications={sidePubs}
        />
      )}

      {/* 4. Social Media Scientific Feed (Domain Switcher, Stream & Sidebar) */}
      <SocialScienceFeed
        initialPublications={allPublications}
        categories={categories}
        contributors={contributors}
      />

      {/* 5. Community Open Publishing CTA */}
      <ContributionCta />
    </div>
  );
}

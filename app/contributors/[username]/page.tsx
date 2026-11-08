import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PublicationCard } from "@/components/publications/publication-card";
import { ArrowLeft, BookOpen, MapPin, Building, Globe, Award, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Profile, Publication, Category } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Contributor Not Found — QUAZION" };
  return {
    title: `${profile.display_name} (@${username}) — QUAZION`,
    description: profile.bio || "Researcher on QUAZION",
  };
}

export default async function ContributorProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profileData) {
    notFound();
  }

  const author: Profile = {
    id: profileData.id,
    username: profileData.username,
    displayName: profileData.display_name,
    avatarUrl: profileData.avatar_url || undefined,
    bannerUrl: profileData.banner_url || undefined,
    bio: profileData.bio || undefined,
    headline: profileData.headline || undefined,
    about: profileData.about || undefined,
    affiliation: profileData.affiliation || undefined,
    location: profileData.location || undefined,
    website: profileData.website || undefined,
    orcid: profileData.orcid || undefined,
    role: profileData.role || "CREATOR",
    skills: profileData.skills || [],
    interests: profileData.interests || [],
    followersCount: profileData.followers_count || 0,
    followingCount: profileData.following_count || 0,
    createdAt: profileData.created_at,
  };

  // Fetch real published papers by this author
  const { data: pubData } = await supabase
    .from("publications")
    .select(`
      id, title, slug, abstract, content, publication_type, status,
      views_count, likes_count, downloads_count, reading_time_minutes,
      created_at, published_at, cover_image, tags, keywords,
      category:categories(id, name, slug, description, icon_name)
    `)
    .eq("author_id", author.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  const authorPublications: Publication[] = (pubData || []).map((p) => {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      abstract: p.abstract,
      content: p.content || "",
      publicationType: p.publication_type,
      category: (cat as Category) || {
        id: "gen",
        name: "General Science",
        slug: "general",
        description: "",
      },
      author,
      status: p.status,
      coverImage: p.cover_image || undefined,
      views: p.views_count ?? 0,
      likes: p.likes_count ?? 0,
      downloads: p.downloads_count ?? 0,
      readingTimeMinutes: p.reading_time_minutes ?? 5,
      tags: p.tags || [],
      keywords: p.keywords || [],
      createdAt: p.created_at,
      publishedAt: p.published_at || p.created_at,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
      <div className="cosmic-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl font-mono text-sky-400 font-bold shadow-xl overflow-hidden">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
              ) : (
                author.displayName.charAt(0)
              )}
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
              {author.headline ? (
                <p className="text-xs text-slate-300 font-medium">
                  {author.headline}
                </p>
              ) : author.affiliation ? (
                <p className="text-xs text-sky-400 font-medium">
                  {author.affiliation}
                </p>
              ) : null}
            </div>
          </div>

          {/* Social Counts */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-slate-400 font-mono text-xs w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-100">
                {authorPublications.length}
              </div>
              <div className="text-[11px] text-slate-500">Papers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-100">
                {author.followersCount || 0}
              </div>
              <div className="text-[11px] text-slate-500">Followers</div>
            </div>
          </div>
        </div>

        {/* Location & Website meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          {author.affiliation && (
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {author.affiliation}
            </span>
          )}
          {author.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {author.location}
            </span>
          )}
          {author.website && (
            <a href={author.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-400 hover:underline">
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
          {author.orcid && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              ORCID: {author.orcid}
            </span>
          )}
        </div>

        {/* Bio / About */}
        {(author.about || author.bio) && (
          <div className="pt-4 border-t border-slate-800/80">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              About
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {author.about || author.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {author.skills && author.skills.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skills &amp; Expertise</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {author.skills.map((s) => (
                <span key={s} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publications by Author */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Published Research ({authorPublications.length})</span>
        </div>

        {authorPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <div className="cosmic-card p-8 rounded-xl text-center text-xs text-slate-500 font-mono">
            No published manuscripts yet.
          </div>
        )}
      </div>
    </div>
  );
}

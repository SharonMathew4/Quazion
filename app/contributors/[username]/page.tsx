import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PublicationCard } from "@/components/publications/publication-card";
import { ArrowLeft, BookOpen, MapPin, Building, Globe, Award, ShieldCheck } from "lucide-react";
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
    title: `${profile.display_name} (@${username}) — Faculty Profile | QUAZION`,
    description: profile.bio || "Academic researcher publishing on QUAZION Open Science Archive",
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/contributors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to contributors directory</span>
        </Link>
      </div>

      {/* Contributor Profile Header Card */}
      <div className="academic-card rounded-md p-6 sm:p-8 space-y-6 bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-3xl font-bold text-slate-800 shadow-xs overflow-hidden shrink-0">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
              ) : (
                author.displayName.charAt(0)
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {author.displayName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
                  {author.role}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500">
                @{author.username}
              </p>
              {author.headline ? (
                <p className="text-xs text-slate-700 font-medium">
                  {author.headline}
                </p>
              ) : author.affiliation ? (
                <p className="text-xs text-slate-800 font-semibold">
                  {author.affiliation}
                </p>
              ) : null}
            </div>
          </div>

          {/* Academic Metrics */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-8 text-slate-600 font-sans text-xs w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900 font-mono">
                {authorPublications.length}
              </div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Published Papers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900 font-mono">
                {author.followersCount || 0}
              </div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Citations / Alerts</div>
            </div>
          </div>
        </div>

        {/* Location, Affiliation & ORCID Line */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
          {author.affiliation && (
            <span className="flex items-center gap-1.5 font-medium text-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {author.affiliation}
            </span>
          )}
          {author.location && (
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {author.location}
            </span>
          )}
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-rose-700 hover:underline font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Institutional Website
            </a>
          )}
          {author.orcid && (
            <a
              href={`https://orcid.org/${author.orcid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#A6CE39] inline-block" />
              <span>ORCID: {author.orcid}</span>
            </a>
          )}
        </div>

        {/* Bio / About */}
        {(author.about || author.bio) && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Academic Background &amp; Research Interests
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {author.about || author.bio}
            </p>
          </div>
        )}

        {/* Skills & Expertise */}
        {author.skills && author.skills.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Research Domains &amp; Methodologies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {author.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publications by Author */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <BookOpen className="w-4 h-4 text-rose-700" />
            <span>Peer-Reviewed Bibliography ({authorPublications.length})</span>
          </div>
        </div>

        {authorPublications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <div className="academic-card p-8 rounded-md text-center text-xs text-slate-500 bg-white border border-slate-200">
            No published manuscripts recorded yet in the archive.
          </div>
        )}
      </div>
    </div>
  );
}

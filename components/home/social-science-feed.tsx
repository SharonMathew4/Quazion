"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Publication, Category, Profile } from "@/types";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Clock, 
  Eye, 
  Check, 
  ExternalLink, 
  Filter, 
  Calendar, 
  Layers, 
  Send,
  Search,
  UserCheck,
  UserPlus,
  HelpCircle,
  Award,
  FileText,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/publications/category-badge";
import { QuickReadModal } from "@/components/publications/quick-read-modal";
import { formatShortDate } from "@/lib/utils";

interface SocialScienceFeedProps {
  initialPublications: Publication[];
  categories: Category[];
  contributors: Profile[];
}

interface PeerComment {
  id: string;
  author: string;
  affiliation: string;
  text: string;
  timestamp: string;
}

/**
 * Curated Research Stream & Discipline Index
 * Scholarly research feed presenting active peer-moderated studies, discussions, and author inquiries.
 */
export function SocialScienceFeed({
  initialPublications,
  categories,
  contributors,
}: SocialScienceFeedProps) {
  // Feed filtering & sorting state
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"trending" | "latest" | "views">("trending");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Social interactions state
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalPub, setActiveModalPub] = useState<Publication | null>(null);

  // User comments on posts
  const [comments, setComments] = useState<Record<string, PeerComment[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Poll state
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([42, 28, 18, 12]);

  // Toggle Like / Endorsement
  const handleLikeToggle = (pubId: string) => {
    setLikes((prev) => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  // Toggle Bookmark
  const handleBookmarkToggle = (pubId: string) => {
    setBookmarks((prev) => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  // Toggle Follow
  const handleFollowToggle = (authorId: string) => {
    setFollowing((prev) => ({ ...prev, [authorId]: !prev[authorId] }));
  };

  // Toggle Comments
  const handleCommentsToggle = (pubId: string) => {
    setExpandedComments((prev) => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  // Add Comment
  const handleAddComment = (pubId: string) => {
    const text = newCommentText[pubId]?.trim();
    if (!text) return;

    const newComment: PeerComment = {
      id: `user-${Date.now()}`,
      author: "Verified Researcher (You)",
      affiliation: "Open Science Contributor",
      text,
      timestamp: "Just now",
    };

    setComments((prev) => ({
      ...prev,
      [pubId]: [...(prev[pubId] || []), newComment],
    }));

    setNewCommentText((prev) => ({ ...prev, [pubId]: "" }));
  };

  // Share DOI / Link
  const handleShare = (pub: Publication) => {
    const url = `${window.location.origin}/publications/${pub.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pub.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Poll Vote
  const handleVote = (index: number) => {
    if (pollVoted !== null) return;
    const newVotes = [...pollVotes];
    newVotes[index] += 1;
    setPollVotes(newVotes);
    setPollVoted(index);
  };

  // Filter & Sort Logic
  const filteredPublications = useMemo(() => {
    return initialPublications
      .filter((pub) => {
        // Domain Filter
        if (selectedDomain !== "all" && pub.category?.slug !== selectedDomain) {
          return false;
        }

        // Content Type Filter
        if (selectedType !== "all" && pub.publicationType !== selectedType) {
          return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = pub.title.toLowerCase().includes(q);
          const matchesAbstract = pub.abstract.toLowerCase().includes(q);
          const matchesAuthor = pub.author.displayName.toLowerCase().includes(q);
          const matchesTag = pub.tags?.some((t) => t.toLowerCase().includes(q));

          if (!matchesTitle && !matchesAbstract && !matchesAuthor && !matchesTag) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "views") {
          return (b.views || 0) - (a.views || 0);
        }
        // Trending: Combination of likes, views, and downloads
        const scoreA = (a.likes || 0) * 3 + (a.downloads || 0) * 2 + (a.views || 0);
        const scoreB = (b.likes || 0) * 3 + (b.downloads || 0) * 2 + (b.views || 0);
        return scoreB - scoreA;
      });
  }, [initialPublications, selectedDomain, selectedType, sortBy, searchQuery]);

  const totalPollVotes = pollVotes.reduce((acc, curr) => acc + curr, 0);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-12 font-sans">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 mb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
              <span>Peer-Reviewed Research Stream</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore &amp; Deliberate Scientific Inquiries
            </h2>
          </div>

          {/* Feed Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, DOI, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* 1. Discipline Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none no-scrollbar">
          <button
            onClick={() => setSelectedDomain("all")}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              selectedDomain === "all"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Disciplines</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedDomain === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedDomain(cat.slug)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Format & Sort Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md bg-slate-50 border border-slate-200 mb-8 text-xs font-sans">
          {/* Content Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-500 font-medium hidden sm:inline mr-1 text-[11px] uppercase tracking-wider">
              Type:
            </span>
            {[
              { id: "all", label: "All Formats" },
              { id: "Research Paper", label: "Research Papers" },
              { id: "Observation Report", label: "Observations" },
              { id: "Editorial", label: "Editorials" },
              { id: "Review Article", label: "Reviews" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer text-xs ${
                  selectedType === t.id
                    ? "bg-white text-rose-800 font-bold border border-slate-300 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">
              Sort:
            </span>
            <div className="flex bg-white rounded border border-slate-200 p-0.5">
              <button
                onClick={() => setSortBy("trending")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  sortBy === "trending"
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Highest Impact
              </button>
              <button
                onClick={() => setSortBy("latest")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  sortBy === "latest"
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Recently Published
              </button>
              <button
                onClick={() => setSortBy("views")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  sortBy === "views"
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Most Read
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Two-Column Layout (Feed + Academic Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Research Feed (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {filteredPublications.length === 0 ? (
              <div className="p-12 text-center academic-card rounded-md bg-white border border-slate-200 space-y-3">
                <Filter className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  No manuscripts found
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  No studies match the selected criteria. Try resetting the domain filter or search query.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDomain("all");
                    setSelectedType("all");
                    setSearchQuery("");
                  }}
                  className="text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              filteredPublications.map((pub) => {
                const isLiked = !!likes[pub.id];
                const isSaved = !!bookmarks[pub.id];
                const isFollowed = !!following[pub.author.id];
                const isCommentsOpen = !!expandedComments[pub.id];
                const postComments = comments[pub.id] || [];

                return (
                  <article
                    key={pub.id}
                    className="academic-card rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Author & Header Meta Row */}
                    <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        {pub.author.avatarUrl ? (
                          <img
                            src={pub.author.avatarUrl}
                            alt={pub.author.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800 text-xs">
                            {pub.author.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/contributors/${pub.author.username}`}
                              className="font-bold text-slate-900 text-sm hover:text-rose-700 transition-colors"
                            >
                              {pub.author.displayName}
                            </Link>
                            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
                              {pub.author.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                            {pub.author.affiliation || "University Department / Institute"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFollowToggle(pub.author.id)}
                          className={`text-xs px-2.5 py-1 rounded-sm border transition-all flex items-center gap-1 cursor-pointer ${
                            isFollowed
                              ? "bg-slate-100 border-slate-300 text-slate-800 font-medium"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          {isFollowed ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Publication Content Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Meta Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <CategoryBadge category={pub.category} clickable={false} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
                          {pub.publicationType}
                        </span>
                        <span className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatShortDate(pub.publishedAt || pub.createdAt)}
                        </span>
                        {pub.readingTimeMinutes && (
                          <span className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {pub.readingTimeMinutes}m read
                          </span>
                        )}
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1 ml-auto">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Open Access</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 hover:text-rose-700 transition-colors leading-snug">
                        <Link href={`/publications/${pub.slug}`}>
                          {pub.title}
                        </Link>
                      </h3>

                      {/* Visual Banner (if available) */}
                      {pub.coverImage && (
                        <div className="relative w-full h-48 sm:h-60 rounded-md overflow-hidden border border-slate-200 bg-slate-100 group/img">
                          <img
                            src={pub.coverImage}
                            alt={pub.title}
                            className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Abstract / Scientific Narrative */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        {pub.abstract}
                      </p>

                      {/* Key Takeaway Callout */}
                      <div className="p-3 rounded-sm bg-rose-50/70 border-l-3 border-rose-700 text-xs text-slate-800 italic leading-relaxed">
                        <span className="font-bold text-rose-800 uppercase tracking-wider block text-[10px] mb-0.5 not-italic">
                          Core Conclusion
                        </span>
                        &ldquo;{pub.abstract.slice(0, 180)}...&rdquo;
                      </div>

                      {/* Academic Keyword pills (no #) */}
                      {pub.tags && pub.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                            Keywords:
                          </span>
                          {pub.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Scholarly Interaction Action Bar */}
                    <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
                      {/* Left: Like, Comment, Bookmark, Share */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeToggle(pub.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                            isLiked
                              ? "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                          title="Peer Endorse"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLiked ? "fill-rose-600 text-rose-600" : "text-rose-600"
                            }`}
                          />
                          <span>{pub.likes + (isLiked ? 1 : 0)} Endorse</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          onClick={() => handleCommentsToggle(pub.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Open Peer Deliberations"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          <span>{postComments.length} Review Notes</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => handleBookmarkToggle(pub.id)}
                          className={`p-1.5 rounded transition-colors cursor-pointer border ${
                            isSaved
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          title={isSaved ? "Saved to Reading List" : "Save for Citation"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
                        </button>

                        {/* Share DOI */}
                        <button
                          onClick={() => handleShare(pub)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer font-mono text-[11px]"
                          title="Copy Permanent Handle / DOI"
                        >
                          {copiedId === pub.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold font-sans">Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 text-slate-400" />
                              <span>DOI</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Quick Read & Full Manuscript Link */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveModalPub(pub)}
                          className="text-xs h-7 px-2.5 text-slate-700 hover:text-slate-900"
                        >
                          Abstract
                        </Button>
                        <Link
                          href={`/publications/${pub.slug}`}
                          className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                        >
                          <span>Full Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Expandable Peer Comments / Review Section */}
                    {isCommentsOpen && (
                      <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-rose-700" />
                            <span>Peer Review Notes &amp; Observations ({postComments.length})</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Open Post-Publication Moderation
                          </span>
                        </div>

                        {/* List of comments */}
                        <div className="space-y-3">
                          {postComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 rounded-md bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">
                                    {comment.author}
                                  </span>
                                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                                    • {comment.affiliation}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {comment.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-700 font-sans leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Add comment input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Contribute peer observation, methodological critique, or question..."
                            value={newCommentText[pub.id] || ""}
                            onChange={(e) =>
                              setNewCommentText((prev) => ({ ...prev, [pub.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(pub.id);
                            }}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddComment(pub.id)}
                            className="text-xs px-3 py-1.5 h-auto font-medium"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            <span>Post</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Academic Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 1. Academic Subject Directory */}
            <div className="academic-card p-5 rounded-md bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />
                  <span>Disciplines Directory</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Subject Index</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedDomain(cat.slug)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <span className="font-medium text-slate-800 group-hover:text-rose-700 block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Archive
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Research Consensus Inquiry of the Week */}
            <div className="academic-card p-5 rounded-md bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>Scientific Consensus Poll</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {totalPollVotes} votes
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                  Which observational mechanism will first resolve the nature of Dark Matter?
                </h4>

                <div className="space-y-2 pt-1 text-xs font-sans">
                  {[
                    "Direct detection (LZ / XENONnT)",
                    "Space surveys (Euclid / Roman)",
                    "Axion resonant haloscopes (ADMX)",
                    "Modified inertia / Gravitational revision",
                  ].map((option, idx) => {
                    const votes = pollVotes[idx];
                    const percent = Math.round((votes / totalPollVotes) * 100);
                    const isSelected = pollVoted === idx;

                    return (
                      <button
                        key={option}
                        onClick={() => handleVote(idx)}
                        disabled={pollVoted !== null}
                        className={`w-full relative overflow-hidden p-2.5 rounded border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-rose-300 bg-rose-50/50 text-rose-900 font-bold"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        {pollVoted !== null && (
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-rose-200/40 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between z-10">
                          <span className="truncate pr-2 text-xs">{option}</span>
                          {pollVoted !== null && (
                            <span className="text-rose-800 font-bold shrink-0 font-mono text-[11px]">{percent}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Featured Editorial Contributors */}
            <div className="academic-card p-5 rounded-md bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-rose-700" />
                  <span>Principal Contributors</span>
                </span>
                <Link href="/contributors" className="text-[11px] font-semibold text-rose-700 hover:underline">
                  Directory &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {contributors.length > 0 ? (
                  contributors.slice(0, 4).map((author) => {
                    const isFollowed = !!following[author.id];

                    return (
                      <div key={author.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          {author.avatarUrl ? (
                            <img
                              src={author.avatarUrl}
                              alt={author.displayName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800 shrink-0">
                              {author.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              {author.displayName}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {author.affiliation || "Faculty / Researcher"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFollowToggle(author.id)}
                          className={`text-[11px] px-2.5 py-1 rounded border transition-all shrink-0 cursor-pointer ${
                            isFollowed
                              ? "bg-slate-100 border-slate-300 text-slate-800 font-medium"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isFollowed ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
                    <p className="text-xs text-slate-500">No public contributor records yet.</p>
                    <Link href="/auth/login?mode=signup" className="text-[11px] font-semibold text-rose-700 hover:underline block">
                      Register as a Researcher &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Call for Submissions Card */}
            <div className="p-5 rounded-md bg-slate-900 text-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-rose-400 text-xs uppercase font-bold tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Call for Manuscripts</span>
              </div>
              <h4 className="text-sm font-bold text-white font-serif">
                Conducting Empirical or Theoretical Research?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Submit papers, observational datasets, and proofs directly to the peer-moderated open archive. Zero author publication fees.
              </p>
              <Link href="/creator/publications/new" className="block pt-1">
                <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                  Submit Manuscript Now
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Quick Read Pop-up Modal */}
      {activeModalPub && (
        <QuickReadModal
          publication={activeModalPub}
          isOpen={!!activeModalPub}
          onClose={() => setActiveModalPub(null)}
          onLikeToggle={handleLikeToggle}
          isLiked={activeModalPub ? !!likes[activeModalPub.id] : false}
        />
      )}
    </>
  );
}

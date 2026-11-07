"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Publication, Category, Profile } from "@/types";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Clock, 
  Eye, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Filter, 
  Flame, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Send,
  Atom, 
  Compass, 
  Globe, 
  Binary, 
  Cpu, 
  Search,
  UserCheck,
  UserPlus,
  HelpCircle,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Toggle Like
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
      author: "Verified Contributor (You)",
      affiliation: "Open Researcher",
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

  // Domain icon map
  const domainIcons: Record<string, React.ElementType> = {
    all: Layers,
    astrophysics: Sparkles,
    cosmology: Globe,
    "theoretical-physics": Atom,
    "space-science": Compass,
    mathematics: Binary,
    "quantum-mechanics": Cpu,
  };

  // Filter & Sort Logic
  const filteredPublications = useMemo(() => {
    return initialPublications
      .filter((pub) => {
        // Domain filter
        if (selectedDomain !== "all" && pub.category.slug !== selectedDomain) {
          return false;
        }
        // Publication type filter
        if (selectedType !== "all" && pub.publicationType !== selectedType) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = pub.title.toLowerCase().includes(q);
          const matchAbstract = pub.abstract.toLowerCase().includes(q);
          const matchAuthor = pub.author.displayName.toLowerCase().includes(q);
          const matchTag = pub.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchAbstract && !matchAuthor && !matchTag) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "trending") {
          return (b.likes * 3 + b.views) - (a.likes * 3 + a.views);
        }
        if (sortBy === "views") {
          return b.views - a.views;
        }
        // latest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [initialPublications, selectedDomain, selectedType, searchQuery, sortBy]);

  // Poll percentage calculator
  const totalPollVotes = pollVotes.reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        {/* Section Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Open Science Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Explore &amp; Discuss Scientific Discoveries
            </h2>
          </div>

          {/* Feed Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feed, authors, DOIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* 1. Sticky Domain Filter Pills (Social Media Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none no-scrollbar">
          <button
            onClick={() => setSelectedDomain("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-all ${
              selectedDomain === "all"
                ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Domains</span>
          </button>

          {categories.map((cat) => {
            const Icon = domainIcons[cat.slug] || Atom;
            const isSelected = selectedDomain === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedDomain(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Format & Sort Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-8 text-xs font-mono">
          {/* Content Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-500 hidden sm:inline mr-1">Type:</span>
            {[
              { id: "all", label: "All Formats" },
              { id: "Research Paper", label: "Research" },
              { id: "Observation Report", label: "Observations" },
              { id: "Editorial", label: "Editorials" },
              { id: "Review Article", label: "Reviews" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedType === t.id
                    ? "bg-slate-800 text-sky-400 font-semibold border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort:</span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setSortBy("trending")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  sortBy === "trending" ? "bg-slate-800 text-sky-300 font-bold" : "text-slate-400"
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setSortBy("latest")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  sortBy === "latest" ? "bg-slate-800 text-sky-300 font-bold" : "text-slate-400"
                }`}
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Latest</span>
              </button>
              <button
                onClick={() => setSortBy("views")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  sortBy === "views" ? "bg-slate-800 text-sky-300 font-bold" : "text-slate-400"
                }`}
              >
                <Eye className="w-3 h-3 text-sky-400" />
                <span>Impact</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Two-Column Layout (Feed + Social Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Social Feed Stream (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {filteredPublications.length === 0 ? (
              <div className="p-12 text-center cosmic-card rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                <Filter className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-slate-200">No publications found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No research match the selected filter criteria. Try resetting the domain filter or search query.
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
                    className="cosmic-card rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Author & Header Meta Row (Social Post Header) */}
                    <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        {pub.author.avatarUrl ? (
                          <img
                            src={pub.author.avatarUrl}
                            alt={pub.author.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 font-mono text-sm">
                            {pub.author.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm hover:text-sky-300 transition-colors">
                              {pub.author.displayName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-400 border border-sky-800/40">
                              {pub.author.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                            {pub.author.affiliation || "Independent Researcher"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFollowToggle(pub.author.id)}
                          className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                            isFollowed
                              ? "bg-slate-800 border-slate-700 text-slate-300"
                              : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950"
                          }`}
                        >
                          {isFollowed ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Post Content Body */}
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Meta Pill Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="border-sky-500/30 text-sky-300 bg-sky-950/40 font-mono text-[11px]">
                          {pub.category.name}
                        </Badge>
                        <Badge variant="accent" className="font-mono text-[11px]">
                          {pub.publicationType}
                        </Badge>
                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatShortDate(pub.publishedAt || pub.createdAt)}
                        </span>
                        {pub.readingTimeMinutes && (
                          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {pub.readingTimeMinutes}m read
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-100 hover:text-sky-300 transition-colors leading-snug">
                        <Link href={`/publications/${pub.slug}`}>
                          {pub.title}
                        </Link>
                      </h3>

                      {/* Visual Banner (if available) */}
                      {pub.coverImage && (
                        <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group/img">
                          <img
                            src={pub.coverImage}
                            alt={pub.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Abstract / Scientific Narrative */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                        {pub.abstract}
                      </p>

                      {/* Key Takeaway Callout */}
                      <div className="p-3 rounded-xl bg-sky-950/20 border-l-2 border-sky-400 text-xs text-sky-200">
                        <span className="font-semibold text-sky-400 font-mono uppercase tracking-wider block text-[10px] mb-0.5">
                          Key Discovery &amp; Insight
                        </span>
                        <p className="italic text-slate-300">
                          &ldquo;{pub.abstract.slice(0, 180)}...&rdquo;
                        </p>
                      </div>

                      {/* Hashtag pills */}
                      {pub.tags && pub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {pub.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-700/50 transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Social Interaction Action Bar */}
                    <div className="px-4 sm:px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      {/* Left: Like, Comment, Bookmark, Share */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeToggle(pub.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                            isLiked
                              ? "bg-rose-500/10 text-rose-400 font-bold"
                              : "text-slate-400 hover:text-rose-400 hover:bg-slate-800/50"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                          <span>{pub.likes + (isLiked ? 1 : 0)}</span>
                        </button>

                        {/* Peer Review Notes / Comments Button */}
                        <button
                          onClick={() => handleCommentsToggle(pub.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                            isCommentsOpen
                              ? "bg-sky-500/10 text-sky-400 font-bold"
                              : "text-slate-400 hover:text-sky-400 hover:bg-slate-800/50"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{postComments.length}</span>
                        </button>

                        {/* Save / Bookmark Button */}
                        <button
                          onClick={() => handleBookmarkToggle(pub.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                            isSaved
                              ? "bg-amber-500/10 text-amber-400 font-bold"
                              : "text-slate-400 hover:text-amber-400 hover:bg-slate-800/50"
                          }`}
                          title={isSaved ? "Saved to Reading Library" : "Save for later"}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-400 text-amber-400" : ""}`} />
                          <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                        </button>

                        {/* Share / Copy DOI Button */}
                        <button
                          onClick={() => handleShare(pub)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800/50 transition-all"
                          title="Share link & DOI"
                        >
                          {copiedId === pub.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">{copiedId === pub.id ? "Copied" : "Share"}</span>
                        </button>
                      </div>

                      {/* Right: Quick Read Modal Trigger & Read Full Paper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveModalPub(pub)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-sky-300 hover:border-sky-500/50 flex items-center gap-1 transition-all text-[11px]"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Quick Read</span>
                        </button>

                        <Link
                          href={`/publications/${pub.slug}`}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950 flex items-center gap-1 transition-all text-[11px] font-semibold"
                        >
                          <span>Full Paper</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Expandable Peer Comments / Review Section */}
                    {isCommentsOpen && (
                      <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/70 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                            <span>Open Peer Deliberations ({postComments.length})</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Transparent review
                          </span>
                        </div>

                        {/* List of comments */}
                        <div className="space-y-3">
                          {postComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-200">
                                    {comment.author}
                                  </span>
                                  <span className="text-slate-400 text-[10px] hidden sm:inline">
                                    • {comment.affiliation}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {comment.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-300 font-sans leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Add comment input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Add a peer review observation or question..."
                            value={newCommentText[pub.id] || ""}
                            onChange={(e) =>
                              setNewCommentText((prev) => ({ ...prev, [pub.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(pub.id);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(pub.id)}
                            className="text-xs px-3 py-1.5 h-auto"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Social Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 1. Trending Science Topics */}
            <div className="cosmic-card p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending Scientific Topics</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live</span>
              </div>

              <div className="space-y-2 text-xs">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedDomain(cat.slug)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors text-left group"
                  >
                    <div>
                      <span className="font-mono text-slate-200 group-hover:text-sky-300 font-semibold block">
                        #{cat.name.replace(/\s+/g, "")}
                      </span>
                      <span className="text-[10px] text-slate-500">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Domain
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Community Scientific Poll of the Week */}
            <div className="cosmic-card p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Research Consensus Poll</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {totalPollVotes} votes
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                  Which methodology will first resolve the nature of Dark Matter?
                </h4>

                <div className="space-y-2 pt-1 text-xs font-mono">
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
                        className={`w-full relative overflow-hidden p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-950/40 text-slate-100 font-bold"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        {pollVoted !== null && (
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-sky-500/15 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between z-10">
                          <span className="truncate pr-2">{option}</span>
                          {pollVoted !== null && (
                            <span className="text-sky-400 font-bold shrink-0">{percent}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Top Contributors to Follow */}
            <div className="cosmic-card p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>Researchers to Follow</span>
                </span>
                <Link href="/contributors" className="text-[11px] font-mono text-sky-400 hover:underline">
                  View all
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
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 shrink-0">
                              {author.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-200 block truncate">
                              {author.displayName}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {author.affiliation || "Active Researcher"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFollowToggle(author.id)}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all shrink-0 ${
                            isFollowed
                              ? "bg-slate-800 border-slate-700 text-slate-300"
                              : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950"
                          }`}
                        >
                          {isFollowed ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-1.5">
                    <p className="text-xs text-slate-400">No public contributor profiles yet.</p>
                    <Link href="/auth/login?mode=signup" className="text-[11px] font-mono text-sky-400 hover:underline block">
                      Join as a contributor &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Creator Callout Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-indigo-950/30 border border-sky-500/20 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Publish Research</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Are you conducting scientific research?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Submit manuscripts, observational datasets, and theoretical proofs directly to the open community archive.
              </p>
              <Link href="/creator/publications/new" className="block pt-1">
                <Button size="sm" className="w-full text-xs">
                  Submit Publication Now
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Quick Read Pop-up Modal */}
      <QuickReadModal
        publication={activeModalPub}
        isOpen={!!activeModalPub}
        onClose={() => setActiveModalPub(null)}
        onLikeToggle={handleLikeToggle}
        isLiked={activeModalPub ? !!likes[activeModalPub.id] : false}
      />
    </>
  );
}

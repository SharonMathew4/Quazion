"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PublicationComment, Profile } from "@/types";
import { MessageSquare, Send, Trash2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface DiscussionCommentsProps {
  publicationId: string;
}

export function DiscussionComments({ publicationId }: DiscussionCommentsProps) {
  const [comments, setComments] = useState<PublicationComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, role, affiliation")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              username: profile.username,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url || undefined,
              role: profile.role,
              affiliation: profile.affiliation || undefined,
              createdAt: "",
            });
          }
        }

        // 2. Comments
        const { data, error } = await supabase
          .from("publication_comments")
          .select(`
            id,
            publication_id,
            parent_id,
            content,
            created_at,
            updated_at,
            author:profiles(id, username, display_name, avatar_url, role, affiliation)
          `)
          .eq("publication_id", publicationId)
          .order("created_at", { ascending: true });

        if (!error && data) {
          const mapped: PublicationComment[] = data.map((c: any) => ({
            id: c.id,
            publicationId: c.publication_id,
            parentId: c.parent_id || undefined,
            content: c.content,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            author: {
              id: c.author?.id || "",
              username: c.author?.username || "anonymous",
              displayName: c.author?.display_name || "Community Member",
              avatarUrl: c.author?.avatar_url || undefined,
              role: c.author?.role || "CREATOR",
              affiliation: c.author?.affiliation || undefined,
              createdAt: "",
            },
          }));
          setComments(mapped);
        }
      } catch (err) {
        console.error("Error loading discussion comments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [publicationId]);

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("publication_comments")
        .insert({
          publication_id: publicationId,
          author_id: currentUser.id,
          content: newComment.trim(),
        })
        .select(`
          id,
          publication_id,
          parent_id,
          content,
          created_at,
          updated_at,
          author:profiles(id, username, display_name, avatar_url, role, affiliation)
        `)
        .single();

      if (!error && data) {
        const commentObj: PublicationComment = {
          id: data.id,
          publicationId: data.publication_id,
          parentId: data.parent_id || undefined,
          content: data.content,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          author: currentUser,
        };
        setComments((prev) => [...prev, commentObj]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(id: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("publication_comments")
        .delete()
        .eq("id", id);

      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6 pt-8 border-t border-slate-800/80">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <span>Open Scientific Discussion</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Peer questions, methodology observations, and academic discourse.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute constructive scientific feedback, raise a query, or share related literature..."
              rows={3}
              required
              className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Posting as <strong className="text-sky-400">@{currentUser.username}</strong>
            </span>
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Sign in to participate in the scientific discussion and ask questions.</span>
          <Link
            href="/auth/login"
            className="text-sky-400 hover:text-sky-300 font-semibold font-mono"
          >
            Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="p-6 rounded-2xl border border-slate-800/50 text-center text-xs text-slate-500">
          No discussion comments posted yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/contributors/${comm.author.username}`}
                    className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-sky-400 text-xs hover:border-sky-500"
                  >
                    {comm.author.displayName.charAt(0)}
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/contributors/${comm.author.username}`}
                        className="text-xs font-semibold text-slate-200 hover:text-sky-400 transition-colors"
                      >
                        {comm.author.displayName}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-mono">
                        @{comm.author.username}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatDate(comm.createdAt)}
                  </span>
                  {currentUser && currentUser.id === comm.author.id && (
                    <button
                      onClick={() => handleDeleteComment(comm.id)}
                      disabled={deletingId === comm.id}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap font-sans pl-9">
                {comm.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


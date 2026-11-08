"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PublicationComment, Profile } from "@/types";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { reportClientError } from "@/lib/client-logger";
import { showToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DiscussionCommentsProps {
  publicationId: string;
}

/**
 * DiscussionComments Component
 * Academic discourse ledger for post-publication inquiries, methodological queries,
 * and reader correspondence.
 */
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
            author:profiles(id, username, display_name, avatar_url, role, affiliation)
          `)
          .eq("publication_id", publicationId)
          .order("created_at", { ascending: true });

        if (!error && data) {
          interface RawDbComment {
            id: string;
            publication_id: string;
            parent_id?: string;
            content: string;
            created_at: string;
            updated_at?: string;
            author?: {
              id?: string;
              username?: string;
              display_name?: string;
              avatar_url?: string;
              role?: PublicationComment["author"]["role"];
              affiliation?: string;
            } | Array<{
              id?: string;
              username?: string;
              display_name?: string;
              avatar_url?: string;
              role?: PublicationComment["author"]["role"];
              affiliation?: string;
            }> | null;
          }

          const mapped: PublicationComment[] = (data as unknown as RawDbComment[]).map((c) => {
            const author = Array.isArray(c.author) ? c.author[0] : c.author;
            return {
              id: c.id,
              publicationId: c.publication_id,
              parentId: c.parent_id,
              content: c.content,
              createdAt: c.created_at,
              updatedAt: c.updated_at || c.created_at,
              author: {
                id: author?.id || "unknown",
                username: author?.username || "anonymous",
                displayName: author?.display_name || "Community Researcher",
                avatarUrl: author?.avatar_url || undefined,
                role: author?.role || "CREATOR",
                affiliation: author?.affiliation || undefined,
                createdAt: "",
              },
            };
          });
          setComments(mapped);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [publicationId, supabase]);

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

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
          author:profiles(id, username, display_name, avatar_url, role, affiliation)
        `)
        .single();

      if (!error && data) {
        const addedComment: PublicationComment = {
          id: data.id,
          publicationId: data.publication_id,
          parentId: data.parent_id,
          content: data.content,
          createdAt: data.created_at,
          updatedAt: data.created_at,
          author: currentUser,
        };
        setComments((prev) => [...prev, addedComment]);
        setNewComment("");
        showToast("Observation contributed to discussion.", "success");
      } else if (error) {
        reportClientError("DiscussionComments_PostError", error, { publicationId });
        showToast("Unable to post comment. Please try again.", "error");
      }
    } catch (err) {
      reportClientError("DiscussionComments_PostCatch", err, { publicationId });
      showToast("An unexpected error occurred while posting.", "error");
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
        showToast("Comment deleted.", "info");
      } else {
        reportClientError("DiscussionComments_DeleteError", error, { id });
        showToast("Unable to delete comment.", "error");
      }
    } catch (err) {
      reportClientError("DiscussionComments_DeleteCatch", err, { id });
      showToast("Unexpected error deleting comment.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6 pt-8 border-t border-slate-200 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-700" />
            <span>Open Scientific Discussion &amp; Inquiries</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Peer queries, methodological observations, and academic discourse.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handlePostComment} className="space-y-3 p-5 rounded-md bg-slate-50 border border-slate-200">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute constructive scientific feedback, raise a query, or share related literature..."
              rows={3}
              required
              className="w-full rounded bg-white border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-sans">
              Posting as <strong className="text-slate-900">@{currentUser.username}</strong>
            </span>
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              variant="primary"
              size="sm"
              className="font-semibold text-xs"
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
        <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Sign in to participate in the scientific discussion and ask questions.</span>
          <Link
            href="/auth/login"
            className="text-rose-700 hover:text-rose-900 font-semibold"
          >
            Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          <div className="p-4 rounded-md bg-white border border-slate-200 space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-sm" />
                <Skeleton className="h-2.5 w-16 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded-sm pl-9" />
            <Skeleton className="h-3 w-4/5 rounded-sm pl-9" />
          </div>
          <div className="p-4 rounded-md bg-white border border-slate-200 space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded-sm" />
                <Skeleton className="h-2.5 w-16 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/4 rounded-sm pl-9" />
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 rounded-md border border-dashed border-slate-200 bg-white text-center space-y-1.5 shadow-2xs">
          <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1" />
          <h4 className="font-serif text-sm font-semibold text-slate-800">No peer inquiries or notes recorded yet</h4>
          <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
            Be the first researcher to contribute a methodological inquiry, analytical critique, or replication observation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-4 rounded-md bg-white border border-slate-200 space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/contributors/${comm.author.username}`}
                    className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800 text-xs hover:border-slate-400"
                  >
                    {comm.author.displayName.charAt(0)}
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/contributors/${comm.author.username}`}
                        className="text-xs font-semibold text-slate-900 hover:text-rose-700 transition-colors"
                      >
                        {comm.author.displayName}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        @{comm.author.username}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatDate(comm.createdAt)}
                  </span>
                  {currentUser && currentUser.id === comm.author.id && (
                    <button
                      onClick={() => handleDeleteComment(comm.id)}
                      disabled={deletingId === comm.id}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-700 transition-opacity p-1 cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-sans pl-9 leading-relaxed">
                {comm.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PeerReview, PeerReviewVerdict, Profile } from "@/types";
import { CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface PeerReviewSectionProps {
  publicationId: string;
  authorId: string;
}

export function PeerReviewSection({ publicationId, authorId }: PeerReviewSectionProps) {
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [verdict, setVerdict] = useState<PeerReviewVerdict>("ENDORSED");
  const [summary, setSummary] = useState("");
  const [competingInterests, setCompetingInterests] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadReviewsAndUser() {
      try {
        setLoading(true);

        // Check auth user
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

        // Fetch reviews
        const { data, error } = await supabase
          .from("peer_reviews")
          .select(`
            id,
            publication_id,
            verdict,
            summary,
            competing_interests,
            created_at,
            updated_at,
            reviewer:profiles(id, username, display_name, avatar_url, role, affiliation)
          `)
          .eq("publication_id", publicationId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped: PeerReview[] = data.map((r: any) => ({
            id: r.id,
            publicationId: r.publication_id,
            verdict: r.verdict as PeerReviewVerdict,
            summary: r.summary,
            competingInterests: r.competing_interests || undefined,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            reviewer: {
              id: r.reviewer?.id || "",
              username: r.reviewer?.username || "anonymous",
              displayName: r.reviewer?.display_name || "Peer Reviewer",
              avatarUrl: r.reviewer?.avatar_url || undefined,
              role: r.reviewer?.role || "REVIEWER",
              affiliation: r.reviewer?.affiliation || undefined,
              createdAt: "",
            },
          }));
          setReviews(mapped);
        }
      } catch (err) {
        console.error("Error loading peer reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReviewsAndUser();
  }, [publicationId]);

  const canReview =
    currentUser &&
    ["REVIEWER", "EDITOR", "ADMIN"].includes(currentUser.role) &&
    currentUser.id !== authorId;

  const userExistingReview = currentUser
    ? reviews.find((r) => r.reviewer.id === currentUser.id)
    : undefined;

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !canReview || !summary.trim()) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("peer_reviews")
        .upsert(
          {
            publication_id: publicationId,
            reviewer_id: currentUser.id,
            verdict,
            summary: summary.trim(),
            competing_interests: competingInterests.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "publication_id, reviewer_id" }
        )
        .select(`
          id,
          publication_id,
          verdict,
          summary,
          competing_interests,
          created_at,
          updated_at,
          reviewer:profiles(id, username, display_name, avatar_url, role, affiliation)
        `)
        .single();

      if (error) {
        setErrorMessage(error.message);
      } else if (data) {
        const newReview: PeerReview = {
          id: data.id,
          publicationId: data.publication_id,
          verdict: data.verdict as PeerReviewVerdict,
          summary: data.summary,
          competingInterests: data.competing_interests || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          reviewer: currentUser,
        };

        setReviews((prev) => [
          newReview,
          ...prev.filter((r) => r.reviewer.id !== currentUser.id),
        ]);
        setSummary("");
        setCompetingInterests("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6 pt-8 border-t border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Post-Publication Peer Review</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Transparent evaluations by credentialed scientific reviewers and domain editors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-slate-300">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </Badge>
          {reviews.filter((r) => r.verdict === "ENDORSED").length > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs">
              {reviews.filter((r) => r.verdict === "ENDORSED").length} Endorsements
            </Badge>
          )}
        </div>
      </div>

      {/* Review Submission Form for Verified Reviewers */}
      {canReview && (
        <form
          onSubmit={handleSubmitReview}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>{userExistingReview ? "Update Your Peer Review" : "Submit Peer Review Evaluation"}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
              Role: {currentUser.role}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Verdict selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Verdict Recommendation</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVerdict("ENDORSED")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  verdict === "ENDORSED"
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ENDORSED</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sound methodology and verified conclusions.</p>
              </button>

              <button
                type="button"
                onClick={() => setVerdict("REVISION_REQUESTED")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  verdict === "REVISION_REQUESTED"
                    ? "bg-amber-950/40 border-amber-500 text-amber-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>REVISION NEEDED</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Key clarifications or derivations required.</p>
              </button>

              <button
                type="button"
                onClick={() => setVerdict("COMMENT")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  verdict === "COMMENT"
                    ? "bg-sky-950/40 border-sky-500 text-sky-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>COMMENT</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Constructive feedback without formal verdict.</p>
              </button>
            </div>
          </div>

          {/* Review Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Scientific Evaluation & Review Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Detail your scientific assessment of the hypotheses, mathematical derivations, experimental setup, or observational telemetry..."
              rows={4}
              required
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Competing Interests */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Competing Interests Disclosure (Optional)</label>
            <input
              type="text"
              value={competingInterests}
              onChange={(e) => setCompetingInterests(e.target.value)}
              placeholder="None declared, or disclose financial / institutional affiliations..."
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting || !summary.trim()}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {userExistingReview ? "Update Review" : "Publish Peer Review"}
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-400">
            No official peer reviews recorded yet for this manuscript.
          </p>
          <p className="text-xs text-slate-500">
            Verified Reviewers and Editors can evaluate preprints to award peer endorsements.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/contributors/${rev.reviewer.username}`}
                    className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-sky-400 text-xs hover:border-sky-500"
                  >
                    {rev.reviewer.displayName.charAt(0)}
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contributors/${rev.reviewer.username}`}
                        className="text-sm font-semibold text-slate-200 hover:text-sky-400 transition-colors"
                      >
                        {rev.reviewer.displayName}
                      </Link>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-300">
                        {rev.reviewer.role}
                      </span>
                    </div>
                    {rev.reviewer.affiliation && (
                      <p className="text-xs text-slate-400">{rev.reviewer.affiliation}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {rev.verdict === "ENDORSED" && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Endorsed</span>
                    </Badge>
                  )}
                  {rev.verdict === "REVISION_REQUESTED" && (
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Revision Requested</span>
                    </Badge>
                  )}
                  {rev.verdict === "COMMENT" && (
                    <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1 font-mono text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Comment</span>
                    </Badge>
                  )}
                  <span className="text-xs font-mono text-slate-500">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
              </div>

              {/* Review Body */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans pl-2 border-l-2 border-slate-800">
                {rev.summary}
              </div>

              {/* Competing interests disclosure */}
              {rev.competingInterests && (
                <p className="text-[11px] text-slate-500 font-mono italic">
                  Competing Interests: {rev.competingInterests}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


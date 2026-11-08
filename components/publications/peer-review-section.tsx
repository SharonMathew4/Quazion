"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PeerReview, PeerReviewVerdict, Profile } from "@/types";
import { CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getSanitizedErrorMessage } from "@/lib/security-errors";
import { reportClientError } from "@/lib/client-logger";
import { showToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PeerReviewSectionProps {
  publicationId: string;
  authorId: string;
}

/**
 * PeerReviewSection Component
 * Academic peer review ledger recording double-blind evaluations, formal verdicts,
 * and competing interest declarations.
 */
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
          interface RawDbReview {
            id: string;
            publication_id: string;
            verdict: string;
            summary: string;
            competing_interests?: string;
            created_at: string;
            updated_at: string;
            reviewer?: {
              id?: string;
              username?: string;
              display_name?: string;
              avatar_url?: string;
              role?: PeerReview["reviewer"]["role"];
              affiliation?: string;
            } | Array<{
              id?: string;
              username?: string;
              display_name?: string;
              avatar_url?: string;
              role?: PeerReview["reviewer"]["role"];
              affiliation?: string;
            }> | null;
          }

          const mapped: PeerReview[] = (data as unknown as RawDbReview[]).map((r) => {
            const rev = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
            return {
              id: r.id,
              publicationId: r.publication_id,
              verdict: r.verdict as PeerReviewVerdict,
              summary: r.summary,
              competingInterests: r.competing_interests || undefined,
              createdAt: r.created_at,
              updatedAt: r.updated_at,
              reviewer: {
                id: rev?.id || "unknown",
                username: rev?.username || "anonymous",
                displayName: rev?.display_name || "Peer Reviewer",
                avatarUrl: rev?.avatar_url || undefined,
                role: rev?.role || "REVIEWER",
                affiliation: rev?.affiliation || undefined,
                createdAt: "",
              },
            };
          });
          setReviews(mapped);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }

    loadReviewsAndUser();
  }, [publicationId, supabase]);

  const canReview =
    Boolean(
      currentUser &&
      ["REVIEWER", "EDITOR", "ADMIN"].includes(currentUser.role) &&
      currentUser.id !== authorId
    );
  const userExistingReview = reviews.find((r) => r.reviewer.id === currentUser?.id);

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
        reportClientError("PeerReviewSection_SubmitError", error, { publicationId });
        setErrorMessage(
          getSanitizedErrorMessage(error, "Unable to submit peer review report. Please try again.")
        );
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
        showToast("Formal peer review report submitted successfully.", "success");
      }
    } catch (err: unknown) {
      reportClientError("PeerReviewSection_SubmitCatch", err, { publicationId });
      setErrorMessage(
        getSanitizedErrorMessage(err, "Unable to submit peer review report. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6 pt-8 border-t border-slate-200 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Peer Review Reports &amp; Editorial Moderation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Formal scientific evaluations by credentialed domain specialists and reviewing editors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-slate-700 font-mono">
            {reviews.length} {reviews.length === 1 ? "Report" : "Reports"}
          </span>
          {reviews.filter((r) => r.verdict === "ENDORSED").length > 0 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{reviews.filter((r) => r.verdict === "ENDORSED").length} Endorsements</span>
            </span>
          )}
        </div>
      </div>

      {/* Non-credentialed user notice */}
      {!canReview && currentUser && currentUser.id !== authorId && (
        <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 font-sans flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Reviewer Credentials Required:</span> Formal peer-review submissions are restricted to accredited Reviewers, Editors, and Editorial Board members. To apply for reviewer credentials, consult the{" "}
            <Link href="/about#guidelines" className="text-rose-700 hover:underline font-medium">
              Author &amp; Reviewer Guidelines
            </Link>.
          </div>
        </div>
      )}

      {/* Review Submission Form for Verified Reviewers */}
      {canReview && (
        <form
          onSubmit={handleSubmitReview}
          className="p-5 sm:p-6 rounded-md bg-slate-50 border border-slate-200 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-700" />
              <span>{userExistingReview ? "Update Review Assessment" : "Submit Peer Review Assessment"}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
              Reviewer Role: {currentUser?.role}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Verdict selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Verdict Recommendation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVerdict("ENDORSED")}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  verdict === "ENDORSED"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ENDORSED</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">Sound methodology and verified conclusions.</p>
              </button>

              <button
                type="button"
                onClick={() => setVerdict("REVISION_REQUESTED")}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  verdict === "REVISION_REQUESTED"
                    ? "bg-amber-50 border-amber-400 text-amber-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>REVISION REQUIRED</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">Key clarifications or derivations required.</p>
              </button>

              <button
                type="button"
                onClick={() => setVerdict("COMMENT")}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  verdict === "COMMENT"
                    ? "bg-slate-100 border-slate-400 text-slate-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>COMMENTARY</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">Methodological observations without formal verdict.</p>
              </button>
            </div>
          </div>

          {/* Review Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evaluation &amp; Review Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Detail your scientific assessment of the hypotheses, mathematical derivations, experimental setup, or observational telemetry..."
              rows={4}
              required
              className="w-full rounded bg-white border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Competing Interests */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Competing Interests Disclosure
            </label>
            <input
              type="text"
              value={competingInterests}
              onChange={(e) => setCompetingInterests(e.target.value)}
              placeholder="State 'None declared', or disclose financial / institutional affiliations..."
              className="w-full rounded bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting || !summary.trim()}
              variant="primary"
              size="sm"
              className="font-semibold text-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Recording...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {userExistingReview ? "Update Review Report" : "Publish Peer Review Report"}
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          <div className="academic-card p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded-sm" />
                  <Skeleton className="h-3 w-24 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-4/5 rounded-sm" />
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 rounded-md border border-dashed border-slate-300 bg-white text-center space-y-1.5 shadow-2xs">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <p className="text-sm font-serif font-semibold text-slate-800">
            No formal peer review reports published yet for this manuscript
          </p>
          <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
            Credentialed Reviewers and Editors evaluate manuscripts to award peer endorsements and methodological reproducibility notes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="academic-card p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/contributors/${rev.reviewer.username}`}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-800 text-xs hover:border-slate-400"
                  >
                    {rev.reviewer.displayName.charAt(0)}
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contributors/${rev.reviewer.username}`}
                        className="text-sm font-semibold text-slate-900 hover:text-rose-700 transition-colors"
                      >
                        {rev.reviewer.displayName}
                      </Link>
                      <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-xs bg-slate-100 border border-slate-200 text-slate-700">
                        {rev.reviewer.role}
                      </span>
                    </div>
                    {rev.reviewer.affiliation && (
                      <p className="text-xs text-slate-500">{rev.reviewer.affiliation}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {rev.verdict === "ENDORSED" && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-sm text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Endorsed</span>
                    </span>
                  )}
                  {rev.verdict === "REVISION_REQUESTED" && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-sm text-xs font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Revision Requested</span>
                    </span>
                  )}
                  {rev.verdict === "COMMENT" && (
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-sm text-xs font-semibold flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Commentary</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-500">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
              </div>

              {/* Review Body */}
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans pl-2 border-l-2 border-slate-300">
                {rev.summary}
              </div>

              {/* Competing interests disclosure */}
              {rev.competingInterests && (
                <p className="text-[11px] text-slate-500 font-sans italic pt-1">
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

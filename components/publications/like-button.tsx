"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";
import { reportClientError } from "@/lib/client-logger";

interface LikeButtonProps {
  publicationId: string;
  initialLikes: number;
}

export function LikeButton({ publicationId, initialLikes }: LikeButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check initial like status
  useEffect(() => {
    async function checkLikeStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("publication_likes")
        .select("id")
        .eq("publication_id", publicationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setHasLiked(true);
      }
    }

    checkLikeStatus();
  }, [publicationId, supabase]);

  const handleToggleLike = async () => {
    if (!userId) {
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (loading) return;
    setLoading(true);

    const prevLiked = hasLiked;
    const prevLikes = likes;

    if (hasLiked) {
      // Optimistic decrement
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);

      try {
        const { error } = await supabase
          .from("publication_likes")
          .delete()
          .eq("publication_id", publicationId)
          .eq("user_id", userId);

        if (error) throw error;
      } catch (err) {
        // Rollback optimistic state
        setLikes(prevLikes);
        setHasLiked(prevLiked);
        reportClientError("LikeButton_RemoveLike", err, { publicationId });
        showToast("Unable to update endorsement. Please try again.", "error");
      }
    } else {
      // Optimistic increment
      setLikes((prev) => prev + 1);
      setHasLiked(true);

      try {
        const { error } = await supabase
          .from("publication_likes")
          .insert({
            publication_id: publicationId,
            user_id: userId,
          });

        if (error) throw error;
      } catch (err) {
        // Rollback optimistic state
        setLikes(prevLikes);
        setHasLiked(prevLiked);
        reportClientError("LikeButton_AddLike", err, { publicationId });
        showToast("Unable to record endorsement. Please try again.", "error");
      }
    }

    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-publication-id={publicationId}
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 transition-colors cursor-pointer border-slate-300 ${
        hasLiked ? "bg-rose-50 text-rose-700 border-rose-200" : "text-slate-700 hover:bg-slate-50"
      }`}
      title={hasLiked ? "Remove endorsement" : "Endorse publication"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      ) : (
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            hasLiked ? "fill-rose-600 text-rose-600" : "text-rose-600"
          }`}
        />
      )}
      <span className="font-sans text-xs font-medium">
        {hasLiked ? "Endorsed" : "Endorse"} ({likes})
      </span>
    </Button>
  );
}

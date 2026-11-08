"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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

    if (hasLiked) {
      // Optimistic decrement
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);

      await supabase
        .from("publication_likes")
        .delete()
        .eq("publication_id", publicationId)
        .eq("user_id", userId);
    } else {
      // Optimistic increment
      setLikes((prev) => prev + 1);
      setHasLiked(true);

      await supabase
        .from("publication_likes")
        .insert({
          publication_id: publicationId,
          user_id: userId,
        });
    }

    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      data-publication-id={publicationId}
      onClick={handleToggleLike}
      disabled={loading}
      className="flex items-center gap-1.5 transition-colors cursor-pointer"
      title={hasLiked ? "Unlike publication" : "Like publication"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      ) : (
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            hasLiked ? "fill-rose-500 text-rose-500" : "text-rose-500/80"
          }`}
        />
      )}
      <span className="font-mono text-xs">
        {hasLiked ? "Liked" : "Like"} ({likes})
      </span>
    </Button>
  );
}

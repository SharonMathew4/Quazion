"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  publicationId: string;
  initialLikes: number;
}

export function LikeButton({ publicationId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleToggleLike = () => {
    // Optimistic UI update with anti-duplication toggle
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      data-publication-id={publicationId}
      onClick={handleToggleLike}
      className="flex items-center gap-1.5 transition-colors cursor-pointer"
      title={hasLiked ? "Unlike publication" : "Like publication"}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-colors ${
          hasLiked ? "fill-rose-500 text-rose-500" : "text-rose-500/80"
        }`}
      />
      <span className="font-mono text-xs">
        {hasLiked ? "Liked" : "Like"} ({likes})
      </span>
    </Button>
  );
}

"use client";

import React from "react";
import { Eye } from "lucide-react";
import { LikeButton } from "./like-button";
import { DownloadButton } from "./download-button";

interface PublicationStatsProps {
  publicationId: string;
  views: number;
  likes: number;
  downloads: number;
  title: string;
  showDemoNotice?: boolean;
}

/**
 * PublicationStats Component
 * Interactive community engagement counters (Views, Likes, Downloads).
 * Includes clear internal demo data attribute and indicator.
 */
export function PublicationStats({
  publicationId,
  views,
  likes,
  downloads,
  title,
  showDemoNotice = true,
}: PublicationStatsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <LikeButton publicationId={publicationId} initialLikes={likes} />
          <DownloadButton initialDownloads={downloads} title={title} />
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800" title="Views">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>{views.toLocaleString()} views</span>
          </span>
        </div>
      </div>

      {showDemoNotice && (
        <p className="text-[10px] text-slate-500 font-mono italic text-right">
          * Demonstration telemetry data
        </p>
      )}
    </div>
  );
}

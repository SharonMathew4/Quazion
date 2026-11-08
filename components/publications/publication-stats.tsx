"use client";

import React from "react";
import { Eye, BookOpen } from "lucide-react";
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
 * Scholarly interaction bar for reader telemetry and manuscript dissemination.
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
      <div className="flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-2">
          <LikeButton publicationId={publicationId} initialLikes={likes} />
          <DownloadButton
            publicationId={publicationId}
            initialDownloads={downloads}
            title={title}
          />
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <span
            className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-mono text-[11px]"
            title="Total Article Accesses"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{views.toLocaleString()} views</span>
          </span>
          <span
            className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-mono text-[11px]"
            title="Indexed in Open Archives"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Access Record</span>
          </span>
        </div>
      </div>

      {showDemoNotice && (
        <p className="text-[10px] text-slate-400 font-mono italic text-right">
          * Real-time institutional telemetry
        </p>
      )}
    </div>
  );
}

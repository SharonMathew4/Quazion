import React from "react";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationSkeletonGrid } from "@/components/publications/publication-skeleton";

export default function PublicationsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <BookOpen className="w-4 h-4 text-rose-700" />
          <span>Journal Archive Catalog</span>
        </div>
        <Skeleton className="h-10 w-96 max-w-full rounded-sm mb-2" />
        <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="bg-white border border-slate-200 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-36 rounded" />
          <Skeleton className="h-7 w-32 rounded" />
        </div>
        <Skeleton className="h-7 w-28 rounded" />
      </div>

      {/* 6-Card Publication Skeleton Grid */}
      <PublicationSkeletonGrid count={6} />
    </div>
  );
}


import React from "react";
import { Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationSkeletonGrid } from "@/components/publications/publication-skeleton";

export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <Compass className="w-4 h-4 text-rose-700" />
          <span>Universal Taxonomy Directory</span>
        </div>
        <Skeleton className="h-10 w-80 max-w-full rounded-sm mb-2" />
        <Skeleton className="h-4 w-full max-w-lg rounded-sm" />
      </div>

      {/* Category Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-5 w-32 rounded-sm" />
                <Skeleton className="h-3 w-16 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-full rounded-sm" />
            <Skeleton className="h-3.5 w-4/5 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Recent publications skeleton */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <Skeleton className="h-6 w-48 rounded-sm" />
        <PublicationSkeletonGrid count={3} />
      </div>
    </div>
  );
}


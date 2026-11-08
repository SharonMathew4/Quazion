import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationSkeletonGrid } from "@/components/publications/publication-skeleton";

export default function ContributorProfileLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Banner Skeleton */}
      <Skeleton className="h-44 w-full rounded-md" />

      {/* Profile Card Skeleton */}
      <div className="academic-card p-6 sm:p-8 rounded-md bg-white border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-sm" />
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-4 w-40 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded" />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Skeleton className="h-3.5 w-full rounded-sm" />
          <Skeleton className="h-3.5 w-5/6 rounded-sm" />
        </div>
      </div>

      {/* Publications Section Skeleton */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-6 w-52 rounded-sm" />
        <PublicationSkeletonGrid count={3} />
      </div>
    </div>
  );
}


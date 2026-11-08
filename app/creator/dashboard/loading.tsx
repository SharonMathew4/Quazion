import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorDashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Banner */}
      <Skeleton className="h-44 w-full rounded-md" />

      {/* Profile Header */}
      <div className="academic-card p-6 sm:p-8 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-52 rounded-sm" />
            <Skeleton className="h-4 w-36 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="academic-card p-4 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-7 w-16 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>

      {/* Table / Cards Skeleton */}
      <div className="academic-card p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded border border-slate-100 flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-72 rounded-sm" />
                <Skeleton className="h-3.5 w-48 rounded-sm" />
              </div>
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


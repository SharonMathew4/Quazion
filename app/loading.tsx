import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Ticker Skeleton */}
      <div className="h-9 w-full bg-slate-100 rounded border border-slate-200 animate-pulse" />

      {/* Hero Masthead Skeleton */}
      <div className="space-y-4 py-8 text-center max-w-3xl mx-auto">
        <Skeleton className="h-5 w-48 mx-auto rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-sm" />
        <Skeleton className="h-4 w-full max-w-md mx-auto rounded-sm" />
      </div>

      {/* Magazine Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-md space-y-4">
          <Skeleton className="h-64 w-full rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-5/6 rounded-sm" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-md space-y-2">
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className="h-5 w-full rounded-sm" />
            <Skeleton className="h-3 w-4/5 rounded-sm" />
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-md space-y-2">
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className="h-5 w-full rounded-sm" />
            <Skeleton className="h-3 w-4/5 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}


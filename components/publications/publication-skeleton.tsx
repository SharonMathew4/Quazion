import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicationCardSkeleton() {
  return (
    <div className="academic-card p-6 flex flex-col justify-between bg-white border border-slate-200 rounded-md shadow-2xs space-y-4">
      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-sm" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>

        {/* Title lines */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-5 w-full rounded-sm" />
          <Skeleton className="h-5 w-3/4 rounded-sm" />
        </div>

        {/* Abstract lines */}
        <div className="space-y-1.5 pt-2">
          <Skeleton className="h-3.5 w-full rounded-sm" />
          <Skeleton className="h-3.5 w-11/12 rounded-sm" />
          <Skeleton className="h-3.5 w-4/5 rounded-sm" />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 pt-2">
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-4 w-16 rounded-sm" />
          <Skeleton className="h-4 w-14 rounded-sm" />
        </div>
      </div>

      {/* Footer metadata */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-8 rounded-sm" />
          <Skeleton className="h-3.5 w-8 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function PublicationSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PublicationCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ManuscriptReaderSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Article Header Skeleton */}
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-28 rounded-sm" />
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-5 w-24 rounded-sm" />
        </div>
        <Skeleton className="h-10 w-full max-w-3xl rounded-sm" />
        <Skeleton className="h-8 w-4/5 max-w-2xl rounded-sm" />

        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-36 rounded-sm" />
            <Skeleton className="h-3 w-48 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Grid: Main + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {/* Metadata box skeleton */}
          <div className="p-6 rounded-md border border-slate-200 bg-white space-y-3">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-3/4 rounded-sm" />
          </div>

          {/* Abstract callout */}
          <div className="p-6 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <Skeleton className="h-3.5 w-full rounded-sm" />
            <Skeleton className="h-3.5 w-full rounded-sm" />
            <Skeleton className="h-3.5 w-2/3 rounded-sm" />
          </div>

          {/* Article content body */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-11/12 rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-24 w-full rounded-sm" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-md border border-slate-200 bg-white space-y-4">
            <Skeleton className="h-5 w-32 rounded-sm" />
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-28 mx-auto rounded-sm" />
            <Skeleton className="h-3 w-36 mx-auto rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}


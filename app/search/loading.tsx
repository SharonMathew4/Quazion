import React from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationSkeletonGrid } from "@/components/publications/publication-skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2">
          <Search className="w-4 h-4 text-rose-700" />
          <span>Universal Journal Archive Index</span>
        </div>
        <Skeleton className="h-10 w-96 max-w-full rounded-sm mb-2" />
        <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
      </div>

      <div className="max-w-3xl">
        <Skeleton className="h-12 w-full rounded" />
      </div>

      <PublicationSkeletonGrid count={6} />
    </div>
  );
}


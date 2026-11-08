import React from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContributorsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 mb-2">
          <Users className="w-4 h-4 text-rose-700" />
          <span>Editorial Board &amp; Principal Investigators</span>
        </div>
        <Skeleton className="h-10 w-96 max-w-full rounded-sm mb-2" />
        <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="academic-card p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-36 rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-3 w-40 rounded-sm" />
            <Skeleton className="h-3.5 w-full rounded-sm" />
            <Skeleton className="h-3.5 w-4/5 rounded-sm" />
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


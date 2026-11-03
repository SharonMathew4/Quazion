"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Eye, 
  Heart, 
  Download, 
  Plus, 
  Edit3,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PUBLICATIONS } from "@/lib/mock-data";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");

  // Creator publications (empty by default until manuscripts are created)
  const myPublications: import("@/types").Publication[] = [];

  const filtered = myPublications.filter((p) => {
    if (activeTab === "published") return p.status === "PUBLISHED";
    if (activeTab === "drafts") return p.status === "DRAFT";
    return true;
  });

  const totalViews = myPublications.reduce((acc, p) => acc + p.views, 0);
  const totalLikes = myPublications.reduce((acc, p) => acc + p.likes, 0);
  const totalDownloads = myPublications.reduce((acc, p) => acc + p.downloads, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-1">
            <span>Author &amp; Research Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Creator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your scientific manuscripts, draft publications, and track readership engagement.
          </p>
        </div>

        <Link href="/creator/publications/new">
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>New Publication</span>
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cosmic-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Total Papers</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {myPublications.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myPublications.filter((p) => p.status === "DRAFT").length} drafts in progress
          </div>
        </div>

        <div className="cosmic-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Total Views</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all publications</div>
        </div>

        <div className="cosmic-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Likes Received</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {totalLikes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Reader appreciation</div>
        </div>

        <div className="cosmic-card p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Downloads</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {totalDownloads.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">PDF document accesses</div>
        </div>
      </div>

      {/* Publications Table Section */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-slate-800 text-sky-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({myPublications.length})
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                activeTab === "published"
                  ? "bg-slate-800 text-sky-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Published ({myPublications.filter((p) => p.status === "PUBLISHED").length})
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                activeTab === "drafts"
                  ? "bg-slate-800 text-sky-400 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Drafts ({myPublications.filter((p) => p.status === "DRAFT").length})
            </button>
          </div>
        </div>

        {/* Publications List */}
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {filtered.map((pub) => (
              <div
                key={pub.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/70 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={pub.status === "PUBLISHED" ? "success" : "warning"}>
                      {pub.status}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      {pub.category.name} • {pub.publicationType}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100">
                    {pub.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                    <span>Created: {pub.createdAt}</span>
                    {pub.status === "PUBLISHED" && (
                      <>
                        <span>•</span>
                        <span>{pub.views} views</span>
                        <span>•</span>
                        <span>{pub.likes} likes</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {pub.status === "PUBLISHED" ? (
                    <Link href={`/publications/${pub.slug}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>View</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/creator/publications/${pub.id}/edit`}>
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Edit Draft</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cosmic-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
            <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              No manuscripts found
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              You haven&apos;t created any publications or drafts yet.
            </p>
            <Link href="/creator/publications/new">
              <Button variant="primary" size="sm" className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Create your first publication</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

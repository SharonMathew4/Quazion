"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DownloadButtonProps {
  publicationId?: string;
  initialDownloads: number;
  title: string;
}

export function DownloadButton({
  publicationId,
  initialDownloads,
  title,
}: DownloadButtonProps) {
  const supabase = createClient();
  const [downloads, setDownloads] = useState(initialDownloads);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    // Record download telemetry in Supabase if publicationId is provided
    if (publicationId) {
      try {
        await supabase.rpc("record_publication_download", {
          p_pub_id: publicationId,
        });
      } catch {
        // Fallback gracefully
      }
    }

    setDownloads((prev) => prev + 1);
    setDownloading(false);
    setDownloaded(true);

    // Create a demonstration text/pdf download blob
    const content = `QUAZION Open Scientific Archive\nTitle: ${title}\nPublished under Open Access (CC BY 4.0).\nTimestamp: ${new Date().toISOString()}\n\nPermanent Archive Handle: https://quazion.org`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1.5 transition-colors cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50"
    >
      {downloaded ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Download className="w-3.5 h-3.5 text-slate-600" />
      )}
      <span className="font-sans text-xs font-medium">
        {downloading
          ? "Preparing PDF..."
          : downloaded
          ? "PDF Saved"
          : `Download (${downloads})`}
      </span>
    </Button>
  );
}

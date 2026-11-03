"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  initialDownloads: number;
  title: string;
}

export function DownloadButton({
  initialDownloads,
  title,
}: DownloadButtonProps) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);

    // Simulate safe document generation/delivery
    setTimeout(() => {
      setDownloads((prev) => prev + 1);
      setDownloading(false);
      setDownloaded(true);

      // Create a demonstration text/pdf download blob
      const content = `QUAZION Open Scientific Archive\nTitle: ${title}\nPublished under Open Access.\nTimestamp: ${new Date().toISOString()}`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloaded(false), 3000);
    }, 600);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1.5 transition-colors cursor-pointer"
    >
      {downloaded ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Download className="w-3.5 h-3.5 text-slate-400" />
      )}
      <span className="font-mono text-xs">
        {downloading
          ? "Fetching..."
          : downloaded
          ? "Downloaded"
          : `Document (${downloads})`}
      </span>
    </Button>
  );
}

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/client-logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Report error strictly to server telemetry; NEVER log to browser console
    reportClientError("RootErrorBoundary", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50 font-sans">
      <div className="max-w-lg w-full academic-card p-8 sm:p-10 rounded-md bg-white border border-slate-300 shadow-sm text-center space-y-6">
        {/* Scientific Alert Icon */}
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700 shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        {/* Editorial Heading */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
            Archive Telemetry Alert
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Scientific Archive Service Interruption
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-sm mx-auto">
            An unexpected error occurred while processing your request. 
            Diagnostic telemetry has been captured on our server for review. No data was lost.
          </p>
        </div>

        {/* Reference Code */}
        {error.digest && (
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500">
            Archive Trace ID: <span className="text-slate-800 font-semibold">{error.digest}</span>
          </div>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="flex items-center gap-1.5 shadow-2xs text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/publications">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 shadow-2xs text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>Browse Catalog</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 shadow-2xs text-xs"
            >
              <Home className="w-3.5 h-3.5 text-slate-600" />
              <span>Repository Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


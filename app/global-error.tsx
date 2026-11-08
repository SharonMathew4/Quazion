"use client";

import React, { useEffect } from "react";
import { reportClientError } from "@/lib/client-logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError("GlobalLayoutBoundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-md border border-slate-300 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto text-xl font-bold font-mono">
            !
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            System Level Exception
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            The scientific application encountered a fatal layout error. Our systems have logged this event for inspection.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


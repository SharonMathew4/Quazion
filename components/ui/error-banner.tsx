import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "./button";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  className?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  title,
  className = "",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={`p-4 rounded-md bg-rose-50/90 border border-rose-200 text-rose-900 text-xs sm:text-sm font-sans flex items-start gap-3 shadow-2xs ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold text-rose-950 font-serif">{title}</h4>}
        <p className="text-rose-800 leading-relaxed text-xs">{message}</p>
        {onRetry && (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs h-7 px-2.5 bg-white border-rose-300 text-rose-900 hover:bg-rose-100/60 shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 text-rose-700" />
              <span>Retry</span>
            </Button>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer transition-colors"
          aria-label="Dismiss error notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}


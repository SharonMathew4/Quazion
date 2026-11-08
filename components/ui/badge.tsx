import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "navy" | "success" | "warning" | "outline";
}

/**
 * Academic Journal Badge Component
 * High-legibility tags for categories, peer-review statuses, and manuscript types.
 */
export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide transition-colors";

  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    accent: "bg-rose-50 text-rose-700 border border-rose-200",
    navy: "bg-slate-900 text-white border border-slate-800",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    outline: "bg-white border border-slate-200 text-slate-600",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

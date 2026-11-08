import React from "react";
import Link from "next/link";

interface TagProps {
  label: string;
  href?: string;
  variant?: "default" | "subtle";
}

/**
 * Tag Component
 * Academic keyword badge formatted for scientific indexing (no hashtag slop).
 */
export function Tag({ label, href, variant = "default" }: TagProps) {
  const targetHref = href || `/search?q=${encodeURIComponent(label)}`;

  const styles =
    variant === "subtle"
      ? "text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
      : "text-xs px-2 py-0.5 rounded-sm bg-slate-50 border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-800 font-sans";

  return (
    <Link
      href={targetHref}
      className={`${styles} transition-colors inline-block font-medium`}
    >
      {label}
    </Link>
  );
}

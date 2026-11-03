import React from "react";
import Link from "next/link";

interface TagProps {
  label: string;
  href?: string;
  variant?: "default" | "subtle";
}

/**
 * Tag Component
 * Reusable subject tag pill with hashtag prefix and hover states.
 */
export function Tag({ label, href, variant = "default" }: TagProps) {
  const targetHref = href || `/search?q=${encodeURIComponent(label)}`;

  const styles =
    variant === "subtle"
      ? "text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
      : "text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-sky-500/40 hover:text-sky-300 font-mono";

  return (
    <Link href={targetHref} className={`${styles} transition-colors inline-block`}>
      #{label}
    </Link>
  );
}

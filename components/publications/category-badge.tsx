import React from "react";
import Link from "next/link";
import { Category } from "@/types";

interface CategoryBadgeProps {
  category: Category;
  clickable?: boolean;
  size?: "sm" | "md";
}

/**
 * CategoryBadge Component
 * Journal-grade uppercase category badge reflecting scientific discipline.
 */
export function CategoryBadge({
  category,
  clickable = true,
  size = "sm",
}: CategoryBadgeProps) {
  const sizeStyles =
    size === "sm"
      ? "text-[10px] tracking-wider px-2 py-0.5"
      : "text-xs tracking-wider px-2.5 py-1";

  const badgeElement = (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-sm bg-rose-50 border border-rose-200 text-rose-800 font-sans ${sizeStyles} transition-colors`}
    >
      {category.name}
    </span>
  );

  if (clickable) {
    return (
      <Link
        href={`/explore?category=${encodeURIComponent(category.slug)}`}
        className="hover:opacity-80 transition-opacity"
      >
        {badgeElement}
      </Link>
    );
  }

  return badgeElement;
}

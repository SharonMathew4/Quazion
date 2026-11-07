import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional CSS classes cleanly without conflicting Tailwind properties.
 * E.g., cn("px-4 py-2", isActive && "bg-cyan-500", "px-6") correctly resolves to "py-2 bg-cyan-500 px-6".
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Deterministic UTC date formatters to avoid SSR/hydration mismatches between server and client locales.
 */
export function formatShortDate(dateString: string | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatMonthYear(dateString: string | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}


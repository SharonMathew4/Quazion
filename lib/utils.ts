import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional CSS classes cleanly without conflicting Tailwind properties.
 * E.g., cn("px-4 py-2", isActive && "bg-cyan-500", "px-6") correctly resolves to "py-2 bg-cyan-500 px-6".
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

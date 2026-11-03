import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import { Sparkles, Globe, Atom, Compass, Binary, Cpu, Layers } from "lucide-react";

interface CategoryBadgeProps {
  category: Category;
  clickable?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Globe,
  Atom,
  Compass,
  Binary,
  Cpu,
};

/**
 * CategoryBadge Component
 * Renders domain category badge with icon accent and optional route link.
 */
export function CategoryBadge({ category, clickable = true }: CategoryBadgeProps) {
  const IconComponent = (category.iconName && iconMap[category.iconName]) || Layers;

  const badgeElement = (
    <Badge variant="accent" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-xs">
      <IconComponent className="w-3 h-3 text-sky-400" />
      <span>{category.name}</span>
    </Badge>
  );

  if (clickable) {
    return (
      <Link href={`/explore/${category.slug}`} className="hover:opacity-90 transition-opacity">
        {badgeElement}
      </Link>
    );
  }

  return badgeElement;
}

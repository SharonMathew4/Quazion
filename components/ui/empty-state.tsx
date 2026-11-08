import React from "react";
import Link from "next/link";
import { LucideIcon, BookOpen } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = BookOpen,
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`academic-card rounded-md p-10 sm:p-14 text-center max-w-xl mx-auto border border-dashed border-slate-300 bg-white shadow-2xs font-sans ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>

      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider text-rose-800 bg-rose-50 border border-rose-200 mb-2">
          {badge}
        </span>
      )}

      <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction &&
            (primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button variant="primary" size="sm" className="text-xs flex items-center gap-1.5 shadow-2xs">
                  {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
                  <span>{primaryAction.label}</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={primaryAction.onClick}
                className="text-xs flex items-center gap-1.5 shadow-2xs"
              >
                {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
                <span>{primaryAction.label}</span>
              </Button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline" size="sm" className="text-xs shadow-2xs">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={secondaryAction.onClick}
                className="text-xs shadow-2xs"
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}


import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "academic";
  size?: "sm" | "md" | "lg";
}

/**
 * Accessible, reusable Button component for QUAZION
 * Formatted with academic journal styling (Deep Crimson & Academic Navy)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 shadow-xs font-semibold",
      secondary:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 font-medium shadow-xs",
      outline:
        "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-xs",
      ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      academic:
        "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-white hover:border-rose-300 hover:text-rose-700 shadow-xs",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ElementType;
};

/**
 * A radio group dressed as a segmented control. Arrow keys move between
 * options because it is a real radiogroup, not a row of buttons.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex border border-hairline", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 tracking-[0.16em] uppercase transition-colors duration-300",
              "focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]",
              size === "sm" ? "h-9 px-3.5 text-[10px]" : "h-11 px-5 text-[11px]",
              active
                ? "bg-content text-surface"
                : "text-content-muted hover:bg-content/[0.05] hover:text-content",
            )}
          >
            {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

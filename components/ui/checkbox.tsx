"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-[18px] shrink-0 border border-hairline-strong transition-colors duration-200",
      "hover:border-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
      "data-[state=checked]:border-content data-[state=checked]:bg-content",
      "disabled:pointer-events-none disabled:opacity-40",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-surface">
      <Check className="size-3" strokeWidth={3} aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

/** Checkbox + label as one keyboard-reachable row. */
export function CheckboxRow({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="group flex items-center gap-3 py-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      <label
        htmlFor={id}
        className="flex flex-1 cursor-pointer items-center justify-between gap-3 text-sm text-content-muted transition-colors group-hover:text-content peer-data-[state=checked]:text-content"
      >
        <span>{label}</span>
        {typeof count === "number" ? (
          <span className="text-xs text-content-faint tabular-nums">{count}</span>
        ) : null}
      </label>
    </div>
  );
}

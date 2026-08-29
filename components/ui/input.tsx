import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full bg-transparent border-b border-hairline-strong px-0 py-3 text-[0.95rem] text-content placeholder:text-content-faint transition-colors duration-300 hover:border-content/50 focus:border-[var(--accent)] focus:outline-none disabled:opacity-40";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(base, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea">
>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(base, "resize-none", className)} {...props} />
));
Textarea.displayName = "Textarea";

/** Boxed variant for dense filter panels where the underline reads as clutter. */
export const InputBoxed = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "w-full border border-hairline bg-surface px-3.5 py-2.5 text-sm text-content placeholder:text-content-faint transition-colors duration-300 hover:border-hairline-strong focus:border-[var(--accent)] focus:outline-none disabled:opacity-40",
      className,
    )}
    {...props}
  />
));
InputBoxed.displayName = "InputBoxed";

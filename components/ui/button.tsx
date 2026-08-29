"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The hover is a curtain that rises from the bottom edge, drawn as a
 * pseudo-element rather than a DOM node — which is what lets `asChild` work
 * without Slot having two children to choose between.
 *
 * `isolate` + `before:-z-10` keeps the curtain above the button's own
 * background and below its label.
 */
const sweep =
  "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-[var(--sweep)] before:transition-transform before:duration-[620ms] before:ease-[var(--ease-editorial)] before:content-[''] hover:before:scale-y-100 focus-visible:before:scale-y-100";

const buttonVariants = cva(
  [
    "group/btn relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden",
    "font-medium uppercase tracking-[0.16em] whitespace-nowrap select-none",
    "transition-[color,background-color,border-color,opacity] duration-500 ease-[var(--ease-editorial)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Solid ink that empties out to an outline on hover. The house default. */
        primary: `border border-content bg-content text-surface hover:text-content [--sweep:var(--surface)] ${sweep}`,
        /* Hairline outline that fills from the bottom. */
        outline: `border border-hairline-strong bg-transparent text-content hover:text-surface [--sweep:var(--content)] ${sweep}`,
        /* Always a light button, whatever room it is standing in. */
        inverse: `border border-paper bg-paper text-ink hover:text-paper [--sweep:var(--color-ink)] ${sweep}`,
        /* Quiet. No chrome until you touch it. */
        ghost: "bg-transparent text-content hover:bg-content/[0.06]",
        /* An editorial link with a rule that draws in from the left. */
        link: "px-0 text-content after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[var(--ease-editorial)] hover:after:origin-left hover:after:scale-x-100",
        accent: `border border-[var(--accent)] bg-[var(--accent)] text-surface hover:text-[var(--accent)] [--sweep:var(--surface)] ${sweep}`,
      },
      size: {
        sm: "h-9 px-4 text-[10px]",
        md: "h-11 px-6 text-[11px]",
        lg: "h-[3.25rem] px-8 text-[11px]",
        xl: "h-[3.75rem] px-10 text-xs",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };

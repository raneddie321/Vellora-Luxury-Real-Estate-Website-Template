import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "bg-content text-surface",
        outline: "border border-hairline-strong text-content",
        muted: "bg-content/[0.06] text-content-muted",
        accent: "bg-[var(--accent)] text-[var(--surface)]",
        overlay: "bg-ink/70 text-paper backdrop-blur-[2px]",
        success: "bg-[var(--color-success)] text-paper",
        danger: "bg-[var(--color-danger)] text-paper",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

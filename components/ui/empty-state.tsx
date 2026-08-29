import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  eyebrow = "Nothing here yet",
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center border border-dashed border-hairline px-6 py-20 text-center sm:py-28",
        className,
      )}
    >
      {/* A drawn plan fragment rather than a generic empty icon. */}
      <svg
        aria-hidden
        viewBox="0 0 120 84"
        className="mb-9 h-16 w-24 text-content-faint"
        fill="none"
        stroke="currentColor"
      >
        <rect x="1" y="1" width="118" height="82" strokeWidth="1.5" opacity="0.5" />
        <path d="M46 1v82M46 42h73" strokeWidth="1" opacity="0.45" />
        <path d="M46 24a18 18 0 0 1 18 18" strokeWidth="1" opacity="0.35" />
        <rect x="10" y="12" width="26" height="16" strokeWidth="1" opacity="0.35" />
        <circle cx="86" cy="63" r="10" strokeWidth="1" opacity="0.35" />
      </svg>
      <p className="eyebrow text-[var(--accent)]">{eyebrow}</p>
      <h3 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-content sm:text-4xl">
        {title}
      </h3>
      {description ? (
        <p className="measure-tight mt-4 text-sm leading-relaxed text-content-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-9">{action}</div> : null}
    </div>
  );
}

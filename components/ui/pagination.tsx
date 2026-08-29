"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const items = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="inline-flex size-10 items-center justify-center border border-hairline text-content transition-colors hover:border-content disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1.5 text-content-faint" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              "inline-flex size-10 items-center justify-center border text-xs tabular-nums transition-colors duration-300",
              item === page
                ? "border-content bg-content text-surface"
                : "border-hairline text-content-muted hover:border-content hover:text-content",
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="inline-flex size-10 items-center justify-center border border-hairline text-content transition-colors hover:border-content disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}

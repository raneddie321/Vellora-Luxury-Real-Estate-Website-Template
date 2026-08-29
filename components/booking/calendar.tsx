"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDateISO } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Monday-first offset for the first cell of the grid. */
function leadingBlanks(date: Date) {
  return (startOfMonth(date).getDay() + 6) % 7;
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * A month picker built from buttons rather than a date input, so the disabled
 * days, the keyboard model and the styling are all ours. Sundays are viewable
 * by appointment only, so they are disabled here.
 */
export function Calendar({
  value,
  onChange,
  maxDaysAhead = 90,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  maxDaysAhead?: number;
}) {
  const today = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const limit = React.useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + maxDaysAhead);
    return date;
  }, [today, maxDaysAhead]);

  const [cursor, setCursor] = React.useState(() =>
    value ? startOfMonth(new Date(value)) : startOfMonth(today),
  );

  const canGoBack = cursor > startOfMonth(today);
  const canGoForward = cursor < startOfMonth(limit);

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks(cursor) }, () => null),
    ...Array.from(
      { length: daysInMonth(cursor) },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
    ),
  ];

  function isDisabled(date: Date) {
    if (date < today || date > limit) return true;
    return date.getDay() === 0; // Sunday — by appointment only.
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="inline-flex size-10 items-center justify-center border border-hairline text-content transition-colors hover:border-content disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p aria-live="polite" className="text-base text-content">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="inline-flex size-10 items-center justify-center border border-hairline text-content transition-colors hover:border-content disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-7 grid grid-cols-7 gap-1" role="grid" aria-label="Choose a date">
        {WEEKDAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            aria-hidden
            className="pb-2 text-center text-[10px] tracking-[0.16em] text-content-faint uppercase"
          >
            {day}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const iso = formatDateISO(date);
          const disabled = isDisabled(date);
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selected}
              aria-label={date.toDateString()}
              onClick={() => onChange(iso)}
              className={cn(
                "aspect-square border text-sm transition-colors duration-200 tabular-nums",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]",
                disabled && "cursor-not-allowed border-transparent text-content-faint/40",
                !disabled && !selected && "border-hairline text-content hover:border-content",
                selected && "border-content bg-content text-surface",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-content-faint">
        Sundays are by private appointment — ask your advisor.
      </p>
    </div>
  );
}

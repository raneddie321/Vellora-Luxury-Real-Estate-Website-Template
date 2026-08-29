import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps a control with its label, hint and error, wiring `aria-describedby`
 * and `aria-invalid` so screen readers announce validation the same way
 * sighted users see it.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-2.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-[var(--accent)]">*</span> : null}
      </Label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
            "aria-invalid": error ? true : undefined,
            "aria-required": required || undefined,
          })
        : children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-content-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import * as React from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { newsletterContent } from "@/config/content";
import { email as validateEmail } from "@/lib/validation";
import { submitDemo } from "@/lib/validation";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "done";

export function NewsletterForm({ className }: { className?: string }) {
  const id = React.useId();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<State>("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = validateEmail(value);
    setError(message);
    if (message) return;
    setState("loading");
    await submitDemo({ email: value });
    setState("done");
  }

  if (state === "done") {
    return (
      <div className={cn("flex items-start gap-3", className)} role="status">
        <Check className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" aria-hidden />
        <div>
          <p className="text-sm text-content">You are on the list.</p>
          <p className="mt-1 text-xs text-content-faint">
            The next letter goes out on the first Thursday of the month.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor={id} className="sr-only">
            Email address
          </label>
          <input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={newsletterContent.placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="w-full border-b border-hairline-strong bg-transparent py-3 text-[0.95rem] text-content placeholder:text-content-faint transition-colors hover:border-content/50 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="group inline-flex h-[3.25rem] shrink-0 items-center gap-2.5 border-b border-hairline-strong pb-3 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors hover:border-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:opacity-50"
        >
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight
              className="size-4 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1"
              aria-hidden
            />
          )}
          <span>{newsletterContent.cta}</span>
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2.5 text-xs text-[#E2A099]">
          {error}
        </p>
      ) : (
        <p className="mt-2.5 text-xs text-content-faint">{newsletterContent.smallprint}</p>
      )}
    </form>
  );
}

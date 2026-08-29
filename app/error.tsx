"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Deliberately quiet: an apology, a retry, and a
 * way out — no stack traces in front of a client.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Send to your monitoring provider here.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70svh] items-center bg-surface py-32">
      <div className="shell text-center">
        <p className="eyebrow text-[var(--accent)]">Something went wrong</p>
        <h1 className="mx-auto mt-6 max-w-2xl font-serif text-title text-content">
          That did not load as it should have.
        </h1>
        <p className="measure-tight mx-auto mt-5 text-lede text-content-muted">
          The page hit an unexpected error. Trying again usually resolves it — if it does not,
          please let us know what you were doing.
        </p>
        {error.digest ? (
          <p className="mt-5 text-[11px] tracking-[0.16em] text-content-faint uppercase">
            Reference {error.digest}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

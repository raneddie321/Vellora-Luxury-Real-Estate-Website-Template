'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfacing the digest makes a production report actionable.
    console.error('Editime encountered an unrecoverable render error:', error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-lg font-semibold">Something broke on this screen</h1>
        <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
          Your projects are stored separately and are unaffected. Reloading this view usually clears it.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-2xs text-muted-foreground/70">Reference: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button asChild variant="secondary">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button onClick={reset}>
          <RotateCcw /> Try again
        </Button>
      </div>
    </div>
  )
}

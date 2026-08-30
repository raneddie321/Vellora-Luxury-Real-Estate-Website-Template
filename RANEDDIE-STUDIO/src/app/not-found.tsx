import Link from 'next/link'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground">
        <Compass className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="mt-1.5 text-lg font-semibold">There is nothing at this address</h1>
        <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
          The page may have moved, or the link may be out of date.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="secondary">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Open the studio</Link>
        </Button>
      </div>
    </div>
  )
}

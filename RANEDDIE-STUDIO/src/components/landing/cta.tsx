import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.16),transparent)] blur-2xl" />
        <div className="grid-noise absolute inset-0 opacity-25" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-5 py-20 text-center sm:px-8 lg:py-28">
        <h2 className="mx-auto max-w-[18ch] text-[clamp(1.9rem,4.5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
          Your next edit is a sentence away.
        </h2>
        <p className="mx-auto mt-5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          No account. No upload. Open the studio, generate the demo project, and the whole thing runs on
          your machine in a few seconds.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard?new=1">
              Start Creating <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

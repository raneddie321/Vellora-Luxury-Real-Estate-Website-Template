'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PROMPTS = [
  'Make this feel cinematic.',
  'Turn this into a 30 second social video.',
  'Remove the silence and add subtitles.',
  'Make this look like a Hollywood trailer.',
]

export function Hero() {
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background: a single layered gradient + grid. No images, no JS loop. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-noise absolute inset-0 opacity-[0.35]" />
        <div className="absolute left-1/2 top-[-30%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.20),transparent)] blur-2xl" />
        <div className="absolute left-[8%] top-[18%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,hsl(var(--ai)/0.22),transparent)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
        <motion.div {...rise(0)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/80 px-3 py-1 text-2xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3 text-ai" />
            First MVP · runs with no API keys
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.06)}
          className="mx-auto mt-6 max-w-[16ch] text-center text-[clamp(2.6rem,7vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
        >
          <span className="text-gradient-ember">Create what you imagine.</span>
        </motion.h1>

        <motion.p
          {...rise(0.12)}
          className="mx-auto mt-6 max-w-[58ch] text-center text-[15px] leading-relaxed text-muted-foreground sm:text-base"
        >
          An AI-native creative studio for video, VFX, motion, audio and beyond. Describe the edit you
          want. Review the plan it proposes. Keep your hands on every frame.
        </motion.p>

        <motion.div {...rise(0.18)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard?new=1">
              Start Creating <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard?demo=1">
              <PlayCircle /> Watch Demo
            </Link>
          </Button>
        </motion.div>

        <motion.div {...rise(0.24)} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {PROMPTS.map((prompt) => (
            <span
              key={prompt}
              className="rounded-full border border-border bg-surface-1/70 px-3 py-1.5 text-2xs text-muted-foreground backdrop-blur"
            >
              &ldquo;{prompt}&rdquo;
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

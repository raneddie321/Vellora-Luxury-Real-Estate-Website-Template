'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check, Clock3, Coins, Sparkles } from 'lucide-react'

const OPERATIONS = [
  { title: 'Color grade', detail: 'Contrast +28, saturation −12, cool shadows', seconds: 2, credits: 1 },
  { title: 'Add subtle contrast', detail: 'Vignette at 40%, soft falloff', seconds: 2, credits: 1 },
  { title: 'Adjust pacing', detail: 'Remove 4 silent ranges (3.4s)', seconds: 5, credits: 3 },
  { title: 'Add cinematic crop', detail: 'Crop to 2.39:1, letterboxed', seconds: 1, credits: 1 },
  { title: 'Add audio enhancement', detail: 'Normalise to 90%, 0.15s fades', seconds: 2, credits: 1 },
]

const TRACKS = [
  {
    name: 'V1',
    color: 'bg-track-video/25 border-track-video/50',
    clips: [
      { left: 0, width: 26 },
      { left: 27, width: 22 },
      { left: 50, width: 30 },
      { left: 81, width: 19 },
    ],
  },
  {
    name: 'TXT',
    color: 'bg-track-text/25 border-track-text/50',
    clips: [
      { left: 2, width: 14 },
      { left: 55, width: 18 },
    ],
  },
  {
    name: 'CC',
    color: 'bg-track-caption/25 border-track-caption/50',
    clips: [
      { left: 4, width: 10 },
      { left: 18, width: 12 },
      { left: 34, width: 9 },
      { left: 58, width: 14 },
      { left: 78, width: 11 },
    ],
  },
  {
    name: 'A1',
    color: 'bg-track-audio/25 border-track-audio/50',
    clips: [{ left: 0, width: 100 }],
  },
]

/**
 * A static, hand-built representation of the editor. It is deliberately not a
 * live editor instance: the landing page should render instantly, and the real
 * thing is one click away.
 */
export function Showcase() {
  const reduce = useReducedMotion()

  return (
    <section id="showcase" className="border-b border-border bg-surface-1/40">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[52ch] text-center">
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">The product</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-tight tracking-[-0.02em]">
            An edit plan you can argue with
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Editime never silently changes your video. It proposes operations, tells you what each one
            costs and how long it takes, and waits. Apply all of them, a few of them, or none.
          </p>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-float"
        >
          {/* Window chrome */}
          <div className="flex h-9 items-center gap-2 border-b border-border bg-surface-2 px-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
            </div>
            <p className="ml-2 truncate text-2xs text-muted-foreground">
              Demo — Neon Skyline · 16:9 · 1080p · 30 fps
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px]">
            {/* Preview + timeline */}
            <div className="border-b border-border lg:border-b-0 lg:border-r">
              <div className="relative aspect-video overflow-hidden bg-black">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#0a1030_0%,#2a1a4a_55%,#FF6B35_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]" />
                <div className="absolute inset-x-0 top-0 h-[9%] bg-black" />
                <div className="absolute inset-x-0 bottom-0 h-[9%] bg-black" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="px-6 text-center text-[clamp(1rem,3vw,1.8rem)] font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                    Create what you imagine.
                  </p>
                </div>
                <div className="absolute bottom-[16%] left-1/2 w-[70%] -translate-x-1/2 text-center">
                  <span className="rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white sm:text-xs">
                    Captions land on real speech boundaries.
                  </span>
                </div>
              </div>

              <div className="bg-surface-2 p-3">
                <div className="relative mb-2 h-4 rounded border border-border bg-surface-1">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute top-1 h-2 w-px bg-border"
                      style={{ left: `${i * 10}%` }}
                    />
                  ))}
                  <span className="absolute -top-0.5 h-5 w-0.5 bg-primary" style={{ left: '38%' }} />
                </div>
                <div className="space-y-1.5">
                  {TRACKS.map((track) => (
                    <div key={track.name} className="flex items-center gap-2">
                      <span className="w-7 shrink-0 font-mono text-[9px] uppercase text-muted-foreground">
                        {track.name}
                      </span>
                      <div className="relative h-7 flex-1 rounded border border-border bg-surface-1">
                        {track.clips.map((clip, index) => (
                          <span
                            key={index}
                            className={`absolute inset-y-[2px] rounded-[3px] border ${track.color}`}
                            style={{ left: `${clip.left}%`, width: `${clip.width}%` }}
                          />
                        ))}
                        <span className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: '38%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assistant plan */}
            <div className="bg-surface-1">
              <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-ai/15 text-ai">
                  <Sparkles className="size-3.5" />
                </span>
                <div className="leading-none">
                  <p className="text-xs font-semibold">RAN</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Your creative director</p>
                </div>
              </div>

              <div className="space-y-3 p-3.5">
                <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
                  &ldquo;Make this feel cinematic.&rdquo;
                </div>

                <div className="rounded-md border border-ai/25 bg-ai/[0.06] p-3">
                  <p className="text-xs font-semibold text-foreground">I&rsquo;ll make 5 changes.</p>
                  <ul className="mt-2.5 space-y-2">
                    {OPERATIONS.map((op, index) => (
                      <motion.li
                        key={op.title}
                        initial={reduce ? undefined : { opacity: 0, x: -6 }}
                        whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.1 + index * 0.07 }}
                        className="flex gap-2 rounded border border-border bg-surface-1 p-2"
                      >
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                          <Check className="size-2.5" strokeWidth={3} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-foreground">{op.title}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{op.detail}</p>
                          <div className="mt-1 flex gap-2.5 text-[9px] text-muted-foreground">
                            <span className="inline-flex items-center gap-0.5">
                              <Clock3 className="size-2.5" />~{op.seconds}s
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <Coins className="size-2.5" />
                              {op.credits}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <span className="flex-1 rounded bg-ai px-2 py-1.5 text-center text-[11px] font-medium text-ai-foreground">
                      Apply All
                    </span>
                    <span className="flex-1 rounded border border-border px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                      Review Changes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

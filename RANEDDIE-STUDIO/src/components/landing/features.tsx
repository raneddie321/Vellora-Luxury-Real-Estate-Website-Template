'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Aperture,
  AudioLines,
  Boxes,
  Captions,
  Clapperboard,
  Layers,
  LayoutTemplate,
  Palette,
  Sparkles,
  Wand2,
} from 'lucide-react'

interface Feature {
  icon: React.ElementType
  title: string
  body: string
  tone: 'ember' | 'iris'
}

const CAPABILITIES: Feature[] = [
  {
    icon: Sparkles,
    tone: 'iris',
    title: 'AI creative director',
    body: 'RAN reads your timeline, proposes an edit plan, and shows the cost and duration of every operation before a single frame changes.',
  },
  {
    icon: Layers,
    tone: 'ember',
    title: 'Professional timeline',
    body: 'Multi-track editing with drag, trim, split, ripple delete, snapping, frame-accurate scrubbing and a full undo history.',
  },
  {
    icon: Wand2,
    tone: 'iris',
    title: 'AI-powered editing',
    body: 'Silence detection, smart trimming, shot analysis and aspect conversion run locally on your real media — no upload, no key.',
  },
  {
    icon: Palette,
    tone: 'ember',
    title: 'Cinematic effects',
    body: 'Colour, blur, glow, vignette, grain, sharpen and distortion — composited on canvas so the preview is the render.',
  },
  {
    icon: Captions,
    tone: 'iris',
    title: 'Captions and text',
    body: 'Six caption presets, eight text presets, five animations, and caption timings derived from actual speech activity.',
  },
  {
    icon: AudioLines,
    tone: 'ember',
    title: 'Audio that behaves',
    body: 'Per-clip gain, fades, mute and waveform display, mixed through WebAudio into the exported file.',
  },
  {
    icon: LayoutTemplate,
    tone: 'iris',
    title: 'Templates',
    body: 'Seventeen production-ready starts across YouTube, TikTok, Instagram, ads, corporate, cinematic, product and property.',
  },
  {
    icon: Clapperboard,
    tone: 'ember',
    title: 'Real export',
    body: 'Renders the timeline through the same compositor you preview with, and writes an actual MP4 or WebM you can play.',
  },
]

const ROADMAP = [
  { icon: Aperture, title: 'VFX and compositing', body: 'Node-based effects, matting and keying on GPU workers.' },
  { icon: Boxes, title: '3D and motion', body: 'Scene assembly, camera moves and object animation from language.' },
  { icon: Layers, title: 'Collaboration', body: 'Shared projects, review links and per-frame comments.' },
]

function Tile({ feature, index }: { feature: Feature; index: number }) {
  const reduce = useReducedMotion()
  const Icon = feature.icon
  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-lg border border-border bg-surface-1 p-5 transition-colors hover:border-muted-foreground/25"
    >
      <span
        className={`flex size-9 items-center justify-center rounded-md border ${
          feature.tone === 'iris' ? 'border-ai/25 bg-ai/10 text-ai' : 'border-primary/25 bg-primary/10 text-primary'
        }`}
      >
        <Icon className="size-4" />
      </span>
      <h3 className="mt-4 text-sm font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feature.body}</p>
    </motion.article>
  )
}

export function Features() {
  return (
    <>
      <section id="capabilities" className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-[54ch]">
            <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">Capabilities</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-tight tracking-[-0.02em]">
              Everything in this list actually runs
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Where a feature needs an external model — background removal, image and video generation,
              synthetic voice and music — the interface is built and the capability is labelled
              <span className="mx-1 rounded border border-warning/30 bg-warning/10 px-1 py-0.5 text-warning">
                Requires API
              </span>
              rather than faked.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((feature, index) => (
              <Tile key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="future" className="border-b border-border bg-surface-1/40">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-ai">The future of creative work</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-tight tracking-[-0.02em]">
              One studio, not eight applications
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              Editing, VFX, motion, 3D, colour and sound still live in separate tools with separate
              mental models. Editime is being built so a single instruction can reach across all of them
              — and so the architecture in this first release already assumes GPU workers, a job queue
              and a render farm behind it.
            </p>
            <Link
              href="/dashboard?demo=1"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open the demo project →
            </Link>
          </div>

          <ul className="space-y-3">
            {ROADMAP.map((item) => {
              const Icon = item.icon
              return (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-lg border border-border bg-surface-1 p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                  <span className="ml-auto self-start rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Planned
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { compositionSizeFor } from '@/lib/media/composition'
import { renderFrame } from '@/lib/media/compositor'
import { PlaybackRuntime } from '@/lib/media/playback'
import { useEditorStore } from '@/lib/store/editor-store'
import { cn } from '@/lib/utils'

/** Preview quality maps to the canvas backing resolution and the effect stages. */
const QUALITY_SCALE = { draft: 0.4, balanced: 0.66, full: 1 } as const

/**
 * The program monitor.
 *
 * A single rAF loop advances the timeline clock, syncs every media element, and
 * calls the same `renderFrame` the exporter uses. There is no separate preview
 * renderer that could disagree with the output file.
 */
export function PreviewCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runtimeRef = useRef<PlaybackRuntime | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const [decoding, setDecoding] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const project = useEditorStore((s) => s.project)
  const previewQuality = useEditorStore((s) => s.previewQuality)
  const showGuides = useEditorStore((s) => s.showGuides)

  // Create the runtime once; a re-render must never restart playback.
  useEffect(() => {
    const runtime = new PlaybackRuntime(() => {
      setErrors(runtime.errors())
    })
    runtimeRef.current = runtime
    return () => {
      runtime.dispose()
      runtimeRef.current = null
    }
  }, [])

  useEffect(() => {
    if (project) runtimeRef.current?.setProject(project)
  }, [project])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: previewQuality !== 'draft' })
    if (!ctx) return

    let cancelled = false

    const tick = (now: number) => {
      if (cancelled) return
      const runtime = runtimeRef.current
      const state = useEditorStore.getState()
      const current = state.project

      if (!current) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      const scale = QUALITY_SCALE[state.previewQuality]
      const full = compositionSizeFor(current.settings)
      const size = {
        width: Math.max(2, Math.round(full.width * scale)),
        height: Math.max(2, Math.round(full.height * scale)),
      }
      if (canvas.width !== size.width || canvas.height !== size.height) {
        canvas.width = size.width
        canvas.height = size.height
      }

      // Advance the clock from real elapsed time, so playback speed is honest
      // even when a frame takes longer than its budget.
      const delta = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0
      lastTickRef.current = now

      let time = state.playhead
      if (state.playing) {
        time = state.playhead + delta * state.playbackRate
        if (time >= current.timeline.duration) {
          if (state.loop && current.timeline.duration > 0) {
            time = 0
          } else {
            time = current.timeline.duration
            state.pause()
          }
        }
        state.setPlayhead(time)
      }

      runtime?.sync({
        time,
        playing: state.playing,
        volume: state.volume,
        muted: state.muted,
        rate: state.playbackRate,
      })

      renderFrame(ctx, {
        project: current,
        time,
        size,
        quality: state.previewQuality,
        guides: state.showGuides,
        sources: { get: (clip) => runtime?.getElement(clip) ?? null },
      })

      const loading = runtime?.isLoadingAt(time) ?? false
      setDecoding((previous) => (previous === loading ? previous : loading))

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      lastTickRef.current = 0
    }
  }, [previewQuality, showGuides])

  // Pause every element when the tab is hidden so audio does not run on.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        useEditorStore.getState().pause()
        runtimeRef.current?.pauseAll()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div className={cn('relative flex min-h-0 items-center justify-center', className)}>
      {/*
        The canvas carries the composition size as its intrinsic dimensions, so
        `max-w/max-h: 100%` with auto width and height letterboxes it correctly
        at any container shape without a single layout calculation in JS.
      */}
      <div className="relative inline-flex max-h-full max-w-full">
        <canvas
          ref={canvasRef}
          className="block h-auto max-h-full w-auto max-w-full bg-black shadow-[0_0_0_1px_hsl(var(--border))]"
          role="img"
          aria-label="Program monitor — the current frame of your timeline"
        />

        {decoding && (
          <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
            <Loader2 className="size-3 animate-spin" /> Decoding media…
          </div>
        )}

        {errors.length > 0 && (
          <div className="absolute inset-x-2 bottom-2 flex items-start gap-2 rounded border border-destructive/40 bg-black/85 px-2.5 py-2 text-[10px] text-white">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              {errors.slice(0, 2).map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

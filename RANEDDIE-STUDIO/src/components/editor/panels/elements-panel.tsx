'use client'

import { Captions, Loader2, Shapes, SquareDashedBottom } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusPill } from '@/components/ui/status-pill'
import { CAPTION_PRESETS, resolveTextStyle } from '@/lib/text/presets'
import { createTextClip, createTrack } from '@/lib/timeline/factories'
import { addClip, addTrack } from '@/lib/timeline/operations'
import { getAIProvider } from '@/lib/ai/registry'
import { useEditorStore } from '@/lib/store/editor-store'
import type { TextStyle } from '@/lib/types'

/**
 * Elements: caption generation plus the shape/lower-third style overlays that
 * are built from the text system rather than a separate primitive.
 */
export function ElementsPanel() {
  const project = useEditorStore((s) => s.project)
  const playhead = useEditorStore((s) => s.playhead)
  const commit = useEditorStore((s) => s.commit)
  const runAction = useEditorStore((s) => s.runAction)
  const [busy, setBusy] = useState<string | null>(null)

  const captionStatus = getAIProvider()
    .capabilities()
    .find((c) => c.capability === 'caption')

  const captionTrack = project?.timeline.tracks.find((track) => track.kind === 'caption')
  const captionCount = captionTrack?.clips.length ?? 0

  async function generateCaptions(presetId: string) {
    setBusy(presetId)
    try {
      await runAction(
        { type: 'caption', target: { kind: 'project' }, parameters: { preset: presetId } },
        'AI · Generate captions',
      )
      toast.success('Caption timings detected from your audio', {
        description:
          'Text is left empty because transcription needs a speech-to-text provider. Select a caption clip to type it in.',
      })
    } catch (error) {
      toast.error('No captions were created', {
        description: error instanceof Error ? error.message : 'Nothing on your timeline changed.',
      })
    } finally {
      setBusy(null)
    }
  }

  function addShape(label: string, style: Partial<TextStyle>, content: string) {
    commit(`Add ${label}`, (draft) => {
      let timeline = draft.timeline
      let track = timeline.tracks.find((t) => t.kind === 'text')
      if (!track) {
        track = createTrack('text', 'Text')
        timeline = addTrack(timeline, track)
      }
      const clip = createTextClip(track.id, playhead, content, {
        duration: 3,
        preset: 'custom',
        style: resolveTextStyle(style),
        animation: 'slide-up',
        label,
      })
      return { ...draft, timeline: addClip(timeline, track.id, clip) }
    })
    toast.success(`${label} added at ${playhead.toFixed(1)}s`)
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-2.5">
        <section>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Captions
            </h3>
            <StatusPill status={captionStatus?.availability === 'ready' ? 'ready' : 'demo'} />
          </div>

          <div className="rounded-md border border-border bg-surface-2 p-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {captionStatus?.note ??
                'Timings come from real speech-activity detection on your decoded audio. The words need a speech-to-text provider.'}
            </p>
            {captionCount > 0 && (
              <Badge variant="success" className="mt-2">
                {captionCount} caption clip{captionCount === 1 ? '' : 's'} on the timeline
              </Badge>
            )}
          </div>

          <p className="mb-1.5 mt-2.5 text-[10px] text-muted-foreground">
            Choose a style, then generate:
          </p>
          <div className="space-y-1.5">
            {CAPTION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => void generateCaptions(preset.id)}
                disabled={busy !== null}
                className="flex w-full items-center gap-2.5 rounded-md border border-border bg-surface-2 p-2 text-left transition-colors hover:border-track-caption/50 hover:bg-surface-3 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="flex h-8 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-black px-1"
                  aria-hidden="true"
                >
                  <span
                    className="truncate text-[8px] leading-none"
                    style={{
                      color: preset.style.color ?? '#fff',
                      fontWeight: preset.style.fontWeight ?? 600,
                      textTransform: preset.style.uppercase ? 'uppercase' : 'none',
                      background:
                        (preset.style.backgroundOpacity ?? 0) > 0.4
                          ? (preset.style.backgroundColor ?? '#000')
                          : 'transparent',
                      padding: (preset.style.backgroundOpacity ?? 0) > 0.4 ? '2px 4px' : 0,
                      WebkitTextStroke:
                        (preset.style.strokeWidth ?? 0) > 0 ? `0.5px ${preset.style.strokeColor}` : undefined,
                    }}
                  >
                    Caption
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <Captions className="size-3 text-track-caption" aria-hidden="true" />
                    <span className="truncate text-2xs font-medium">{preset.name}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {preset.description}
                  </span>
                </span>
                {busy === preset.id && <Loader2 className="size-3 shrink-0 animate-spin text-ai" />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Overlays
          </h3>
          <div className="grid gap-1.5">
            <ElementButton
              icon={SquareDashedBottom}
              title="Title bar"
              description="Full-width bar across the lower third."
              onClick={() =>
                addShape(
                  'Title bar',
                  {
                    fontSize: 40,
                    fontWeight: 700,
                    align: 'left',
                    x: -0.3,
                    y: 0.66,
                    backgroundColor: '#08090B',
                    backgroundOpacity: 0.82,
                    paddingX: 32,
                    paddingY: 18,
                    maxWidth: 0.55,
                  },
                  'Title text',
                )
              }
            />
            <ElementButton
              icon={Shapes}
              title="Corner badge"
              description="Small ember chip in the top-left corner."
              onClick={() =>
                addShape(
                  'Corner badge',
                  {
                    fontSize: 24,
                    fontWeight: 800,
                    uppercase: true,
                    letterSpacing: 0.12,
                    align: 'left',
                    x: -0.36,
                    y: -0.4,
                    color: '#0B0B0D',
                    backgroundColor: '#FF6B35',
                    backgroundOpacity: 1,
                    paddingX: 14,
                    paddingY: 8,
                    maxWidth: 0.3,
                  },
                  'LIVE',
                )
              }
            />
            <ElementButton
              icon={Shapes}
              title="Centre plate"
              description="Dark plate behind centred text, for quotes and stats."
              onClick={() =>
                addShape(
                  'Centre plate',
                  {
                    fontSize: 56,
                    fontWeight: 700,
                    backgroundColor: '#08090B',
                    backgroundOpacity: 0.7,
                    paddingX: 40,
                    paddingY: 28,
                    maxWidth: 0.7,
                  },
                  'Your statement',
                )
              }
            />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            Overlays are text clips with a background plate, so every one is editable in the inspector.
          </p>
        </section>
      </div>
    </ScrollArea>
  )
}

function ElementButton({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Button
      variant="secondary"
      className="h-auto w-full justify-start gap-2.5 px-2.5 py-2 text-left"
      onClick={onClick}
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-2xs font-medium">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] font-normal text-muted-foreground">
          {description}
        </span>
      </span>
    </Button>
  )
}

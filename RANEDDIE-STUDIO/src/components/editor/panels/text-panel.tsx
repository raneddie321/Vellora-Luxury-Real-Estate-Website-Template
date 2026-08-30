'use client'

import { Type } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createTextClip, createTrack } from '@/lib/timeline/factories'
import { addClip, addTrack } from '@/lib/timeline/operations'
import { TEXT_PRESETS, resolveTextStyle } from '@/lib/text/presets'
import { useEditorStore } from '@/lib/store/editor-store'

export function TextPanel() {
  const project = useEditorStore((s) => s.project)
  const playhead = useEditorStore((s) => s.playhead)
  const commit = useEditorStore((s) => s.commit)
  const select = useEditorStore((s) => s.select)

  function addText(presetId: string, content: string) {
    if (!project) return
    const preset = TEXT_PRESETS.find((p) => p.id === presetId)
    let clipId = ''
    commit(`Add ${preset?.name ?? 'text'}`, (draft) => {
      let timeline = draft.timeline
      let track = timeline.tracks.find((t) => t.kind === 'text')
      if (!track) {
        track = createTrack('text', 'Text')
        timeline = addTrack(timeline, track)
      }
      const clip = createTextClip(track.id, playhead, content, {
        duration: 3,
        preset: presetId,
        style: resolveTextStyle(preset?.style),
        animation: preset?.animation ?? 'fade',
      })
      clipId = clip.id
      return { ...draft, timeline: addClip(timeline, track.id, clip) }
    })
    if (clipId) select([clipId])
    toast.success(`Added ${preset?.name ?? 'text'} at ${playhead.toFixed(1)}s`)
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2.5">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Presets drop a text clip at the playhead on the text track. Select the clip to edit its wording,
          font, position and animation in the inspector.
        </p>

        <div className="space-y-1.5">
          {TEXT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addText(preset.id, preset.sample)}
              className="group flex w-full items-center gap-3 rounded-md border border-border bg-surface-2 p-2.5 text-left transition-colors hover:border-track-text/50 hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background px-1 text-center"
                aria-hidden="true"
              >
                <span
                  className="truncate leading-none text-foreground"
                  style={{
                    fontFamily: preset.style.fontFamily ?? 'var(--font-sans)',
                    fontWeight: preset.style.fontWeight ?? 700,
                    fontSize: Math.max(7, Math.min(13, (preset.style.fontSize ?? 48) / 8)),
                    letterSpacing: `${(preset.style.letterSpacing ?? 0) * 8}px`,
                    textTransform: preset.style.uppercase ? 'uppercase' : 'none',
                  }}
                >
                  {preset.sample}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <Type className="size-3 text-track-text" aria-hidden="true" />
                  <span className="truncate text-2xs font-medium">{preset.name}</span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {preset.description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => addText('heading', 'Your text here')}
        >
          <Type /> Add custom text
        </Button>
      </div>
    </ScrollArea>
  )
}

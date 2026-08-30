'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Layers,
  Pause,
  Play,
  Redo2,
  SkipBack,
  SkipForward,
  Sparkles,
  Undo2,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { AssistantPanel } from './assistant/assistant-panel'
import { MediaPanel } from './panels/media-panel'
import { PreviewCanvas } from './preview/preview-canvas'
import { useEditorStore } from '@/lib/store/editor-store'
import { cn, formatTimecode } from '@/lib/utils'

type MobileTab = 'clips' | 'media' | 'ai'

/**
 * The mobile editor.
 *
 * A phone cannot host a multi-track timeline honestly, so it does not try. This
 * layout keeps what genuinely works on a small screen — preview, transport, a
 * linear clip list, media import and the assistant — and says plainly that the
 * full timeline lives on a larger screen.
 */
export function MobileEditor({ onExport }: { onExport: () => void }) {
  const project = useEditorStore((s) => s.project)
  const playhead = useEditorStore((s) => s.playhead)
  const playing = useEditorStore((s) => s.playing)
  const selection = useEditorStore((s) => s.selection)
  const history = useEditorStore((s) => s.history)

  const togglePlay = useEditorStore((s) => s.togglePlay)
  const stepFrames = useEditorStore((s) => s.stepFrames)
  const setPlayhead = useEditorStore((s) => s.setPlayhead)
  const select = useEditorStore((s) => s.select)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)

  const [tab, setTab] = useState<MobileTab>('clips')

  if (!project) return null
  const fps = project.settings.fps
  const duration = project.timeline.duration

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2.5">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <p className="min-w-0 flex-1 truncate text-xs font-medium">{project.name}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            const label = undo()
            if (label) toast.success(`Undid: ${label}`)
          }}
          disabled={history.past.length === 0}
          aria-label="Undo"
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            const label = redo()
            if (label) toast.success(`Redid: ${label}`)
          }}
          disabled={history.future.length === 0}
          aria-label="Redo"
        >
          <Redo2 />
        </Button>
        <Button size="sm" onClick={onExport}>
          <Download /> Export
        </Button>
      </header>

      <div className="shrink-0 bg-black">
        <PreviewCanvas className="aspect-video w-full" />
      </div>

      {/* Transport + scrubber */}
      <div className="shrink-0 space-y-2 border-b border-border bg-surface-1 px-3 py-2.5">
        <input
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={1 / fps}
          value={playhead}
          onChange={(event) => setPlayhead(Number(event.target.value))}
          aria-label="Timeline position"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-primary"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tabular text-muted-foreground">
            {formatTimecode(playhead, fps)} / {formatTimecode(duration, fps)}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => stepFrames(-1)} aria-label="Previous frame">
              <SkipBack />
            </Button>
            <Button
              variant={playing ? 'secondary' : 'default'}
              size="icon-sm"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => stepFrames(1)} aria-label="Next frame">
              <SkipForward />
            </Button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-surface-1 px-3 py-2">
        <Segmented
          aria-label="Mobile editor section"
          className="w-full [&>button]:flex-1"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'clips', label: <><Layers /> Clips</> },
            { value: 'media', label: <><Video /> Media</> },
            { value: 'ai', label: <><Sparkles /> RAN</> },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'clips' && (
          <div className="h-full overflow-y-auto p-3">
            <p className="mb-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              The multi-track timeline needs a larger screen. Here you can review the sequence in order,
              jump to any clip and let RAN make changes.
            </p>

            {project.timeline.tracks.map((track) =>
              track.clips.length === 0 ? null : (
                <section key={track.id} className="mb-4">
                  <h2 className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {track.name}
                  </h2>
                  <ul className="space-y-1">
                    {track.clips.map((clip) => (
                      <li key={clip.id}>
                        <button
                          onClick={() => {
                            select([clip.id])
                            setPlayhead(clip.start)
                          }}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors',
                            selection.includes(clip.id)
                              ? 'border-primary/50 bg-primary/10'
                              : 'border-border bg-surface-1 hover:bg-surface-2',
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium">
                              {clip.kind === 'text'
                                ? clip.content
                                : clip.kind === 'caption'
                                  ? clip.text || '(empty caption)'
                                  : clip.label}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] tabular text-muted-foreground">
                              {clip.start.toFixed(1)}s · {clip.duration.toFixed(1)}s
                            </span>
                          </span>
                          <Badge variant="outline" className="shrink-0 capitalize">
                            {clip.kind === 'media' ? clip.assetKind : clip.kind}
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}

        {tab === 'media' && (
          <div className="h-full">
            <MediaPanel />
          </div>
        )}

        {tab === 'ai' && (
          <div className="h-full">
            <AssistantPanel />
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AudioLines, KeyRound, Loader2, Music, ScissorsLineDashed, Volume2, Waves } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SliderField } from '@/components/ui/field'
import { StatusPill } from '@/components/ui/status-pill'
import { getAIProvider } from '@/lib/ai/registry'
import { updateClip } from '@/lib/timeline/operations'
import { useEditorStore, useSelectedMediaClip } from '@/lib/store/editor-store'
import type { MediaClip } from '@/lib/types'

export function AudioPanel() {
  const project = useEditorStore((s) => s.project)
  const selected = useSelectedMediaClip()
  const commit = useEditorStore((s) => s.commit)
  const runAction = useEditorStore((s) => s.runAction)
  const [busy, setBusy] = useState<string | null>(null)

  const capabilities = getAIProvider().capabilities()
  const musicStatus = capabilities.find((c) => c.capability === 'music-generation')
  const voiceStatus = capabilities.find((c) => c.capability === 'voice-generation')
  const sfxStatus = capabilities.find((c) => c.capability === 'sound-effects')

  const audioTracks = project?.timeline.tracks.filter((track) => track.kind === 'audio') ?? []
  const hasAudio = audioTracks.some((track) => track.clips.length > 0)

  async function run(id: string, label: string, fn: () => Promise<void>) {
    setBusy(id)
    try {
      await fn()
      toast.success(label)
    } catch (error) {
      toast.error('That did not complete', {
        description: error instanceof Error ? error.message : 'Nothing on your timeline changed.',
      })
    } finally {
      setBusy(null)
    }
  }

  const patchSelected = (label: string, patch: Partial<MediaClip>) => {
    if (!selected) return
    commit(label, (draft) => ({
      ...draft,
      timeline: updateClip<MediaClip>(draft.timeline, selected.id, patch),
    }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2.5">
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Clip audio
          </h3>
          {!selected ? (
            <EmptyState
              compact
              icon={Volume2}
              title="Select a clip"
              description="Gain, mute and fades apply to the selected clip."
            />
          ) : (
            <div className="space-y-3 rounded-md border border-border bg-surface-2 p-2.5">
              <p className="truncate text-2xs font-medium">{selected.label}</p>
              <SliderField
                label="Volume"
                value={selected.volume}
                min={0}
                max={2}
                step={0.01}
                format={(value) => `${Math.round(value * 100)}%`}
                onChange={(value) => patchSelected('Change volume', { volume: value })}
                disabled={selected.muted}
              />
              <SliderField
                label="Fade in"
                value={selected.fadeIn}
                min={0}
                max={Math.max(0.1, selected.duration / 2)}
                step={0.05}
                format={(value) => `${value.toFixed(2)}s`}
                onChange={(value) => patchSelected('Change fade in', { fadeIn: value })}
              />
              <SliderField
                label="Fade out"
                value={selected.fadeOut}
                min={0}
                max={Math.max(0.1, selected.duration / 2)}
                step={0.05}
                format={(value) => `${value.toFixed(2)}s`}
                onChange={(value) => patchSelected('Change fade out', { fadeOut: value })}
              />
              <Button
                size="sm"
                variant={selected.muted ? 'default' : 'secondary'}
                className="w-full"
                onClick={() => patchSelected(selected.muted ? 'Unmute clip' : 'Mute clip', { muted: !selected.muted })}
              >
                <Volume2 /> {selected.muted ? 'Unmute clip' : 'Mute clip'}
              </Button>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            AI audio actions
          </h3>
          <div className="space-y-1.5">
            <ActionRow
              icon={ScissorsLineDashed}
              title="Remove silence"
              description="Detects silent ranges in your decoded audio and ripple-deletes them across every track."
              status="ready"
              busy={busy === 'silence'}
              disabled={!hasAudio && !project?.timeline.tracks.some((t) => t.kind === 'video' && t.clips.length)}
              onRun={() =>
                run('silence', 'Silence removed', () =>
                  runAction(
                    { type: 'trim', target: { kind: 'all-audio' }, parameters: { mode: 'remove-silence' } },
                    'AI · Remove silence',
                  ),
                )
              }
            />
            <ActionRow
              icon={Waves}
              title="Enhance voice"
              description="Normalises clip gain to 90% and adds short fades so cuts do not click."
              status="ready"
              busy={busy === 'enhance'}
              disabled={!hasAudio}
              onRun={() =>
                run('enhance', 'Levels normalised', async () => {
                  await runAction(
                    { type: 'audio', target: { kind: 'all-audio' }, parameters: { action: 'normalize', gain: 0.9 } },
                    'AI · Enhance voice',
                  )
                  await runAction(
                    { type: 'fade', target: { kind: 'all-audio' }, parameters: { fadeIn: 0.15, fadeOut: 0.15 } },
                    'AI · Add audio fades',
                  )
                })
              }
            />
            <ActionRow
              icon={Music}
              title="Generate music"
              description={musicStatus?.note ?? 'Needs a music generation provider.'}
              status={musicStatus?.availability === 'ready' ? 'ready' : 'requires-api'}
              disabled={musicStatus?.availability !== 'ready'}
              busy={false}
              onRun={() => undefined}
            />
            <ActionRow
              icon={AudioLines}
              title="Generate sound effect"
              description={sfxStatus?.note ?? 'Needs a sound effect provider.'}
              status={sfxStatus?.availability === 'ready' ? 'ready' : 'requires-api'}
              disabled={sfxStatus?.availability !== 'ready'}
              busy={false}
              onRun={() => undefined}
            />
            <ActionRow
              icon={KeyRound}
              title="AI voice over"
              description={voiceStatus?.note ?? 'Needs a text-to-speech provider.'}
              status={voiceStatus?.availability === 'ready' ? 'ready' : 'requires-api'}
              disabled={voiceStatus?.availability !== 'ready'}
              busy={false}
              onRun={() => undefined}
            />
          </div>
        </section>
      </div>
    </ScrollArea>
  )
}

function ActionRow({
  icon: Icon,
  title,
  description,
  status,
  busy,
  disabled,
  onRun,
}: {
  icon: React.ElementType
  title: string
  description: string
  status: 'ready' | 'requires-api'
  busy: boolean
  disabled?: boolean
  onRun: () => void
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-2.5">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-2xs font-medium">{title}</p>
            <StatusPill status={status} className="shrink-0" />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {status === 'ready' ? (
        <Button size="xs" variant="secondary" className="mt-2 w-full" onClick={onRun} disabled={disabled || busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {busy ? 'Working…' : 'Run'}
        </Button>
      ) : (
        <Badge variant="warning" className="mt-2">
          Configure a provider in Settings › AI
        </Badge>
      )}
    </div>
  )
}

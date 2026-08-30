'use client'

import { ArrowLeftRight, Blend, Circle, Maximize, MoveRight, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SliderField } from '@/components/ui/field'
import { TRANSITIONS } from '@/lib/timeline/transitions'
import { createTransition } from '@/lib/timeline/factories'
import { updateClip } from '@/lib/timeline/operations'
import { useEditorStore, useSelectedMediaClip } from '@/lib/store/editor-store'
import type { MediaClip, TransitionType } from '@/lib/types'

const ICON: Record<TransitionType, React.ElementType> = {
  cut: Scissors,
  fade: Circle,
  dissolve: Blend,
  slide: MoveRight,
  zoom: Maximize,
}

export function TransitionsPanel() {
  const selected = useSelectedMediaClip()
  const commit = useEditorStore((s) => s.commit)
  const runAction = useEditorStore((s) => s.runAction)

  function applyTransition(type: TransitionType) {
    if (!selected) return
    const definition = TRANSITIONS.find((t) => t.type === type)
    commit(`Set ${definition?.name ?? type} transition`, (draft) => ({
      ...draft,
      timeline: updateClip<MediaClip>(draft.timeline, selected.id, (clip) => ({
        transitionIn:
          type === 'cut'
            ? undefined
            : createTransition(
                type,
                Math.min(definition?.defaultDuration ?? 0.5, clip.duration / 2),
                type === 'slide' ? 'left' : undefined,
              ),
      })),
    }))
    toast.success(`${definition?.name ?? type} applied to "${selected.label}"`)
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2.5">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          A transition belongs to the clip it opens. Select a clip and choose how it should arrive.
        </p>

        {!selected ? (
          <EmptyState
            compact
            icon={ArrowLeftRight}
            title="Select a clip"
            description="Transitions are set on the incoming clip. Pick one on the timeline."
          />
        ) : (
          <>
            <div className="rounded-md border border-border bg-surface-2 p-2.5">
              <p className="truncate text-2xs font-medium">{selected.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Currently:{' '}
                <span className="text-foreground">
                  {selected.transitionIn
                    ? `${TRANSITIONS.find((t) => t.type === selected.transitionIn?.type)?.name} · ${selected.transitionIn.duration.toFixed(2)}s`
                    : 'Cut'}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TRANSITIONS.map((transition) => {
                const Icon = ICON[transition.type]
                const active =
                  transition.type === 'cut'
                    ? !selected.transitionIn
                    : selected.transitionIn?.type === transition.type
                return (
                  <button
                    key={transition.type}
                    onClick={() => applyTransition(transition.type)}
                    className={`rounded-md border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-surface-2 hover:border-primary/40 hover:bg-surface-3'
                    }`}
                  >
                    <Icon
                      className={`size-3.5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                      aria-hidden="true"
                    />
                    <p className="mt-1.5 text-2xs font-medium">{transition.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                      {transition.description}
                    </p>
                  </button>
                )
              })}
            </div>

            {selected.transitionIn && (
              <div className="rounded-md border border-border bg-surface-2 p-2.5">
                <SliderField
                  label="Duration"
                  value={selected.transitionIn.duration}
                  min={0.1}
                  max={Math.max(0.2, selected.duration / 2)}
                  step={0.05}
                  format={(value) => `${value.toFixed(2)}s`}
                  onChange={(value) =>
                    commit('Change transition duration', (draft) => ({
                      ...draft,
                      timeline: updateClip<MediaClip>(draft.timeline, selected.id, (clip) => ({
                        transitionIn: clip.transitionIn
                          ? { ...clip.transitionIn, duration: value }
                          : undefined,
                      })),
                    }))
                  }
                />
                {selected.transitionIn.type === 'slide' && (
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {(['left', 'right', 'up', 'down'] as const).map((direction) => (
                      <Button
                        key={direction}
                        size="xs"
                        variant={selected.transitionIn?.direction === direction ? 'default' : 'secondary'}
                        onClick={() =>
                          commit('Change slide direction', (draft) => ({
                            ...draft,
                            timeline: updateClip<MediaClip>(draft.timeline, selected.id, (clip) => ({
                              transitionIn: clip.transitionIn
                                ? { ...clip.transitionIn, direction }
                                : undefined,
                            })),
                          }))
                        }
                        className="capitalize"
                      >
                        {direction}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="rounded-md border border-border bg-surface-2 p-2.5">
          <div className="flex items-center gap-2">
            <p className="text-2xs font-semibold">Apply to every cut</p>
            <Badge variant="ai">AI action</Badge>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Adds a short dissolve between every pair of adjacent clips on the video tracks.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2 w-full"
            onClick={async () => {
              try {
                await runAction(
                  {
                    type: 'transition',
                    target: { kind: 'all-video' },
                    parameters: { transitionType: 'dissolve', duration: 0.3, position: 'between' },
                  },
                  'Add dissolves between clips',
                )
                toast.success('Dissolves added between every cut')
              } catch (error) {
                toast.error('Could not add transitions', {
                  description: error instanceof Error ? error.message : undefined,
                })
              }
            }}
          >
            <Blend /> Blend all cuts
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}

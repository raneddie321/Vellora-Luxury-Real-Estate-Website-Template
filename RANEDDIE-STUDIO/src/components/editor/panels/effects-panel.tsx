'use client'

import { useMemo } from 'react'
import { Droplet, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EFFECT_DEFINITIONS, EFFECT_PRESETS } from '@/lib/effects'
import { createEffect } from '@/lib/timeline/factories'
import { updateClip } from '@/lib/timeline/operations'
import { useEditorStore, useSelectedMediaClip } from '@/lib/store/editor-store'
import type { EffectType, MediaClip } from '@/lib/types'

export function EffectsPanel() {
  const selected = useSelectedMediaClip()
  const commit = useEditorStore((s) => s.commit)

  const grouped = useMemo(() => {
    const map = new Map<EffectType, typeof EFFECT_PRESETS>()
    for (const preset of EFFECT_PRESETS) {
      const list = map.get(preset.type) ?? []
      list.push(preset)
      map.set(preset.type, list)
    }
    return [...map.entries()]
  }, [])

  function applyPreset(presetId: string) {
    const preset = EFFECT_PRESETS.find((p) => p.id === presetId)
    if (!preset || !selected) return
    commit(`Add ${preset.name}`, (draft) => ({
      ...draft,
      timeline: updateClip<MediaClip>(draft.timeline, selected.id, (clip) => ({
        effects: [
          ...clip.effects.filter((effect) => effect.type !== preset.type),
          createEffect(preset.type, preset.params, preset.name, preset.id),
        ],
      })),
    }))
    toast.success(`${preset.name} applied to "${selected.label}"`)
  }

  function removeEffect(effectId: string) {
    if (!selected) return
    commit('Remove effect', (draft) => ({
      ...draft,
      timeline: updateClip<MediaClip>(draft.timeline, selected.id, (clip) => ({
        effects: clip.effects.filter((effect) => effect.id !== effectId),
      })),
    }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2.5">
        {!selected ? (
          <EmptyState
            compact
            icon={Sparkles}
            title="Select a clip"
            description="Effects apply to a single clip. Choose one on the timeline first."
          />
        ) : (
          <>
            <div className="rounded-md border border-border bg-surface-2 p-2.5">
              <p className="truncate text-2xs font-medium">{selected.label}</p>
              {selected.effects.length === 0 ? (
                <p className="mt-1 text-[10px] text-muted-foreground">No effects on this clip yet.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {selected.effects.map((effect) => (
                    <li
                      key={effect.id}
                      className="flex items-center gap-2 rounded border border-border bg-surface-1 px-2 py-1.5"
                    >
                      <Droplet className="size-3 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{effect.name}</span>
                      {EFFECT_DEFINITIONS[effect.type].cost === 'high' && (
                        <Badge variant="warning" className="shrink-0">
                          Heavy
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeEffect(effect.id)}
                        aria-label={`Remove ${effect.name}`}
                        className="shrink-0 hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Adjust parameters in the inspector on the right.
              </p>
            </div>

            {grouped.map(([type, presets]) => {
              const definition = EFFECT_DEFINITIONS[type]
              return (
                <section key={type}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {definition.label}
                    </h3>
                    {definition.stage === 'pixel' && (
                      <Badge variant="warning">Skipped in Draft preview</Badge>
                    )}
                  </div>
                  <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                    {definition.description}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        title={preset.description}
                        className="rounded-md border border-border bg-surface-2 p-2 text-left transition-colors hover:border-primary/50 hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <p className="truncate text-2xs font-medium">{preset.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </div>
    </ScrollArea>
  )
}

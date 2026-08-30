'use client'

import { Lock, LockOpen, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, SliderField } from '@/components/ui/field'
import { Input, Textarea } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EFFECT_DEFINITIONS, formatEffectParam } from '@/lib/effects'
import { updateClip } from '@/lib/timeline/operations'
import { FONT_OPTIONS } from '@/lib/text/presets'
import { useEditorStore } from '@/lib/store/editor-store'
import type {
  CaptionClip,
  Clip,
  MediaClip,
  TextAnimation,
  TextClip,
  TextStyle,
  Track,
} from '@/lib/types'
import { formatDuration } from '@/lib/utils'

export function ClipInspector({ clip, track }: { clip: Clip; track: Track }) {
  const commit = useEditorStore((s) => s.commit)
  const setClipSpeed = useEditorStore((s) => s.setClipSpeed)
  const setClipDuration = useEditorStore((s) => s.setClipDuration)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const project = useEditorStore((s) => s.project)

  const asset = clip.kind === 'media' ? project?.assets.find((a) => a.id === clip.assetId) : undefined

  const patch = <T extends Clip>(label: string, changes: Partial<T> | ((current: T) => Partial<T>)) =>
    commit(label, (draft) => ({
      ...draft,
      timeline: updateClip<T>(draft.timeline, clip.id, changes),
    }))

  const patchStyle = (changes: Partial<TextStyle>) =>
    patch<TextClip | CaptionClip>('Edit text style', (current) => ({
      style: { ...current.style, ...changes },
    }))

  return (
    <div className="space-y-4 p-3">
      <header className="space-y-1.5">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-semibold">{clip.label || clip.kind}</p>
          <Badge variant="outline" className="shrink-0 capitalize">
            {clip.kind === 'media' ? clip.assetKind : clip.kind}
          </Badge>
        </div>
        <p className="font-mono text-[10px] tabular text-muted-foreground">
          {clip.start.toFixed(2)}s → {(clip.start + clip.duration).toFixed(2)}s ·{' '}
          {formatDuration(clip.duration)} · {track.name}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Start" htmlFor="clip-start">
          <Input
            id="clip-start"
            type="number"
            min={0}
            step={0.05}
            value={clip.start.toFixed(2)}
            onChange={(event) => patch('Move clip', { start: Number(event.target.value) })}
            className="h-8 font-mono text-xs"
          />
        </Field>
        <Field label="Duration" htmlFor="clip-duration">
          <Input
            id="clip-duration"
            type="number"
            min={0.1}
            step={0.05}
            value={clip.duration.toFixed(2)}
            onChange={(event) => setClipDuration(clip.id, Number(event.target.value))}
            className="h-8 font-mono text-xs"
          />
        </Field>
      </div>

      {clip.kind === 'media' && (
        <MediaClipFields
          clip={clip}
          maxSource={asset?.duration}
          onPatch={(label, changes) => patch<MediaClip>(label, changes)}
          onSpeed={(speed) => setClipSpeed(clip.id, speed)}
        />
      )}

      {(clip.kind === 'text' || clip.kind === 'caption') && (
        <TextClipFields clip={clip} onPatch={patch} onStyle={patchStyle} />
      )}

      {clip.kind === 'placeholder' && (
        <div className="rounded-md border border-dashed border-border bg-surface-2 p-3 text-center">
          <p className="text-2xs font-medium">Template slot</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            {clip.hint}. Drag an asset from the Media panel onto this clip to fill it.
          </p>
        </div>
      )}

      <Separator />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => patch(clip.locked ? 'Unlock clip' : 'Lock clip', { locked: !clip.locked })}
        >
          {clip.locked ? <LockOpen /> : <Lock />}
          {clip.locked ? 'Unlock' : 'Lock'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 hover:text-destructive"
          onClick={() => deleteSelected(false)}
        >
          <Trash2 /> Delete
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function MediaClipFields({
  clip,
  maxSource,
  onPatch,
  onSpeed,
}: {
  clip: MediaClip
  maxSource?: number
  onPatch: (label: string, changes: Partial<MediaClip> | ((c: MediaClip) => Partial<MediaClip>)) => void
  onSpeed: (speed: number) => void
}) {
  const commit = useEditorStore((s) => s.commit)

  return (
    <>
      <Separator />
      <section className="space-y-3">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Transform
        </h3>
        <SliderField
          label="Scale"
          value={clip.transform.scale}
          min={0.1}
          max={4}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) =>
            onPatch('Scale clip', (current) => ({ transform: { ...current.transform, scale: value } }))
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <SliderField
            label="Position X"
            value={clip.transform.x}
            min={-1}
            max={1}
            step={0.005}
            format={(v) => v.toFixed(2)}
            onChange={(value) =>
              onPatch('Move clip', (current) => ({ transform: { ...current.transform, x: value } }))
            }
          />
          <SliderField
            label="Position Y"
            value={clip.transform.y}
            min={-1}
            max={1}
            step={0.005}
            format={(v) => v.toFixed(2)}
            onChange={(value) =>
              onPatch('Move clip', (current) => ({ transform: { ...current.transform, y: value } }))
            }
          />
        </div>
        <SliderField
          label="Rotation"
          value={clip.transform.rotation}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(value) =>
            onPatch('Rotate clip', (current) => ({ transform: { ...current.transform, rotation: value } }))
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {(['top', 'bottom', 'left', 'right'] as const).map((edge) => (
            <SliderField
              key={edge}
              label={`Crop ${edge}`}
              value={clip.transform.crop[edge]}
              min={0}
              max={0.45}
              step={0.005}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(value) =>
                onPatch('Crop clip', (current) => ({
                  transform: { ...current.transform, crop: { ...current.transform.crop, [edge]: value } },
                }))
              }
            />
          ))}
        </div>
      </section>

      <Separator />
      <section className="space-y-3">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Timing</h3>
        <SliderField
          label="Speed"
          value={clip.speed}
          min={0.1}
          max={4}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={onSpeed}
        />
        <SliderField
          label="Opacity"
          value={clip.opacity}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => onPatch('Change opacity', { opacity: value })}
        />
        {maxSource !== undefined && clip.assetKind !== 'image' && (
          <p className="font-mono text-[10px] tabular text-muted-foreground">
            Source in {clip.inPoint.toFixed(2)}s / out {clip.outPoint.toFixed(2)}s of{' '}
            {maxSource.toFixed(2)}s
          </p>
        )}
      </section>

      {clip.assetKind !== 'image' && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Audio
            </h3>
            <SliderField
              label="Volume"
              value={clip.volume}
              min={0}
              max={2}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(value) => onPatch('Change volume', { volume: value })}
              disabled={clip.muted}
            />
            <div className="grid grid-cols-2 gap-2">
              <SliderField
                label="Fade in"
                value={clip.fadeIn}
                min={0}
                max={Math.max(0.1, clip.duration / 2)}
                step={0.05}
                format={(v) => `${v.toFixed(2)}s`}
                onChange={(value) => onPatch('Change fade in', { fadeIn: value })}
              />
              <SliderField
                label="Fade out"
                value={clip.fadeOut}
                min={0}
                max={Math.max(0.1, clip.duration / 2)}
                step={0.05}
                format={(v) => `${v.toFixed(2)}s`}
                onChange={(value) => onPatch('Change fade out', { fadeOut: value })}
              />
            </div>
            <Button
              size="xs"
              variant={clip.muted ? 'default' : 'secondary'}
              className="w-full"
              onClick={() => onPatch(clip.muted ? 'Unmute clip' : 'Mute clip', { muted: !clip.muted })}
            >
              {clip.muted ? 'Unmute' : 'Mute'}
            </Button>
          </section>
        </>
      )}

      {clip.effects.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Effects
            </h3>
            {clip.effects.map((effect) => {
              const definition = EFFECT_DEFINITIONS[effect.type]
              return (
                <div key={effect.id} className="rounded-md border border-border bg-surface-2 p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="truncate text-2xs font-medium">{effect.name}</p>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${effect.name}`}
                      onClick={() =>
                        commit('Remove effect', (draft) => ({
                          ...draft,
                          timeline: updateClip<MediaClip>(draft.timeline, clip.id, (current) => ({
                            effects: current.effects.filter((e) => e.id !== effect.id),
                          })),
                        }))
                      }
                      className="hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {definition.params.map((spec) => (
                      <SliderField
                        key={spec.key}
                        label={spec.label}
                        value={effect.params[spec.key] ?? spec.default}
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        format={(value) => formatEffectParam(spec, value)}
                        onChange={(value) =>
                          onPatch('Adjust effect', (current) => ({
                            effects: current.effects.map((e) =>
                              e.id === effect.id ? { ...e, params: { ...e.params, [spec.key]: value } } : e,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        </>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */

function TextClipFields({
  clip,
  onPatch,
  onStyle,
}: {
  clip: TextClip | CaptionClip
  onPatch: <T extends Clip>(label: string, changes: Partial<T>) => void
  onStyle: (changes: Partial<TextStyle>) => void
}) {
  const style = clip.style
  return (
    <>
      <Separator />
      <Field label={clip.kind === 'caption' ? 'Caption text' : 'Content'} htmlFor="clip-text">
        <Textarea
          id="clip-text"
          value={clip.kind === 'text' ? clip.content : clip.text}
          onChange={(event) =>
            clip.kind === 'text'
              ? onPatch<TextClip>('Edit text', { content: event.target.value, label: event.target.value.slice(0, 32) })
              : onPatch<CaptionClip>('Edit caption', { text: event.target.value, label: event.target.value.slice(0, 32) })
          }
          rows={3}
          className="text-xs"
          placeholder={clip.kind === 'caption' ? 'Type what is said here…' : 'Your text'}
        />
      </Field>

      <section className="space-y-3">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Type</h3>
        <Field label="Font" htmlFor="clip-font">
          <Select value={style.fontFamily} onValueChange={(value) => onStyle({ fontFamily: value })}>
            <SelectTrigger id="clip-font" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <SliderField
          label="Size"
          value={style.fontSize}
          min={12}
          max={200}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onChange={(value) => onStyle({ fontSize: value })}
        />
        <SliderField
          label="Weight"
          value={style.fontWeight}
          min={100}
          max={900}
          step={100}
          format={(v) => String(v)}
          onChange={(value) => onStyle({ fontWeight: value })}
        />
        <SliderField
          label="Letter spacing"
          value={style.letterSpacing}
          min={-0.05}
          max={0.4}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={(value) => onStyle({ letterSpacing: value })}
        />

        <Field label="Alignment">
          <Segmented
            aria-label="Text alignment"
            size="sm"
            className="w-full [&>button]:flex-1"
            value={style.align}
            onChange={(value) => onStyle({ align: value as TextStyle['align'] })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Colour" htmlFor="clip-color">
            <input
              id="clip-color"
              type="color"
              value={style.color}
              onChange={(event) => onStyle({ color: event.target.value })}
              className="h-8 w-full cursor-pointer rounded border border-input bg-surface-2 p-0.5"
              aria-label="Text colour"
            />
          </Field>
          <Field label="Plate" htmlFor="clip-bg">
            <input
              id="clip-bg"
              type="color"
              value={style.backgroundColor}
              onChange={(event) => onStyle({ backgroundColor: event.target.value })}
              className="h-8 w-full cursor-pointer rounded border border-input bg-surface-2 p-0.5"
              aria-label="Background plate colour"
            />
          </Field>
        </div>

        <SliderField
          label="Plate opacity"
          value={style.backgroundOpacity}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => onStyle({ backgroundOpacity: value })}
        />
        <SliderField
          label="Shadow"
          value={style.shadow}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => onStyle({ shadow: value })}
        />
        <SliderField
          label="Stroke"
          value={style.strokeWidth}
          min={0}
          max={20}
          step={0.5}
          format={(v) => `${v}px`}
          onChange={(value) => onStyle({ strokeWidth: value })}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Position
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <SliderField
            label="X"
            value={style.x}
            min={-0.5}
            max={0.5}
            step={0.005}
            format={(v) => v.toFixed(2)}
            onChange={(value) => onStyle({ x: value })}
          />
          <SliderField
            label="Y"
            value={style.y}
            min={-0.5}
            max={0.5}
            step={0.005}
            format={(v) => v.toFixed(2)}
            onChange={(value) => onStyle({ y: value })}
          />
        </div>
        <SliderField
          label="Max width"
          value={style.maxWidth}
          min={0.2}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(value) => onStyle({ maxWidth: value })}
        />
      </section>

      {clip.kind === 'text' && (
        <Field label="Animation" htmlFor="clip-animation">
          <Select
            value={clip.animation}
            onValueChange={(value) => onPatch<TextClip>('Change animation', { animation: value as TextAnimation })}
          >
            <SelectTrigger id="clip-animation" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide-up">Slide up</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="typewriter">Typewriter</SelectItem>
              <SelectItem value="blur-in">Blur in</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
    </>
  )
}

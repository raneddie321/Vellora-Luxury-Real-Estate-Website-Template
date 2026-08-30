'use client'

import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { compositionSizeFor } from '@/lib/media/composition'
import { useEditorStore } from '@/lib/store/editor-store'
import type { AspectRatio, Fps, ResolutionPreset } from '@/lib/types'
import { formatDuration, pluralize } from '@/lib/utils'

export function ProjectInspector() {
  const project = useEditorStore((s) => s.project)
  const updateSettings = useEditorStore((s) => s.updateSettings)
  const renameProject = useEditorStore((s) => s.renameProject)

  if (!project) return null
  const size = compositionSizeFor(project.settings)
  const clipCount = project.timeline.tracks.reduce((n, track) => n + track.clips.length, 0)

  return (
    <div className="space-y-4 p-3">
      <Field label="Project name" htmlFor="inspector-name">
        <Input
          id="inspector-name"
          defaultValue={project.name}
          onBlur={(event) => {
            const value = event.target.value.trim()
            if (value && value !== project.name) renameProject(value)
          }}
          className="h-8 text-xs"
          maxLength={80}
        />
      </Field>

      <Field label="Aspect ratio">
        <Segmented
          aria-label="Aspect ratio"
          size="sm"
          className="w-full [&>button]:flex-1"
          value={project.settings.aspectRatio}
          onChange={(value) => updateSettings({ aspectRatio: value as AspectRatio })}
          options={[
            { value: '16:9', label: '16:9' },
            { value: '9:16', label: '9:16' },
            { value: '1:1', label: '1:1' },
            { value: '4:5', label: '4:5' },
          ]}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Resolution" htmlFor="inspector-resolution">
          <Select
            value={project.settings.resolution}
            onValueChange={(value) => updateSettings({ resolution: value as ResolutionPreset })}
          >
            <SelectTrigger id="inspector-resolution" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="4K">4K</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Frame rate" htmlFor="inspector-fps">
          <Select
            value={String(project.settings.fps)}
            onValueChange={(value) => updateSettings({ fps: Number(value) as Fps })}
          >
            <SelectTrigger id="inspector-fps" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 fps</SelectItem>
              <SelectItem value="25">25 fps</SelectItem>
              <SelectItem value="30">30 fps</SelectItem>
              <SelectItem value="60">60 fps</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Background" htmlFor="inspector-bg" hint="Shown behind letterboxing and in gaps.">
        <div className="flex items-center gap-2">
          <input
            id="inspector-bg"
            type="color"
            value={project.settings.backgroundColor}
            onChange={(event) => updateSettings({ backgroundColor: event.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-input bg-surface-2 p-0.5"
            aria-label="Background colour"
          />
          <Input
            value={project.settings.backgroundColor}
            onChange={(event) => updateSettings({ backgroundColor: event.target.value })}
            className="h-8 flex-1 font-mono text-xs"
            aria-label="Background colour hex value"
          />
        </div>
      </Field>

      <div className="rounded-md border border-border bg-surface-2 p-2.5">
        <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Summary</p>
        <dl className="mt-2 space-y-1.5 text-2xs">
          <Row label="Composition" value={`${size.width} × ${size.height}`} />
          <Row label="Duration" value={formatDuration(project.timeline.duration)} />
          <Row label="Tracks" value={String(project.timeline.tracks.length)} />
          <Row label="Clips" value={String(clipCount)} />
          <Row label="Assets" value={pluralize(project.assets.length, 'file')} />
        </dl>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2">
        <Info className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Changing the aspect ratio re-letterboxes existing clips. Ask RAN to &ldquo;convert to
          9:16&rdquo; instead and it will re-frame them to fill the new shape.
        </p>
      </div>

      {project.isDemo && <Badge variant="ai">Demo project · media generated on this device</Badge>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular text-foreground">{value}</dd>
    </div>
  )
}

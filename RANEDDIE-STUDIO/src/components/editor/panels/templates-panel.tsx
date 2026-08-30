'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates'
import { useEditorStore } from '@/lib/store/editor-store'
import type { Template } from '@/lib/types'
import { cn, formatDuration } from '@/lib/utils'

export function TemplatesPanel() {
  const project = useEditorStore((s) => s.project)
  const applyTemplateToProject = useEditorStore((s) => s.applyTemplateToProject)
  const [category, setCategory] = useState<string>('All')
  const [pending, setPending] = useState<Template | null>(null)

  const visible = useMemo(
    () => (category === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)),
    [category],
  )

  const clipCount =
    project?.timeline.tracks.reduce((total, track) => total + track.clips.length, 0) ?? 0

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar shrink-0 overflow-x-auto border-b border-border p-2">
        <div className="flex gap-1" role="tablist" aria-label="Template categories">
          {['All', ...TEMPLATE_CATEGORIES].map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              onClick={() => setCategory(item)}
              className={cn(
                'shrink-0 rounded-full border px-2 py-1 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                category === item
                  ? 'border-primary/40 bg-primary/12 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1.5 p-2.5">
          {visible.map((template) => (
            <button
              key={template.id}
              onClick={() => setPending(template)}
              className="flex w-full gap-2.5 rounded-md border border-border bg-surface-2 p-2 text-left transition-colors hover:border-primary/40 hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="h-11 w-16 shrink-0 rounded border border-border"
                style={{
                  background: `linear-gradient(140deg, ${template.gradient[0]}, ${template.gradient[1]})`,
                }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-2xs font-medium">{template.name}</span>
                  <Badge variant="outline" className="shrink-0">
                    {template.aspectRatio}
                  </Badge>
                </span>
                <span className="mt-0.5 block line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                  {template.description}
                </span>
                <span className="mt-1 block font-mono text-[9px] tabular text-muted-foreground/70">
                  {formatDuration(template.duration)} · {template.category}
                </span>
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="size-4" /> Apply &ldquo;{pending?.name}&rdquo;?
            </DialogTitle>
            <DialogDescription>
              This replaces the current timeline with the template&rsquo;s structure and switches the project
              to {pending?.aspectRatio} at {pending?.blueprint.fps} fps. Your media library is untouched, and
              matching assets are placed into the template&rsquo;s slots automatically.
            </DialogDescription>
          </DialogHeader>

          {clipCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/[0.07] px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-2xs leading-relaxed">
                Your timeline currently has {clipCount} clip{clipCount === 1 ? '' : 's'}. They will be
                replaced — but this is a normal edit, so ⌘/Ctrl+Z undoes it.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pending) return
                applyTemplateToProject(pending)
                toast.success(`"${pending.name}" applied`, {
                  description: 'Drop media onto the labelled slots to fill them.',
                })
                setPending(null)
              }}
            >
              <LayoutTemplate /> Apply template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

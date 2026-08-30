'use client'

import { MousePointerClick, Sliders } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClipInspector } from './clip-inspector'
import { ProjectInspector } from './project-inspector'
import { useEditorStore, useSelectedClip } from '@/lib/store/editor-store'

export function InspectorPanel() {
  const selected = useSelectedClip()
  const selection = useEditorStore((s) => s.selection)

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border bg-surface-1">
      <div className="panel-header">
        <span className="panel-title inline-flex items-center gap-1.5">
          <Sliders className="size-3" aria-hidden="true" />
          {selected ? 'Clip' : 'Project'}
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {selection.length > 1 ? (
          <EmptyState
            compact
            icon={MousePointerClick}
            title={`${selection.length} clips selected`}
            description="Select a single clip to edit its properties, or use the AI panel to act on the whole selection."
          />
        ) : selected ? (
          <ClipInspector clip={selected.clip} track={selected.track} />
        ) : (
          <ProjectInspector />
        )}
      </ScrollArea>
    </div>
  )
}

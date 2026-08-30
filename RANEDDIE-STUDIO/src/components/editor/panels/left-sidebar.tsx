'use client'

import {
  ArrowLeftRight,
  AudioLines,
  LayoutTemplate,
  Shapes,
  Sparkles,
  Type,
  Video,
  Wand2,
} from 'lucide-react'
import { MediaPanel } from './media-panel'
import { TextPanel } from './text-panel'
import { AudioPanel } from './audio-panel'
import { EffectsPanel } from './effects-panel'
import { TransitionsPanel } from './transitions-panel'
import { ElementsPanel } from './elements-panel'
import { TemplatesPanel } from './templates-panel'
import { AIActionsPanel } from './ai-actions-panel'
import { useUIStore } from '@/lib/store/ui-store'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'media', label: 'Media', icon: Video, Panel: MediaPanel },
  { id: 'ai', label: 'AI', icon: Sparkles, Panel: AIActionsPanel },
  { id: 'text', label: 'Text', icon: Type, Panel: TextPanel },
  { id: 'audio', label: 'Audio', icon: AudioLines, Panel: AudioPanel },
  { id: 'effects', label: 'Effects', icon: Wand2, Panel: EffectsPanel },
  { id: 'transitions', label: 'Transitions', icon: ArrowLeftRight, Panel: TransitionsPanel },
  { id: 'elements', label: 'Elements', icon: Shapes, Panel: ElementsPanel },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, Panel: TemplatesPanel },
] as const

export function LeftSidebar() {
  const active = useUIStore((s) => s.leftPanelTab)
  const setActive = useUIStore((s) => s.setLeftPanelTab)
  const current = TABS.find((tab) => tab.id === active) ?? TABS[0]
  const Panel = current.Panel

  return (
    <div className="flex h-full min-h-0">
      {/* Rail */}
      <nav
        aria-label="Editor panels"
        className="flex w-[62px] shrink-0 flex-col gap-0.5 border-r border-border bg-surface-1 p-1.5"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const selected = tab.id === current.id
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? tab.id === 'ai'
                    ? 'bg-ai/12 text-ai'
                    : 'bg-surface-3 text-foreground'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-[9px] font-medium leading-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Panel */}
      <div className="flex w-[268px] min-w-0 shrink-0 flex-col border-r border-border bg-surface-1">
        <div className="panel-header">
          <span className="panel-title">{current.label}</span>
        </div>
        <div className="min-h-0 flex-1">
          <Panel />
        </div>
      </div>
    </div>
  )
}

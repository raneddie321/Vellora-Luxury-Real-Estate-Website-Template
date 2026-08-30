'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Loader2, Minimize2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AssistantPanel } from './assistant/assistant-panel'
import { CommandBar } from './command-bar'
import { ExportDialog } from './export-dialog'
import { InspectorPanel } from './inspector/inspector-panel'
import { LeftSidebar } from './panels/left-sidebar'
import { PreviewCanvas } from './preview/preview-canvas'
import { Transport } from './preview/transport'
import { TimelinePanel } from './timeline/timeline-panel'
import { EditorTopBar } from './top-bar'
import { useEditorShortcuts } from './use-editor-shortcuts'
import { MobileEditor } from './mobile-editor'
import { unlockAudio } from '@/lib/media/audio'
import { useEditorStore } from '@/lib/store/editor-store'
import { useUIStore } from '@/lib/store/ui-store'
import { cn } from '@/lib/utils'

/**
 * The editor shell.
 *
 * Desktop gets the full three-column layout. Below `xl` the assistant collapses
 * to a toggle; below `lg` we hand over to a purpose-built mobile layout rather
 * than trying to squeeze a multi-track timeline onto a phone.
 */
export function EditorView({ projectId }: { projectId: string }) {
  const project = useEditorStore((s) => s.project)
  const status = useEditorStore((s) => s.status)
  const error = useEditorStore((s) => s.error)
  const loadProject = useEditorStore((s) => s.loadProject)
  const closeProject = useEditorStore((s) => s.closeProject)

  const assistantOpen = useUIStore((s) => s.assistantOpen)
  const setAssistantOpen = useUIStore((s) => s.setAssistantOpen)

  const [exportOpen, setExportOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const openExport = useCallback(() => setExportOpen(true), [])
  useEditorShortcuts({ onExport: openExport })

  useEffect(() => {
    void loadProject(projectId)
    return () => closeProject()
  }, [projectId, loadProject, closeProject])

  // Browsers gate audio behind a gesture; take the first one we get.
  useEffect(() => {
    const unlock = () => void unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const element = stageRef.current
    if (!element) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setFullscreen(false)
      } else {
        await element.requestFullscreen()
        setFullscreen(true)
      }
    } catch {
      // Fullscreen refused (permissions policy) — fall back to the inline view.
      setFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex h-dvh flex-col gap-2 p-3">
        <Skeleton className="h-12" />
        <div className="flex min-h-0 flex-1 gap-2">
          <Skeleton className="w-[330px] shrink-0" />
          <Skeleton className="flex-1" />
          <Skeleton className="hidden w-[320px] shrink-0 xl:block" />
        </div>
        <Skeleton className="h-56" />
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Opening project…
        </p>
      </div>
    )
  }

  if (status === 'error' || !project) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-semibold">This project could not be opened</h1>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted-foreground">
            {error ?? 'It may have been deleted, or this browser holds no copy of it.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/projects">
              <ArrowLeft /> All projects
            </Link>
          </Button>
          <Button onClick={() => void loadProject(projectId)}>Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile / tablet */}
      <div className="lg:hidden">
        <MobileEditor onExport={openExport} />
      </div>

      {/* Desktop */}
      <div className="hidden h-dvh flex-col overflow-hidden bg-background lg:flex">
        <EditorTopBar onExport={openExport} onPreview={() => void toggleFullscreen()} />

        <div className="flex min-h-0 flex-1">
          <LeftSidebar />

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                ref={stageRef}
                className={cn(
                  'relative flex min-h-0 flex-1 flex-col bg-[#08090b]',
                  fullscreen && 'bg-black',
                )}
              >
                <PreviewCanvas className="flex-1 p-4" />
                {fullscreen && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void toggleFullscreen()}
                    className="absolute right-4 top-4"
                  >
                    <Minimize2 /> Exit fullscreen
                  </Button>
                )}
                {!fullscreen && <Transport onFullscreen={() => void toggleFullscreen()} />}
              </div>

              <div className="h-[38%] min-h-[188px]">
                <TimelinePanel />
              </div>
            </div>
          </main>

          <div className="hidden w-[300px] shrink-0 xl:block">
            <InspectorPanel />
          </div>

          {assistantOpen && (
            <div className="w-[330px] shrink-0">
              <AssistantPanel onClose={() => setAssistantOpen(false)} />
            </div>
          )}
        </div>

        {!assistantOpen && (
          <Button
            variant="ai"
            size="sm"
            onClick={() => setAssistantOpen(true)}
            className="fixed bottom-5 right-5 z-40 shadow-glow-ai"
          >
            <Sparkles /> Ask RAN
          </Button>
        )}
      </div>

      {/* Mounted on demand so it always opens seeded with the current project. */}
      {exportOpen && <ExportDialog open onOpenChange={setExportOpen} />}
      <CommandBar onExport={openExport} />
    </>
  )
}

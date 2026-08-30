'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Cloud,
  Download,
  Eye,
  Loader2,
  Redo2,
  Share2,
  Sparkles,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { LogoMark } from '@/components/brand/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Hint } from '@/components/ui/tooltip'
import { useCreditsStore } from '@/lib/store/credits-store'
import { useEditorStore } from '@/lib/store/editor-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useModKey } from '@/hooks/use-mod-key'
import { formatRelativeTime } from '@/lib/utils'

export function EditorTopBar({
  onExport,
  onPreview,
}: {
  onExport: () => void
  onPreview: () => void
}) {
  const project = useEditorStore((s) => s.project)
  const saving = useEditorStore((s) => s.saving)
  const savedAt = useEditorStore((s) => s.savedAt)
  const history = useEditorStore((s) => s.history)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const renameProject = useEditorStore((s) => s.renameProject)

  const balance = useCreditsStore((s) => s.balance)
  const toggleCommandBar = useUIStore((s) => s.toggleCommandBar)
  const assistantOpen = useUIStore((s) => s.assistantOpen)
  const setAssistantOpen = useUIStore((s) => s.setAssistantOpen)

  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const mod = useModKey()

  if (!project) return null

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface-1 px-2.5">
      {/* Left */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Hint label="Back to dashboard">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft />
            </Link>
          </Button>
        </Hint>

        <span className="hidden items-center gap-2 sm:flex">
          <LogoMark size={22} />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
            Raneddie Studio
          </span>
        </span>

        <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />

        {editingName ? (
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={() => {
              const value = draftName.trim()
              if (value && value !== project.name) renameProject(value)
              setEditingName(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
              if (event.key === 'Escape') setEditingName(false)
            }}
            autoFocus
            maxLength={80}
            aria-label="Project name"
            className="h-7 w-48 text-xs"
          />
        ) : (
          <button
            onClick={() => {
              setDraftName(project.name)
              setEditingName(true)
            }}
            className="min-w-0 truncate rounded px-1.5 py-1 text-xs font-medium hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Rename project"
          >
            {project.name}
          </button>
        )}

        {project.isDemo && <Badge variant="ai">Demo</Badge>}

        <span className="hidden items-center gap-1 text-[10px] text-muted-foreground lg:flex">
          {saving ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Saving…
            </>
          ) : savedAt ? (
            <>
              <Check className="size-3 text-success" /> Saved {formatRelativeTime(savedAt)}
            </>
          ) : (
            <>
              <Cloud className="size-3" /> Autosave on
            </>
          )}
        </span>
      </div>

      {/* Center */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Hint label="Undo" shortcut={`${mod} Z`}>
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
        </Hint>
        <Hint label="Redo" shortcut={`${mod} ⇧ Z`}>
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
        </Hint>
      </div>

      {/* Right */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <Button
          variant="ghost"
          size="xs"
          onClick={toggleCommandBar}
          className="hidden gap-1.5 text-muted-foreground md:inline-flex"
        >
          <Sparkles className="text-ai" /> {mod} K
        </Button>

        <Badge variant="ai" className="hidden lg:inline-flex">
          {balance.toLocaleString()} credits
        </Badge>

        <Hint label="Toggle the assistant" shortcut={`${mod} J`}>
          <Button
            variant={assistantOpen ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setAssistantOpen(!assistantOpen)}
            aria-label="Toggle the AI assistant"
            aria-pressed={assistantOpen}
            className="xl:hidden"
          >
            <Sparkles />
          </Button>
        </Hint>

        <Button variant="ghost" size="sm" onClick={onPreview} className="hidden sm:inline-flex">
          <Eye /> Preview
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)} className="hidden sm:inline-flex">
          <Share2 /> Share
        </Button>
        <Button size="sm" onClick={onExport}>
          <Download /> Export
        </Button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
            <DialogDescription>
              Sharing needs a server to hold the project and its media. This build is entirely local:
              projects live in this browser and never leave the device, so there is nothing to link to
              yet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-md border border-border bg-surface-2 p-3">
            <p className="text-xs font-medium">What you can do today</p>
            <ul className="space-y-1.5 text-2xs leading-relaxed text-muted-foreground">
              <li>• Export the finished file and send it — the file is real and plays anywhere.</li>
              <li>• Duplicate the project from the dashboard to branch a version.</li>
              <li>
                • The repository ships a <code className="font-mono">ProjectRepository</code> interface;
                implementing it against a database is what turns this into a share link.
              </li>
            </ul>
          </div>
          <Button
            onClick={() => {
              setShareOpen(false)
              onExport()
            }}
          >
            <Download /> Export instead
          </Button>
        </DialogContent>
      </Dialog>
    </header>
  )
}

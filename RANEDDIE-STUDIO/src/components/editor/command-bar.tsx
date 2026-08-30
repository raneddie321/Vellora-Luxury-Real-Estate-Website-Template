'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Captions,
  Crop,
  Download,
  Redo2,
  ScanSearch,
  ScissorsLineDashed,
  Search,
  Sparkles,
  SquareSplitHorizontal,
  Undo2,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { StatusPill } from '@/components/ui/status-pill'
import { getAIProvider } from '@/lib/ai/registry'
import { useEditorStore } from '@/lib/store/editor-store'
import { useUIStore } from '@/lib/store/ui-store'
import type { AIAction, AICapability } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  label: string
  hint: string
  icon: React.ElementType
  keywords: string[]
  capability?: AICapability
  run: () => void | Promise<void>
}

/**
 * The command bar (⌘/Ctrl+K).
 *
 * Commands that reach the AI show their capability badge, so a user never runs
 * into a "Requires API" wall only after pressing enter.
 */
export function CommandBar({ onExport }: { onExport: () => void }) {
  const router = useRouter()
  const open = useUIStore((s) => s.commandBarOpen)
  const setOpen = useUIStore((s) => s.setCommandBarOpen)

  const runAction = useEditorStore((s) => s.runAction)
  const sendPrompt = useEditorStore((s) => s.sendPrompt)
  const splitAtPlayhead = useEditorStore((s) => s.splitAtPlayhead)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const capabilities = getAIProvider().capabilities()

  const commands: Command[] = useMemo(() => {
    const ai = (
      id: string,
      label: string,
      hint: string,
      icon: React.ElementType,
      capability: AICapability,
      action: AIAction,
      keywords: string[],
    ): Command => ({
      id,
      label,
      hint,
      icon,
      capability,
      keywords,
      run: async () => {
        try {
          await runAction(action, `AI · ${label}`)
          toast.success(label, { description: 'Applied — ⌘/Ctrl+Z undoes it.' })
        } catch (error) {
          toast.error(`${label} did not run`, {
            description: error instanceof Error ? error.message : 'Nothing changed on your timeline.',
          })
        }
      },
    })

    return [
      ai(
        'remove-silence',
        'Remove silence',
        'Detect and ripple-delete silent ranges',
        ScissorsLineDashed,
        'silence-detection',
        { type: 'trim', target: { kind: 'all-audio' }, parameters: { mode: 'remove-silence' } },
        ['silence', 'dead air', 'pauses', 'tighten'],
      ),
      ai(
        'add-captions',
        'Add captions',
        'Lay caption clips on detected speech boundaries',
        Captions,
        'caption',
        { type: 'caption', target: { kind: 'project' }, parameters: { preset: 'clean' } },
        ['captions', 'subtitles', 'cc'],
      ),
      ai(
        'make-cinematic',
        'Make cinematic',
        'Cinematic grade across every video clip',
        Wand2,
        'command-parse',
        {
          type: 'color',
          target: { kind: 'all-video' },
          parameters: {
            presetId: 'color-cinematic',
            params: { exposure: -0.04, contrast: 0.28, saturation: -0.12, temperature: -0.12 },
          },
        },
        ['cinematic', 'grade', 'film', 'colour', 'color'],
      ),
      ai(
        'export-vertical',
        'Export vertical',
        'Convert the project to 9:16 and re-frame clips',
        Crop,
        'aspect-convert',
        { type: 'aspect', target: { kind: 'project' }, parameters: { aspectRatio: '9:16', reframe: 'cover' } },
        ['vertical', '9:16', 'tiktok', 'reels', 'shorts'],
      ),
      ai(
        'find-moments',
        'Find best moments',
        'Analyse shot changes and audio energy',
        ScanSearch,
        'analyze-media',
        { type: 'effect', target: { kind: 'project' }, parameters: { action: 'analyze' } },
        ['analyse', 'analyze', 'highlights', 'best moments', 'scenes'],
      ),
      {
        id: 'create-intro',
        label: 'Create intro',
        hint: 'Ask RAN to build a dramatic opening',
        icon: Sparkles,
        keywords: ['intro', 'opening', 'title', 'hook'],
        run: () => void sendPrompt('Create a dramatic intro.'),
      },
      {
        id: 'split',
        label: 'Split at playhead',
        hint: 'Cut every clip under the playhead',
        icon: SquareSplitHorizontal,
        keywords: ['split', 'cut', 'razor', 's'],
        run: splitAtPlayhead,
      },
      {
        id: 'undo',
        label: 'Undo',
        hint: 'Step back one edit',
        icon: Undo2,
        keywords: ['undo', 'back'],
        run: () => {
          const label = undo()
          if (label) toast.success(`Undid: ${label}`)
        },
      },
      {
        id: 'redo',
        label: 'Redo',
        hint: 'Step forward one edit',
        icon: Redo2,
        keywords: ['redo', 'forward'],
        run: () => {
          const label = redo()
          if (label) toast.success(`Redid: ${label}`)
        },
      },
      {
        id: 'export',
        label: 'Export…',
        hint: 'Open the export workflow',
        icon: Download,
        keywords: ['export', 'render', 'download', 'mp4'],
        run: onExport,
      },
      {
        id: 'dashboard',
        label: 'Go to dashboard',
        hint: 'Leave the editor',
        icon: ArrowRight,
        keywords: ['dashboard', 'home', 'projects'],
        run: () => router.push('/dashboard'),
      },
    ]
  }, [runAction, sendPrompt, splitAtPlayhead, undo, redo, onExport, router])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(needle) ||
        command.hint.toLowerCase().includes(needle) ||
        command.keywords.some((keyword) => keyword.includes(needle)),
    )
  }, [commands, query])

  async function execute(command: Command) {
    close()
    await command.run()
  }

  /** Closing always clears the query, so the bar reopens empty. */
  function close() {
    setOpen(false)
    setQuery('')
    setActive(0)
  }

  /** Selection is reset as the query changes, not synchronised after the fact. */
  function updateQuery(value: string) {
    setQuery(value)
    setActive(0)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent
        hideClose
        className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        aria-label="Command bar"
      >
        <DialogTitle className="sr-only">Command bar</DialogTitle>

        <div className="flex items-center gap-2 border-b border-border px-3.5">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive((i) => Math.min(filtered.length - 1, i + 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive((i) => Math.max(0, i - 1))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                const command = filtered[active]
                if (command) void execute(command)
              }
            }}
            autoFocus
            placeholder="Run a command, or describe an edit…"
            aria-label="Command"
            aria-controls="command-results"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <Kbd>Esc</Kbd>
        </div>

        <ul ref={listRef} id="command-results" role="listbox" className="max-h-[340px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center">
              <p className="text-xs text-muted-foreground">No command matches &ldquo;{query}&rdquo;.</p>
              <button
                onClick={() => {
                  const value = query
                  close()
                  void sendPrompt(value)
                }}
                className="mt-2 text-xs font-medium text-ai hover:underline"
              >
                Ask RAN for it instead →
              </button>
            </li>
          ) : (
            filtered.map((command, index) => {
              const Icon = command.icon
              const status = command.capability
                ? capabilities.find((c) => c.capability === command.capability)
                : undefined
              return (
                <li key={command.id} role="option" aria-selected={index === active}>
                  <button
                    onMouseEnter={() => setActive(index)}
                    onClick={() => void execute(command)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
                      index === active ? 'bg-surface-3' : 'hover:bg-surface-2',
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{command.label}</span>
                      <span className="mt-0.5 block truncate text-2xs text-muted-foreground">
                        {command.hint}
                      </span>
                    </span>
                    {status && (
                      <StatusPill
                        status={
                          status.availability === 'ready'
                            ? 'ready'
                            : status.availability === 'demo'
                              ? 'demo'
                              : 'requires-api'
                        }
                        className="shrink-0"
                      />
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-3.5 py-2 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> to run
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

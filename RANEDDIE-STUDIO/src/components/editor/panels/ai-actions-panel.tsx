'use client'

import { useState } from 'react'
import {
  Captions,
  Crop,
  Loader2,
  ScanSearch,
  ScissorsLineDashed,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusPill, type Status } from '@/components/ui/status-pill'
import { CAPABILITY_LABELS } from '@/lib/ai/provider'
import { getAIProvider } from '@/lib/ai/registry'
import { useEditorStore } from '@/lib/store/editor-store'
import type { AIAction, AICapability, CapabilityAvailability } from '@/lib/types'

const TO_STATUS: Record<CapabilityAvailability, Status> = {
  ready: 'ready',
  demo: 'demo',
  'requires-api': 'requires-api',
  unavailable: 'failed',
}

interface QuickAction {
  id: string
  icon: React.ElementType
  title: string
  description: string
  capability: AICapability
  action: AIAction
  label: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'silence',
    icon: ScissorsLineDashed,
    title: 'Remove silence',
    description: 'Detect silent ranges in the decoded audio and ripple-delete them across every track.',
    capability: 'silence-detection',
    action: { type: 'trim', target: { kind: 'all-audio' }, parameters: { mode: 'remove-silence' } },
    label: 'AI · Remove silence',
  },
  {
    id: 'analyze',
    icon: ScanSearch,
    title: 'Analyse footage',
    description: 'Sample every asset for shot changes and audio energy, then attach the results.',
    capability: 'analyze-media',
    action: { type: 'effect', target: { kind: 'project' }, parameters: { action: 'analyze' } },
    label: 'AI · Analyse footage',
  },
  {
    id: 'captions',
    icon: Captions,
    title: 'Generate captions',
    description: 'Lay timed caption clips on a caption track using detected speech boundaries.',
    capability: 'caption',
    action: { type: 'caption', target: { kind: 'project' }, parameters: { preset: 'clean' } },
    label: 'AI · Generate captions',
  },
  {
    id: 'vertical',
    icon: Crop,
    title: 'Convert to 9:16',
    description: 'Switch the project to vertical and re-frame every clip to fill the new shape.',
    capability: 'aspect-convert',
    action: {
      type: 'aspect',
      target: { kind: 'project' },
      parameters: { aspectRatio: '9:16', reframe: 'cover' },
    },
    label: 'AI · Convert to 9:16',
  },
  {
    id: 'cinematic',
    icon: Wand2,
    title: 'Cinematic grade',
    description: 'Apply the Cinematic colour preset plus a soft vignette to every video clip.',
    capability: 'command-parse',
    action: {
      type: 'color',
      target: { kind: 'all-video' },
      parameters: {
        presetId: 'color-cinematic',
        params: { exposure: -0.04, contrast: 0.28, saturation: -0.12, temperature: -0.12 },
      },
    },
    label: 'AI · Cinematic grade',
  },
]

/**
 * Quick actions: one-click equivalents of the most common plans, so a user does
 * not have to phrase an instruction to reach the same result.
 */
export function AIActionsPanel() {
  const runAction = useEditorStore((s) => s.runAction)
  const sendPrompt = useEditorStore((s) => s.sendPrompt)
  const [busy, setBusy] = useState<string | null>(null)

  const capabilities = getAIProvider().capabilities()
  const statusFor = (capability: AICapability) =>
    capabilities.find((c) => c.capability === capability)

  async function run(quick: QuickAction) {
    setBusy(quick.id)
    try {
      await runAction(quick.action, quick.label)
      toast.success(quick.title, { description: 'Applied — ⌘/Ctrl+Z undoes it.' })
    } catch (error) {
      toast.error(`${quick.title} did not run`, {
        description: error instanceof Error ? error.message : 'Nothing on your timeline changed.',
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2.5">
        <div className="rounded-md border border-ai/25 bg-ai/[0.06] p-2.5">
          <p className="flex items-center gap-1.5 text-2xs font-semibold text-ai">
            <Sparkles className="size-3" aria-hidden="true" /> One-click actions
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Each of these is the same operation an edit plan would apply, and each lands in the undo
            history. For anything else, describe it to RAN on the right.
          </p>
        </div>

        <div className="space-y-1.5">
          {QUICK_ACTIONS.map((quick) => {
            const status = statusFor(quick.capability)
            const runnable = status?.availability === 'ready' || status?.availability === 'demo'
            const Icon = quick.icon
            return (
              <div key={quick.id} className="rounded-md border border-border bg-surface-2 p-2.5">
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-2xs font-medium">{quick.title}</p>
                      <StatusPill
                        status={TO_STATUS[status?.availability ?? 'unavailable']}
                        className="shrink-0"
                      />
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                      {quick.description}
                    </p>
                    {status?.note && (
                      <p className="mt-1 text-[10px] leading-relaxed text-warning">{status.note}</p>
                    )}
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground/70">
                      {CAPABILITY_LABELS[quick.capability]} · {status?.credits ?? 0} credits
                    </p>
                  </div>
                </div>
                <Button
                  size="xs"
                  variant="secondary"
                  className="mt-2 w-full"
                  disabled={!runnable || busy !== null}
                  onClick={() => void run(quick)}
                >
                  {busy === quick.id ? <Loader2 className="animate-spin" /> : null}
                  {busy === quick.id ? 'Working…' : 'Run now'}
                </Button>
              </div>
            )
          })}
        </div>

        <div className="rounded-md border border-border bg-surface-2 p-2.5">
          <p className="text-2xs font-medium">Need something else?</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Ask for it in your own words and RAN will draft a plan you can review.
          </p>
          <Button
            size="xs"
            variant="ai"
            className="mt-2 w-full"
            onClick={() => void sendPrompt('Make this look like a Hollywood trailer.')}
          >
            <Sparkles /> Try &ldquo;Hollywood trailer&rdquo;
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}

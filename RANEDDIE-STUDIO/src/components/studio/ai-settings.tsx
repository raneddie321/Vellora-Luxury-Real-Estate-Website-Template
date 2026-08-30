'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusPill, type Status } from '@/components/ui/status-pill'
import { SettingsSection } from '@/components/studio/settings-nav'
import { CAPABILITY_LABELS } from '@/lib/ai/provider'
import type { AIStatusResponse } from '@/lib/ai/registry'
import type { CapabilityAvailability } from '@/lib/types'

const TO_STATUS: Record<CapabilityAvailability, Status> = {
  ready: 'ready',
  demo: 'demo',
  'requires-api': 'requires-api',
  unavailable: 'failed',
}

/** Pure fetch — no React state, so callers decide what to do with the result. */
async function fetchStatus(signal?: AbortSignal): Promise<AIStatusResponse> {
  const response = await fetch('/api/ai/status', { cache: 'no-store', signal })
  if (!response.ok) throw new Error(`The status endpoint returned ${response.status}.`)
  return (await response.json()) as AIStatusResponse
}

export function AISettings() {
  const [status, setStatus] = useState<AIStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchStatus(controller.signal).then(
      (data) => {
        setStatus(data)
        setError(null)
        setLoading(false)
      },
      (caught: unknown) => {
        if (controller.signal.aborted) return
        setError(caught instanceof Error ? caught.message : 'Could not read the AI configuration.')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [])

  function reload() {
    setLoading(true)
    fetchStatus().then(
      (data) => {
        setStatus(data)
        setError(null)
        setLoading(false)
      },
      (caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'Could not read the AI configuration.')
        setLoading(false)
      },
    )
  }

  return (
    <>
      <SettingsSection
        title="Language model"
        description="Used for open-ended instructions and conversation. Keys are read on the server only — they are never sent to the browser."
      >
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Reading server configuration…
          </div>
        ) : error ? (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/[0.07] p-3 text-xs">
            {error}
            <Button variant="ghost" size="xs" className="ml-2" onClick={reload}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : status ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-3">
              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {status.configured ? `${status.provider} · ${status.model}` : 'Built-in Studio Engine'}
                </p>
                <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">
                  {status.configured
                    ? 'Instructions are planned by your configured model. Only a compact timeline summary is sent.'
                    : 'Plans come from the deterministic planner that ships with the app. Everything works with no key.'}
                </p>
              </div>
              <StatusPill status={status.configured ? 'ready' : 'demo'} />
            </div>

            <div className="rounded-md border border-border bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <KeyRound className="size-3.5 text-warning" aria-hidden="true" /> Connect a model
              </p>
              <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground">
                Add these to <code className="rounded bg-surface-3 px-1 py-0.5 font-mono">.env.local</code> and
                restart the dev server:
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-background p-2.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
{`AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-5

# or
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...`}
              </pre>
              <Button variant="ghost" size="xs" className="mt-2" onClick={reload}>
                <RefreshCw /> Re-check configuration
              </Button>
            </div>
          </div>
        ) : null}
      </SettingsSection>

      <SettingsSection
        title="Capabilities"
        description="Exactly what this installation can do right now. The editor renders the same badges you see here."
      >
        {status ? (
          <ul className="divide-y divide-border">
            {status.capabilities.map((capability) => (
              <li key={capability.capability} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">{CAPABILITY_LABELS[capability.capability]}</p>
                    <Badge variant="outline">{capability.credits} cr</Badge>
                  </div>
                  {capability.note && (
                    <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">{capability.note}</p>
                  )}
                </div>
                <StatusPill status={TO_STATUS[capability.availability]} className="mt-0.5 shrink-0" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Capabilities load with the server configuration.</p>
        )}
      </SettingsSection>
    </>
  )
}

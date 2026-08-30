'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Loader2, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/input'
import { StatusPill } from '@/components/ui/status-pill'
import { PlanCard } from './plan-card'
import { EXAMPLE_PROMPTS } from '@/lib/ai/planner'
import { computeSuggestions } from '@/lib/ai/suggestions'
import { getAIProvider, onProviderChange } from '@/lib/ai/registry'
import { useEditorStore } from '@/lib/store/editor-store'
import { cn } from '@/lib/utils'

/**
 * RAN — the assistant panel.
 *
 * Deliberately not a chat window bolted onto an editor: the conversation is a
 * thin wrapper around edit plans, and every reply that proposes work renders the
 * plan inline where it can be inspected and applied step by step.
 */
export function AssistantPanel({ onClose }: { onClose?: () => void }) {
  const messages = useEditorStore((s) => s.messages)
  const plans = useEditorStore((s) => s.plans)
  const aiBusy = useEditorStore((s) => s.aiBusy)
  const sendPrompt = useEditorStore((s) => s.sendPrompt)
  const dismissSuggestion = useEditorStore((s) => s.dismissSuggestion)
  const project = useEditorStore((s) => s.project)
  const selection = useEditorStore((s) => s.selection)

  const [draft, setDraft] = useState('')
  const [providerName, setProviderName] = useState(() => getAIProvider().name)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => onProviderChange((provider) => setProviderName(provider.name)), [])

  useEffect(() => {
    // Keep the newest message in view without hijacking a deliberate scroll-up.
    const viewport = scrollRef.current?.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]')
    if (!viewport) return
    const nearBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 240
    if (nearBottom) viewport.scrollTop = viewport.scrollHeight
  }, [messages, plans])

  const dismissed = useEditorStore((s) => s.dismissedSuggestions)
  const suggestions = useMemo(
    () =>
      project
        ? computeSuggestions(project, selection).filter((item) => !dismissed.includes(item.id))
        : [],
    [project, selection, dismissed],
  )
  const capabilities = getAIProvider().capabilities()
  const planStatus = capabilities.find((c) => c.capability === 'edit-plan')

  function submit() {
    const value = draft.trim()
    if (!value || aiBusy) return
    setDraft('')
    void sendPrompt(value)
  }

  return (
    <aside
      aria-label="AI creative director"
      className="flex h-full min-h-0 flex-col border-l border-border bg-surface-1"
    >
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="relative flex size-7 shrink-0 items-center justify-center rounded-md bg-ai/15 text-ai">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {aiBusy && <span className="absolute inset-0 animate-pulse-ring rounded-md" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1 leading-none">
          <p className="text-xs font-semibold">RAN</p>
          <p className="mt-1 truncate text-[10px] text-muted-foreground">Your creative director</p>
        </div>
        <StatusPill status={planStatus?.availability === 'ready' ? 'ready' : 'demo'} />
        {onClose && (
          <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close the assistant">
            <X />
          </Button>
        )}
      </div>

      {/* Conversation */}
      <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
        <div className="space-y-3 p-3">
          {messages.map((message) => {
            const plan = message.planId ? plans.find((p) => p.id === message.planId) : undefined
            return (
              <div key={message.id} className="space-y-2">
                {message.role === 'user' ? (
                  <div className="ml-6 rounded-md rounded-br-sm border border-border bg-surface-3 px-3 py-2">
                    <p className="whitespace-pre-wrap text-[11px] leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <div className="mr-2">
                    {message.status === 'streaming' ? (
                      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin text-ai" />
                        Reading your timeline…
                      </p>
                    ) : (
                      <p
                        className={cn(
                          'whitespace-pre-wrap text-[11px] leading-relaxed',
                          message.status === 'error' ? 'text-destructive' : 'text-foreground/90',
                        )}
                      >
                        {message.content}
                      </p>
                    )}
                  </div>
                )}
                {plan && <PlanCard plan={plan} />}
              </div>
            )
          })}

          {/* Contextual suggestions */}
          {suggestions.length > 0 && !aiBusy && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Suggestions
              </p>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-md border border-ai/20 bg-ai/[0.05] p-2.5"
                >
                  <p className="text-[11px] font-medium">{suggestion.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                    {suggestion.detail}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      variant="ai"
                      size="xs"
                      onClick={() => {
                        dismissSuggestion(suggestion.id)
                        void sendPrompt(suggestion.prompt)
                      }}
                    >
                      Apply
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => dismissSuggestion(suggestion.id)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Example prompts */}
      {messages.length <= 1 && (
        <div className="shrink-0 border-t border-border px-3 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Try
          </p>
          <div className="flex flex-wrap gap-1">
            {EXAMPLE_PROMPTS.slice(0, 7).map((prompt) => (
              <button
                key={prompt}
                onClick={() => void sendPrompt(prompt)}
                disabled={aiBusy}
                className="rounded-full border border-border bg-surface-2 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-ai/40 hover:bg-ai/[0.08] hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-border p-2.5">
        {selection.length > 0 && (
          <Badge variant="outline" className="mb-1.5">
            Context: {selection.length} clip{selection.length === 1 ? '' : 's'} selected
          </Badge>
        )}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Describe the edit you want…"
            aria-label="Ask RAN for an edit"
            rows={2}
            className="min-h-[62px] pr-10 text-[11px]"
            disabled={aiBusy}
          />
          <Button
            variant="ai"
            size="icon-xs"
            className="absolute bottom-2 right-2"
            onClick={submit}
            disabled={!draft.trim() || aiBusy}
            aria-label="Send instruction"
          >
            {aiBusy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          {providerName} · plans are proposed, never applied on their own.
        </p>
      </div>
    </aside>
  )
}

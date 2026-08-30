'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  Coins,
  Eye,
  Loader2,
  SkipForward,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusPill, type Status } from '@/components/ui/status-pill'
import { CAPABILITY_LABELS } from '@/lib/ai/provider'
import { useCreditsStore } from '@/lib/store/credits-store'
import { useEditorStore } from '@/lib/store/editor-store'
import type { AIEditPlan, AIOperation } from '@/lib/types'
import { cn } from '@/lib/utils'

const OPERATION_STATUS: Record<AIOperation['status'], Status> = {
  pending: 'ready',
  applying: 'processing',
  applied: 'completed',
  skipped: 'ready',
  failed: 'failed',
}

/**
 * The edit plan.
 *
 * This is the contract between the AI and the user: every operation states what
 * it will do, how long it takes, what it costs, and whether it can run at all.
 * Nothing is applied until a button here is pressed.
 */
export function PlanCard({ plan }: { plan: AIEditPlan }) {
  const applyOperation = useEditorStore((s) => s.applyOperation)
  const applyPlan = useEditorStore((s) => s.applyPlan)
  const skipOperation = useEditorStore((s) => s.skipOperation)
  const undo = useEditorStore((s) => s.undo)
  const balance = useCreditsStore((s) => s.balance)

  const [expanded, setExpanded] = useState(true)

  const runnable = plan.operations.filter(
    (op) => op.status === 'pending' && (op.availability === 'ready' || op.availability === 'demo'),
  )
  const blocked = plan.operations.filter((op) => op.availability === 'requires-api')
  const applied = plan.operations.filter((op) => op.status === 'applied')
  const pendingCost = runnable.reduce((sum, op) => sum + op.credits, 0)
  const affordable = balance >= pendingCost

  return (
    <div className="overflow-hidden rounded-md border border-ai/25 bg-ai/[0.05]">
      <div className="flex items-start gap-2 p-3">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-ai/15 text-ai">
          <Sparkles className="size-3" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">{plan.summary}</p>
          {plan.reasoning && (
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{plan.reasoning}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="ai">
              <Coins /> {plan.totalCredits} credits total
            </Badge>
            <Badge variant="outline">
              <Clock3 /> ~{plan.operations.reduce((sum, op) => sum + op.estimatedSeconds, 0)}s
            </Badge>
            <Badge variant="outline">{plan.provider}</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse plan' : 'Expand plan'}
          className="shrink-0"
        >
          <ChevronDown className={cn('transition-transform', expanded && 'rotate-180')} />
        </Button>
      </div>

      {expanded && (
        <>
          <ol className="space-y-1.5 px-3 pb-3">
            {plan.operations.map((operation, index) => (
              <OperationRow
                key={operation.id}
                index={index + 1}
                operation={operation}
                onApply={() => void applyOperation(plan.id, operation.id)}
                onSkip={() => skipOperation(plan.id, operation.id)}
              />
            ))}
          </ol>

          <div className="flex flex-col gap-2 border-t border-ai/20 bg-ai/[0.04] p-3">
            {blocked.length > 0 && (
              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-warning">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                {blocked.length} step{blocked.length === 1 ? '' : 's'} need an external provider and will be
                skipped. The rest apply normally.
              </p>
            )}
            {!affordable && runnable.length > 0 && (
              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-destructive">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                This plan costs {pendingCost} credits and you have {balance}. Top up in Settings › Billing.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="ai"
                size="sm"
                className="flex-1"
                disabled={runnable.length === 0 || !affordable || plan.status === 'applying'}
                onClick={() => void applyPlan(plan.id)}
              >
                {plan.status === 'applying' ? <Loader2 className="animate-spin" /> : <Check />}
                Apply All
                {runnable.length > 0 && ` (${runnable.length})`}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setExpanded(true)}
                disabled={plan.operations.length === 0}
              >
                <Eye /> Review Changes
              </Button>
            </div>

            {applied.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  const label = undo()
                  if (label) {
                    // Undo pops one operation at a time — say which one went back.
                    return label
                  }
                }}
              >
                Undo last applied step
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function OperationRow({
  operation,
  index,
  onApply,
  onSkip,
}: {
  operation: AIOperation
  index: number
  onApply: () => void
  onSkip: () => void
}) {
  const blocked = operation.availability === 'requires-api' || operation.availability === 'unavailable'
  const done = operation.status === 'applied'

  return (
    <li
      className={cn(
        'rounded border border-border bg-surface-1 p-2',
        done && 'border-success/30 bg-success/[0.05]',
        operation.status === 'failed' && 'border-destructive/30 bg-destructive/[0.05]',
        operation.status === 'skipped' && 'opacity-55',
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
            done ? 'bg-success/20 text-success' : 'bg-surface-3 text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {done ? <Check className="size-2.5" strokeWidth={3} /> : index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[11px] font-medium">{operation.title}</p>
            <StatusPill
              status={blocked ? 'requires-api' : OPERATION_STATUS[operation.status]}
              className="shrink-0"
            />
          </div>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{operation.description}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              <Clock3 className="size-2.5" aria-hidden="true" />~{operation.estimatedSeconds}s
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Coins className="size-2.5" aria-hidden="true" />
              {operation.credits}
            </span>
            <span className="truncate">{CAPABILITY_LABELS[operation.capability]}</span>
          </div>

          {operation.error && (
            <p className="mt-1.5 rounded bg-destructive/10 px-1.5 py-1 text-[10px] leading-relaxed text-destructive">
              {operation.error}
            </p>
          )}
          {blocked && operation.availabilityNote && !operation.error && (
            <p className="mt-1.5 rounded bg-warning/10 px-1.5 py-1 text-[10px] leading-relaxed text-warning">
              {operation.availabilityNote}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {operation.preview && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label={`Preview: ${operation.title}`}>
                  <Eye />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-64">
                <p className="text-2xs font-semibold">{operation.title}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {operation.preview}
                </p>
              </PopoverContent>
            </Popover>
          )}
          {operation.status === 'pending' && !blocked && (
            <>
              <Button variant="ghost" size="icon-xs" onClick={onSkip} aria-label={`Skip ${operation.title}`}>
                <SkipForward />
              </Button>
              <Button variant="secondary" size="xs" onClick={onApply}>
                Apply
              </Button>
            </>
          )}
          {operation.status === 'applying' && <Loader2 className="size-3.5 animate-spin text-ai" />}
        </div>
      </div>
    </li>
  )
}

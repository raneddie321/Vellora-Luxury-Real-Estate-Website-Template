import { Check, CircleDashed, KeyRound, Loader2, TriangleAlert, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The single source of truth for how execution state is communicated.
 * Anything the app cannot actually do says so here rather than pretending.
 */
export type Status = 'ready' | 'processing' | 'completed' | 'requires-api' | 'demo' | 'failed' | 'queued'

const CONFIG: Record<Status, { label: string; className: string; icon: React.ElementType; spin?: boolean }> = {
  ready: { label: 'Ready', className: 'border-border bg-surface-3 text-muted-foreground', icon: CircleDashed },
  queued: { label: 'Queued', className: 'border-border bg-surface-3 text-muted-foreground', icon: CircleDashed },
  processing: { label: 'Processing', className: 'border-ai/30 bg-ai/12 text-ai', icon: Loader2, spin: true },
  completed: { label: 'Completed', className: 'border-success/30 bg-success/12 text-success', icon: Check },
  'requires-api': {
    label: 'Requires API',
    className: 'border-warning/30 bg-warning/12 text-warning',
    icon: KeyRound,
  },
  demo: { label: 'Demo Mode', className: 'border-ai/25 bg-ai/10 text-ai/90', icon: Zap },
  failed: { label: 'Failed', className: 'border-destructive/30 bg-destructive/12 text-destructive', icon: TriangleAlert },
}

export function StatusPill({
  status,
  label,
  className,
  showIcon = true,
}: {
  status: Status
  label?: string
  className?: string
  showIcon?: boolean
}) {
  const config = CONFIG[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-2xs font-medium leading-none',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className={cn('size-3', config.spin && 'animate-spin')} aria-hidden="true" />}
      {label ?? config.label}
    </span>
  )
}

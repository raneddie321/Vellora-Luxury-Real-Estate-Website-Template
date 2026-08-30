import * as React from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-border bg-surface-2 text-muted-foreground',
          compact ? 'size-9' : 'size-12',
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </div>
      <div className="space-y-1">
        <p className={cn('font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}>{title}</p>
        {description && (
          <p className={cn('mx-auto max-w-[34ch] text-muted-foreground', compact ? 'text-2xs' : 'text-xs leading-relaxed')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}

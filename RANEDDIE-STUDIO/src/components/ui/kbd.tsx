import * as React from 'react'
import { cn } from '@/lib/utils'

/** Renders a keyboard shortcut. Pass keys already resolved for the platform. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-surface-3 px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export function KbdGroup({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((k, i) => (
        <React.Fragment key={`${k}-${i}`}>
          <Kbd>{k}</Kbd>
        </React.Fragment>
      ))}
    </span>
  )
}

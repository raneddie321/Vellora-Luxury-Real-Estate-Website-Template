'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    tone?: 'primary' | 'ai' | 'success' | 'destructive'
    indeterminate?: boolean
  }
>(({ className, value, tone = 'primary', indeterminate, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
    value={indeterminate ? undefined : value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 transition-transform duration-300 ease-out',
        tone === 'ai' && 'bg-ai',
        tone === 'primary' && 'bg-primary',
        tone === 'success' && 'bg-success',
        tone === 'destructive' && 'bg-destructive',
        indeterminate && 'animate-pulse',
      )}
      style={{ transform: `translateX(-${100 - (indeterminate ? 65 : (value ?? 0))}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

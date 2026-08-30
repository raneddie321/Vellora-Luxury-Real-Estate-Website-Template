'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-surface-2 px-3 py-1 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[72px] w-full resize-none rounded-md border border-input bg-surface-2 px-3 py-2 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }

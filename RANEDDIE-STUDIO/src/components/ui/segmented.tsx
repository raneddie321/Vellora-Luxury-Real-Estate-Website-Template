'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  title?: string
}

/**
 * A compact radio group styled as a segmented control. Uses roving focus via
 * arrow keys so it behaves like a native radiogroup for keyboard users.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'default',
  'aria-label': ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  className?: string
  size?: 'sm' | 'default'
  'aria-label': string
}) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = options.findIndex((o) => o.value === value)
    if (index < 0) return
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
    else return
    event.preventDefault()
    onChange(options[next].value)
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              size === 'sm' ? 'h-6 px-2 text-2xs [&_svg]:size-3' : 'h-7 px-2.5 text-xs [&_svg]:size-3.5',
              active ? 'bg-surface-3 text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slider } from './slider'

/** Label + control row used throughout the inspector panels. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
  inline,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
  inline?: boolean
}) {
  return (
    <div className={cn(inline ? 'flex items-center justify-between gap-3' : 'space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-2xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </label>
      <div className={inline ? 'flex min-w-0 shrink-0 items-center gap-2' : ''}>{children}</div>
      {hint && !inline && <p className="text-2xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

/** Labelled slider with a live numeric readout. */
export function SliderField({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format = (v: number) => v.toFixed(2),
  tone = 'primary',
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  tone?: 'primary' | 'ai'
  disabled?: boolean
}) {
  const id = React.useId()
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-2xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </label>
        <span className="tabular font-mono text-2xs text-foreground">{format(value)}</span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        tone={tone}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

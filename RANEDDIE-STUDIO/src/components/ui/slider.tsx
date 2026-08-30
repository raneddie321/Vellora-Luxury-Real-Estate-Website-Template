'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { tone?: 'primary' | 'ai' }
>(({ className, tone = 'primary', ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center py-1.5', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-3">
      <SliderPrimitive.Range className={cn('absolute h-full', tone === 'ai' ? 'bg-ai' : 'bg-primary')} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block size-3 rounded-full border-2 bg-foreground transition-[box-shadow,transform] hover:scale-110',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        tone === 'ai' ? 'border-ai' : 'border-primary',
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

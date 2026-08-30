'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_1px_0_0_hsl(var(--primary)/0.6)_inset]',
        ai: 'bg-ai text-ai-foreground hover:bg-ai/90 shadow-[0_1px_0_0_hsl(var(--ai)/0.6)_inset]',
        secondary: 'bg-surface-3 text-foreground hover:bg-surface-3/70 border border-border',
        outline: 'border border-border bg-transparent hover:bg-surface-2 text-foreground',
        ghost: 'hover:bg-surface-2 text-muted-foreground hover:text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 text-sm [&_svg]:size-4',
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        xs: 'h-7 px-2.5 text-2xs [&_svg]:size-3.5',
        lg: 'h-11 px-6 text-[15px] [&_svg]:size-[18px]',
        icon: 'h-9 w-9 [&_svg]:size-4',
        'icon-sm': 'h-8 w-8 [&_svg]:size-4',
        'icon-xs': 'h-7 w-7 [&_svg]:size-3.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

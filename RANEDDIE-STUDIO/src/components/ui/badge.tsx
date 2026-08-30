import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-2xs font-medium transition-colors [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-3 text-muted-foreground',
        primary: 'border-primary/30 bg-primary/12 text-primary',
        ai: 'border-ai/30 bg-ai/12 text-ai',
        success: 'border-success/30 bg-success/12 text-success',
        warning: 'border-warning/30 bg-warning/12 text-warning',
        danger: 'border-destructive/30 bg-destructive/12 text-destructive',
        outline: 'border-border bg-transparent text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

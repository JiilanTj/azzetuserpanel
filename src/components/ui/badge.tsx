import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        solid:   'bg-(--blue-9) text-(--blue-contrast) border-transparent',
        soft:    'bg-(--blue-a3) text-(--blue-11) border-transparent',
        outline: 'border-(--blue-7) text-(--blue-11) bg-transparent',
        surface: 'bg-(--blue-surface) border-(--blue-a6) text-(--blue-11)',
        gray:    'bg-(--gray-a3) text-(--gray-11) border-transparent',
        success: 'bg-(--green-3) text-(--green-11) border-(--green-6)',
        warning: 'bg-(--amber-3) text-(--amber-11) border-(--amber-6)',
        error:   'bg-(--red-3) text-(--red-11) border-(--red-6)',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

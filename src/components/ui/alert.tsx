import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  InfoCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 flex gap-3',
  {
    variants: {
      variant: {
        info: [
          'bg-(--blue-a2) border-(--blue-a6) text-(--blue-11)',
          '[&_.alert-icon]:text-(--blue-9)',
        ],
        success: [
          'bg-(--green-3) border-(--green-6) text-(--green-11)',
          '[&_.alert-icon]:text-(--green-9)',
        ],
        warning: [
          'bg-(--amber-3) border-(--amber-6) text-(--amber-11)',
          '[&_.alert-icon]:text-(--amber-9)',
        ],
        error: [
          'bg-(--red-3) border-(--red-6) text-(--red-11)',
          '[&_.alert-icon]:text-(--red-9)',
        ],
        default: [
          'bg-(--gray-a2) border-(--gray-a6) text-(--gray-12)',
          '[&_.alert-icon]:text-(--gray-9)',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const alertIcons = {
  info: InfoCircledIcon,
  success: CheckCircledIcon,
  warning: ExclamationTriangleIcon,
  error: CrossCircledIcon,
  default: InfoCircledIcon,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const Icon = alertIcons[variant ?? 'default']
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        <Icon className="alert-icon h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          {title && <p className="text-sm font-semibold leading-none">{title}</p>}
          {children && <p className="text-sm opacity-80">{children}</p>}
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert, alertVariants }

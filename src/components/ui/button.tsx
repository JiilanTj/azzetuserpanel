import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { UpdateIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'font-medium transition-all duration-200 ease-in-out cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-(--blue-9) focus-visible:ring-offset-(--color-background)',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        solid: [
          'bg-(--blue-9) text-(--blue-contrast)',
          'hover:bg-(--blue-10)',
        ],
        soft: [
          'bg-(--blue-a3) text-(--blue-11)',
          'hover:bg-(--blue-a4)',
        ],
        outline: [
          'border border-(--blue-7) text-(--blue-11) bg-transparent',
          'hover:bg-(--blue-a3)',
        ],
        ghost: [
          'text-(--gray-12) bg-transparent',
          'hover:bg-(--gray-a3)',
        ],
        surface: [
          'bg-(--blue-surface) text-(--blue-11)',
          'border border-(--blue-a6)',
          'hover:bg-(--blue-a3)',
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus-visible:ring-red-500',
        ],
        link: [
          'text-(--blue-11) underline-offset-4 bg-transparent',
          'hover:underline',
        ],
      },
      size: {
        '1': 'h-6 px-2 text-xs rounded-md gap-1',
        '2': 'h-8 px-3 text-sm',
        '3': 'h-10 px-4 text-sm',
        '4': 'h-12 px-5 text-base',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0 rounded-md',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: '3',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <UpdateIcon className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

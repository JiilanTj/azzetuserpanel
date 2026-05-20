import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  errorMessage?: string
  label?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, errorMessage, label, hint, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-(--gray-12)"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-(--gray-9) pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border text-sm',
              'bg-(--gray-1) text-(--gray-12)',
              'placeholder:text-(--gray-9)',
              'transition-all duration-200',
              'outline-none',
              'focus:ring-2 focus:ring-(--blue-9) focus:ring-offset-0 focus:border-(--blue-8)',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-(--gray-3)',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-(--gray-6) hover:border-(--gray-8)',
              leftIcon ? 'pl-9' : 'px-3',
              rightIcon ? 'pr-9' : 'pr-3',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-(--gray-9) pointer-events-none flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {(errorMessage || hint) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-(--gray-10)')}>
            {error ? errorMessage : hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

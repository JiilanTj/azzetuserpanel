import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: boolean
  errorMessage?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, errorMessage, id, ...props }, ref) => {
    const textareaId = id ?? React.useId()
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-(--gray-12)">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border px-3 py-2.5 text-sm',
            'bg-(--gray-1) text-(--gray-12)',
            'placeholder:text-(--gray-9)',
            'transition-all duration-200 resize-y',
            'outline-none',
            'focus:ring-2 focus:ring-(--blue-9) focus:ring-offset-0 focus:border-(--blue-8)',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-(--gray-3)',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-(--gray-6) hover:border-(--gray-8)',
            className
          )}
          {...props}
        />
        {(errorMessage || hint) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-(--gray-10)')}>
            {error ? errorMessage : hint}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label?: string
    hint?: string
  }
>(({ className, label, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = id ?? generatedId
  return (
    <div className="flex gap-3">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-[4px] border border-(--gray-7) mt-0.5',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--blue-9) focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'data-[state=checked]:bg-(--blue-9) data-[state=checked]:border-(--blue-9) data-[state=checked]:text-(--blue-contrast)',
          'data-[state=indeterminate]:bg-(--blue-9) data-[state=indeterminate]:border-(--blue-9)',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'cursor-pointer',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <CheckIcon className="h-3 w-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || hint) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-(--gray-12) leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-40"
            >
              {label}
            </label>
          )}
          {hint && (
            <p className="text-xs text-(--gray-10)">{hint}</p>
          )}
        </div>
      )}
    </div>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

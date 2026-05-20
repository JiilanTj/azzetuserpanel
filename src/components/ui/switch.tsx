import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
    label?: string
    hint?: string
  }
>(({ className, label, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const switchId = id ?? generatedId
  return (
    <div className="flex items-start gap-3">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--blue-9) focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'data-[state=unchecked]:bg-(--gray-5)',
          'data-[state=checked]:bg-(--blue-9)',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-0',
            'transition-transform duration-200',
            'data-[state=unchecked]:translate-x-0',
            'data-[state=checked]:translate-x-4'
          )}
        />
      </SwitchPrimitive.Root>
      {(label || hint) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={switchId}
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
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }

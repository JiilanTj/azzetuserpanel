import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn('grid gap-2', className)}
    {...props}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label?: string
    hint?: string
  }
>(({ className, label, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const radioId = id ?? generatedId
  return (
    <div className="flex items-start gap-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={radioId}
        className={cn(
          // Size: 18×18px — slightly bigger than before, sits nicely at text-sm baseline
          'h-[18px] w-[18px] shrink-0 rounded-full border-2 border-(--gray-7)',
          'transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--blue-9) focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'data-[state=checked]:border-(--blue-9)',
          // Center with first line of label text
          'mt-[3px]',
          className
        )}
        {...props}
      >
        {/* Pure CSS circle — no icon, so no padding/metric issues */}
        <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-(--blue-9)" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      {(label || hint) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={radioId}
              className="text-sm font-medium leading-none text-(--gray-12) cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-40"
            >
              {label}
            </label>
          )}
          {hint && <p className="text-xs text-(--gray-10)">{hint}</p>}
        </div>
      )}
    </div>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

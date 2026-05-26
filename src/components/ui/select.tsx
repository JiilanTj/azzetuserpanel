import * as React from 'react'
import { Select as SelectPrimitive } from 'radix-ui'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    label?: string
    error?: boolean
    errorMessage?: string
    hint?: string
  }
>(({ className, children, label, error, errorMessage, hint, id, ...props }, ref) => {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-(--gray-12)">
          {label}
        </label>
      )}
      <SelectPrimitive.Trigger
        ref={ref}
        id={selectId}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm',
          'bg-(--gray-1) text-(--gray-12)',
          'transition-all duration-200 cursor-pointer',
          'outline-none',
          'focus:ring-2 focus:ring-(--blue-9) focus:ring-offset-0 focus:border-(--blue-8)',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'data-placeholder:text-(--gray-9)',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-(--gray-6) hover:border-(--gray-8)',
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="h-4 w-4 text-(--gray-9) shrink-0 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      {(errorMessage || hint) && (
        <p className={cn('text-xs', error ? 'text-red-500' : 'text-(--gray-10)')}>
          {error ? errorMessage : hint}
        </p>
      )}
    </div>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4 text-(--gray-9)" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4 text-(--gray-9)" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchable?: boolean
    searchPlaceholder?: string
  }
>(({ className, children, position = 'popper', searchable, searchPlaceholder = 'Cari...', ...props }, ref) => {
  const [search, setSearch] = React.useState('')

  const extractText = React.useCallback((node: unknown): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (React.isValidElement(node)) {
      return extractText((node.props as Record<string, unknown>)?.children)
    }
    return ''
  }, [])

  const filteredChildren = React.useMemo(() => {
    if (!searchable || !search) return children
    return React.Children.toArray(children).filter((child) => {
      if (!React.isValidElement(child)) return false
      const childProps = child.props as Record<string, unknown> | undefined
      if (childProps?.value === '__none__') return true
      const text = extractText(childProps?.children)
      return text.toLowerCase().includes(search.toLowerCase())
    })
  }, [children, search, searchable])

  return (
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-60 min-w-32 overflow-y-auto rounded-xl',
        'border border-(--gray-6) bg-(--gray-1) text-(--gray-12)',
        'shadow-xl',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      collisionPadding={8}
      {...props}
    >
        {searchable && (
          <div className="sticky top-0 z-10 bg-(--gray-1) px-2 pt-2 pb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 px-2.5 rounded-md border border-(--gray-6) bg-(--gray-2) text-sm text-(--gray-12) placeholder:text-(--gray-9) outline-none focus:ring-1 focus:ring-(--blue-8) focus:border-(--blue-8)"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
            'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)'
          )}
        >
          {filteredChildren}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-(--gray-10)', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-2 pr-8 text-sm outline-none',
      'transition-colors duration-150',
      'hover:bg-(--blue-a3) hover:text-(--blue-11)',
      'focus:bg-(--blue-a3) focus:text-(--blue-11)',
      'data-highlighted:bg-(--blue-a3) data-highlighted:text-(--blue-11)',
      'data-disabled:pointer-events-none data-disabled:opacity-40',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4 text-(--blue-9)" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-(--gray-6)', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

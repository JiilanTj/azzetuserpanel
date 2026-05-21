import * as React from 'react'
import { cn } from '@/lib/utils'

export interface WhatsAppInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (value: string) => void
  error?: boolean
  errorMessage?: string
  label?: string
  hint?: string
}

/**
 * Sanitizes user input into a clean +62 prefixed phone number.
 * Handles cases like:
 * - "08123456789"   → "+628123456789"
 * - "628123456789"  → "+628123456789"
 * - "+628123456789" → "+628123456789"
 * - "8123456789"    → "+628123456789"
 * - Random chars    → stripped, only digits kept
 */
function sanitizeWhatsApp(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '')

  if (digits === '') return ''

  // If starts with "62", keep as-is
  if (digits.startsWith('62')) {
    return `+${digits}`
  }

  // If starts with "0", replace leading 0 with 62
  if (digits.startsWith('0')) {
    return `+62${digits.slice(1)}`
  }

  // Otherwise assume it's the number after 62 (e.g. "812...")
  return `+62${digits}`
}

const WhatsAppInput = React.forwardRef<HTMLInputElement, WhatsAppInputProps>(
  ({ className, value, onChange, error, errorMessage, label, hint, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    // Display value: strip the +62 prefix for the input field
    const displayValue = React.useMemo(() => {
      if (!value) return ''
      if (value.startsWith('+62')) return value.slice(3)
      return value
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      // Only allow digits in the input portion
      const digitsOnly = raw.replace(/\D/g, '')
      if (digitsOnly === '') {
        onChange('')
        return
      }
      onChange(sanitizeWhatsApp(digitsOnly))
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text')
      const sanitized = sanitizeWhatsApp(pasted)
      onChange(sanitized)
    }

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
          {/* Fixed +62 prefix */}
          <span
            className={cn(
              "absolute left-3 text-sm font-medium select-none pointer-events-none",
              error ? "text-red-500" : "text-(--gray-11)",
            )}
          >
            +62
          </span>
          <input
            id={inputId}
            type="tel"
            ref={ref}
            value={displayValue}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="8123456789"
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
              'pl-11 pr-3',
              className,
            )}
            {...props}
          />
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
WhatsAppInput.displayName = 'WhatsAppInput'

export { WhatsAppInput, sanitizeWhatsApp }

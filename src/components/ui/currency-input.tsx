import * as React from 'react'
import { cn } from '@/lib/utils'

function formatRupiah(raw: string): string {
  if (!raw) return ''
  const num = parseInt(raw, 10)
  if (isNaN(num)) return ''
  return `Rp ${num.toLocaleString('id-ID')}`
}

export function CurrencyInput({
  className,
  onChange,
  onBlur,
  value,
  placeholder = 'Rp 0',
  id,
  name,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const raw = typeof value === 'number' ? value.toString() : (value || '').replace(/\D/g, '')
  const displayValue = raw ? formatRupiah(raw) : ''

  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!input || document.activeElement !== input) return
    const len = displayValue.length
    input.setSelectionRange(len, len)
  }, [displayValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDigits = e.target.value.replace(/\D/g, '')
    onChange?.({
      ...e,
      target: { ...e.target, value: newDigits, name },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      {...props}
      id={id}
      name={name}
      className={cn(
        'flex h-10 w-full rounded-lg border px-3 text-sm',
        'bg-(--gray-1) text-(--gray-12) placeholder:text-(--gray-9)',
        'border-(--gray-6) hover:border-(--gray-8)',
        'focus:outline-none focus:ring-2 focus:ring-(--blue-9) focus:border-(--blue-8)',
        'transition-all duration-200',
        className
      )}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  )
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number to Indonesian Rupiah (IDR).
 */
export function formatIDR(val: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

/** Parse API decimal strings (e.g. unit_price) without showing NaN in the UI. */
export function parseUnitPrice(value: string | number | null | undefined, fallback = 0): number {
  if (value == null || value === '') return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const n = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

export function formatUnitPrice(value: string | number | null | undefined, emptyLabel = '—'): string {
  const n = parseUnitPrice(value, NaN)
  if (!Number.isFinite(n)) return emptyLabel
  return n.toLocaleString('id-ID')
}

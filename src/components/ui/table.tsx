import * as React from 'react'
import { CaretSortIcon, ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

interface TableContextValue {
  striped: boolean
  compact: boolean
}

const TableContext = React.createContext<TableContextValue>({
  striped: false,
  compact: false,
})

/* ------------------------------------------------------------------ */
/*  Table root                                                          */
/* ------------------------------------------------------------------ */

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alternate row background */
  striped?: boolean
  /** Reduced padding */
  compact?: boolean
  /** Stick the header while scrolling inside the wrapper */
  stickyHeader?: boolean
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, striped = false, compact = false, stickyHeader = false, children, ...props }, ref) => (
    <TableContext.Provider value={{ striped, compact }}>
      <div
        ref={ref}
        className={cn(
          'w-full overflow-auto rounded-xl border border-(--gray-6)',
          className
        )}
        {...props}
      >
        <table
          className={cn(
            'w-full caption-bottom border-collapse text-sm',
            stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10'
          )}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  )
)
Table.displayName = 'Table'

/* ------------------------------------------------------------------ */
/*  Sections                                                            */
/* ------------------------------------------------------------------ */

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-(--gray-2) border-b border-(--gray-6)', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      '[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-(--gray-6) bg-(--gray-1)',
      className
    )}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-(--gray-6) bg-(--gray-2) font-medium text-(--gray-12)',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

/* ------------------------------------------------------------------ */
/*  TableRow                                                            */
/* ------------------------------------------------------------------ */

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
  clickable?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, ...props }, ref) => {
    const { striped } = React.useContext(TableContext)
    return (
      <tr
        ref={ref}
        data-selected={selected || undefined}
        className={cn(
          'transition-colors duration-150',
          'hover:bg-(--gray-a2)',
          selected && 'bg-(--blue-a2) hover:bg-(--blue-a3)',
          striped && 'even:bg-(--gray-a1)',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

/* ------------------------------------------------------------------ */
/*  TableHead  (th)                                                     */
/* ------------------------------------------------------------------ */

type SortDirection = 'asc' | 'desc' | false

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDir?: SortDirection
  onSort?: () => void
  numeric?: boolean
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDir, onSort, numeric, children, ...props }, ref) => {
    const { compact } = React.useContext(TableContext)
    return (
      <th
        ref={ref}
        onClick={sortable ? onSort : undefined}
        className={cn(
          'text-left text-xs font-semibold text-(--gray-10) uppercase tracking-wider whitespace-nowrap',
          compact ? 'px-3 py-2' : 'px-4 py-3',
          numeric && 'text-right',
          sortable &&
            'cursor-pointer select-none hover:text-(--gray-12) hover:bg-(--gray-a2) transition-colors duration-150',
          className
        )}
        {...props}
      >
        {sortable ? (
          <span
            className={cn(
              'inline-flex items-center gap-1',
              numeric && 'flex-row-reverse'
            )}
          >
            {children}
            <span className="shrink-0">
              {sortDir === 'asc' ? (
                <ChevronUpIcon className="h-3.5 w-3.5 text-(--blue-9)" />
              ) : sortDir === 'desc' ? (
                <ChevronDownIcon className="h-3.5 w-3.5 text-(--blue-9)" />
              ) : (
                <CaretSortIcon className="h-3.5 w-3.5 text-(--gray-8)" />
              )}
            </span>
          </span>
        ) : (
          children
        )}
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

/* ------------------------------------------------------------------ */
/*  TableCell  (td)                                                     */
/* ------------------------------------------------------------------ */

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Right-align + monospace digits */
  numeric?: boolean
  /** Muted / secondary text color */
  muted?: boolean
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, numeric, muted, ...props }, ref) => {
    const { compact } = React.useContext(TableContext)
    return (
      <td
        ref={ref}
        className={cn(
          'text-sm whitespace-nowrap',
          compact ? 'px-3 py-2' : 'px-4 py-3.5',
          numeric
            ? 'text-right font-medium tabular-nums text-(--gray-12)'
            : muted
            ? 'text-(--gray-10)'
            : 'text-(--gray-12)',
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

/* ------------------------------------------------------------------ */
/*  TableCaption                                                        */
/* ------------------------------------------------------------------ */

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-(--gray-10)', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

/* ------------------------------------------------------------------ */
/*  TableEmpty                                                          */
/* ------------------------------------------------------------------ */

interface TableEmptyProps {
  colSpan: number
  message?: string
  description?: string
  icon?: React.ReactNode
}

function TableEmpty({
  colSpan,
  message = 'No results',
  description = 'No data to display.',
  icon,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          {icon && (
            <div className="text-(--gray-7) mb-1">{icon}</div>
          )}
          <p className="text-sm font-medium text-(--gray-11)">{message}</p>
          <p className="text-xs text-(--gray-9)">{description}</p>
        </div>
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/*  TableSkeleton                                                       */
/* ------------------------------------------------------------------ */

interface TableSkeletonProps {
  rows?: number
  cols: number
}

function TableSkeleton({ rows = 5, cols }: TableSkeletonProps) {
  const { compact } = React.useContext(TableContext)
  const widths = ['w-3/5', 'w-4/5', 'w-2/5', 'w-full', 'w-3/4']
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className={compact ? 'px-3 py-2' : 'px-4 py-3.5'}>
              <div
                className={cn(
                  'h-3.5 rounded-md bg-(--gray-4) animate-pulse',
                  widths[(rowIdx + colIdx) % widths.length],
                  colIdx === cols - 1 && 'ml-auto w-1/3'
                )}
              />
            </td>
          ))}
        </TableRow>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  TablePagination                                                     */
/* ------------------------------------------------------------------ */

interface TablePaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function TablePagination({ page, pageSize, total, onPageChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-(--gray-6) bg-(--gray-1)">
      <p className="text-xs text-(--gray-10)">
        Showing <span className="font-medium text-(--gray-12)">{from}–{to}</span> of{' '}
        <span className="font-medium text-(--gray-12)">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-(--gray-11) text-sm transition-colors hover:bg-(--gray-a3) disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-7 min-w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors px-1',
              p === page
                ? 'bg-(--blue-9) text-(--blue-contrast)'
                : 'text-(--gray-11) hover:bg-(--gray-a3) cursor-pointer'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-(--gray-11) text-sm transition-colors hover:bg-(--gray-a3) disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Exports                                                             */
/* ------------------------------------------------------------------ */

export type { SortDirection }
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
  TablePagination,
}

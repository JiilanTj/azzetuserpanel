import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/stores/workspace.store'
import {
  useTrialBalance,
  useBalanceSheet,
  useIncomeStatement,
  useCashFlow,
  useLedger,
  useAccounts,
} from '@/hooks/use-accounting'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { 
  TrialBalanceEntry, 
  BalanceSheetReport, 
  IncomeStatementReport,
  CashFlowEntry,
  LedgerEntryResponse,
  AccountResponse
} from '@/lib/api/types/accounting.types'

export const reportsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/reports',
  component: ReportsPage,
})

function formatCurrency(amount: string | number) {
  return Number(amount).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// ----------------------------------------------------------------------
// Constants for Default Periods
// ----------------------------------------------------------------------
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
const DEFAULT_PERIOD = `${currentYear}-${currentMonth}`
const DEFAULT_DATE_FROM = `${DEFAULT_PERIOD}-01`
const DEFAULT_DATE_TO = new Date(currentYear, currentDate.getMonth() + 1, 0).toISOString().split('T')[0]

// ----------------------------------------------------------------------
// Sub-components for each report
// ----------------------------------------------------------------------

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-(--blue-9) border-t-transparent" />
        <p className="text-sm text-(--gray-10)">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-20 border border-dashed border-(--gray-6) rounded-xl bg-(--gray-2)">
      <p className="text-sm text-(--gray-10)">{children}</p>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-widest text-(--gray-10) mb-3 px-1">
      {title}
    </h4>
  )
}

function AmountRow({ label, amount, bold, indent, className }: {
  label: string
  amount: string | number
  bold?: boolean
  indent?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      'flex items-center justify-between py-2 px-3 rounded-lg transition-colors hover:bg-(--gray-3)',
      bold && 'font-semibold text-(--gray-12)',
      className
    )}>
      <span className={cn('text-sm text-(--gray-11)', indent && 'pl-4', bold && 'text-(--gray-12)')}>{label}</span>
      <span className={cn('text-sm font-mono tabular-nums', bold ? 'text-(--gray-12)' : 'text-(--gray-12)')}>
        {Number(amount) !== 0 ? formatCurrency(amount) : '-'}
      </span>
    </div>
  )
}

// -------------------------------------------------------
// Trial Balance
// -------------------------------------------------------

function TrialBalanceView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useTrialBalance(workspaceId, DEFAULT_PERIOD, DEFAULT_PERIOD)
  
  if (isLoading) return <LoadingState label="Memuat Neraca Saldo..." />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState>Data tidak tersedia.</EmptyState>

  const trialBalanceData = data as TrialBalanceEntry[]
  const totalDebit = trialBalanceData.reduce((acc, row) => acc + Number(row.total_debit), 0)
  const totalCredit = trialBalanceData.reduce((acc, row) => acc + Number(row.total_credit), 0)

  return (
    <div className="rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-(--gray-6) bg-(--gray-2)">
        <h3 className="font-semibold text-(--gray-12) text-sm">Neraca Saldo</h3>
        <p className="text-xs text-(--gray-10) mt-0.5">Periode {DEFAULT_PERIOD}</p>
      </div>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-(--gray-6) text-[11px] font-semibold uppercase tracking-wider text-(--gray-10)">
            <th className="py-2.5 pl-5 pr-4 w-[120px]">Kode</th>
            <th className="py-2.5 px-4">Nama Akun</th>
            <th className="py-2.5 px-4 text-right w-[140px]">Debit</th>
            <th className="py-2.5 pr-5 pl-4 text-right w-[140px]">Kredit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--gray-5)">
          {trialBalanceData.map((row) => (
            <tr key={row.account_id} className="hover:bg-(--gray-2) transition-colors">
              <td className="py-2.5 pl-5 pr-4 font-mono text-xs text-(--gray-11)">{row.code}</td>
              <td className="py-2.5 px-4 text-(--gray-12) font-medium">{row.name}</td>
              <td className="py-2.5 px-4 text-right font-mono tabular-nums text-(--gray-12)">
                {Number(row.total_debit) > 0 ? formatCurrency(row.total_debit) : '-'}
              </td>
              <td className="py-2.5 pr-5 pl-4 text-right font-mono tabular-nums text-(--gray-12)">
                {Number(row.total_credit) > 0 ? formatCurrency(row.total_credit) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-(--gray-8) bg-(--gray-2) font-semibold">
            <td colSpan={2} className="py-3 pl-5 pr-4 text-right text-xs uppercase tracking-wider text-(--gray-11)">Total</td>
            <td className="py-3 px-4 text-right font-mono tabular-nums">{formatCurrency(totalDebit)}</td>
            <td className="py-3 pr-5 pl-4 text-right font-mono tabular-nums">{formatCurrency(totalCredit)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// -------------------------------------------------------
// Balance Sheet
// -------------------------------------------------------

function BalanceSheetView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useBalanceSheet(workspaceId, DEFAULT_PERIOD)
  
  if (isLoading) return <LoadingState label="Memuat Neraca..." />
  if (!data) return <EmptyState>Data tidak tersedia.</EmptyState>

  const report = data as BalanceSheetReport

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Card */}
        <div className="rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-(--gray-2) border-b border-(--gray-6)">
            <h3 className="font-semibold text-(--gray-12) text-sm">Aset (Aktiva)</h3>
          </div>
          <div className="divide-y divide-(--gray-5)">
            {report.assets?.map((a) => (
              <AmountRow key={a.account_id} label={`${a.code} - ${a.name}`} amount={a.balance} />
            ))}
            {(!report.assets || report.assets.length === 0) && (
              <div className="p-5"><p className="text-xs text-(--gray-9) italic">Tidak ada data</p></div>
            )}
          </div>
          <div className="px-5 py-3 border-t-2 border-(--gray-7) bg-(--gray-2) flex justify-between font-semibold text-sm">
            <span>Total Aset</span>
            <span className="font-mono tabular-nums">{formatCurrency(report.total_assets)}</span>
          </div>
        </div>

        {/* Liabilities & Equity Card */}
        <div className="rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-(--gray-2) border-b border-(--gray-6)">
            <h3 className="font-semibold text-(--gray-12) text-sm">Liabilitas & Ekuitas</h3>
          </div>
          <div className="divide-y divide-(--gray-5)">
            {report.liabilities && report.liabilities.length > 0 && (
              <>
                <SectionHeader title="Liabilitas (Kewajiban)" />
                {report.liabilities.map((l) => (
                  <AmountRow key={l.account_id} label={`${l.code} - ${l.name}`} amount={l.balance} />
                ))}
              </>
            )}
            {report.equity && report.equity.length > 0 && (
              <>
                <SectionHeader title="Ekuitas (Modal)" />
                {report.equity.map((e) => (
                  <AmountRow key={e.account_id} label={`${e.code} - ${e.name}`} amount={e.balance} />
                ))}
              </>
            )}
            {(!report.liabilities?.length && !report.equity?.length) && (
              <div className="p-5"><p className="text-xs text-(--gray-9) italic">Tidak ada data</p></div>
            )}
          </div>
          <div className="px-5 py-3 border-t-2 border-(--gray-7) bg-(--gray-2) flex justify-between font-semibold text-sm">
            <span>Total Liabilitas & Ekuitas</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(Number(report.total_liabilities) + Number(report.total_equity))}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Indicator */}
      <div className={cn(
        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border',
        report.is_balanced
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
      )}>
        <span className="text-base">{report.is_balanced ? '✓' : '⚠️'}</span>
        {report.is_balanced ? 'Neraca Seimbang (Balanced)' : 'Neraca Tidak Seimbang (Unbalanced)'}
      </div>
    </div>
  )
}

// -------------------------------------------------------
// Income Statement
// -------------------------------------------------------

function IncomeStatementView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useIncomeStatement(workspaceId, DEFAULT_PERIOD, DEFAULT_PERIOD)
  
  if (isLoading) return <LoadingState label="Memuat Laba Rugi..." />
  if (!data) return <EmptyState>Data tidak tersedia.</EmptyState>

  const report = data as IncomeStatementReport
  const isProfit = Number(report.net_income) >= 0

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-(--gray-2) border-b border-(--gray-6) text-center">
        <h3 className="font-semibold text-(--gray-12)">Laporan Laba Rugi</h3>
        <p className="text-xs text-(--gray-10) mt-0.5">Periode {DEFAULT_PERIOD}</p>
      </div>
      
      <div className="divide-y divide-(--gray-5)">
        {/* Revenue */}
        <div>
          <div className="px-5 py-3 bg-(--gray-2)">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-(--gray-10)">Pendapatan</h4>
          </div>
          {report.revenue?.map((r) => (
            <AmountRow key={r.account_id} label={`${r.code} - ${r.name}`} amount={r.balance} />
          ))}
          {(!report.revenue?.length) && (
            <div className="px-5 py-3"><p className="text-xs text-(--gray-9) italic">Tidak ada transaksi pendapatan</p></div>
          )}
          <div className="px-5 py-2.5 bg-(--gray-2) flex justify-between font-semibold text-sm border-t border-(--gray-6)">
            <span>Total Pendapatan</span>
            <span className="font-mono tabular-nums">{formatCurrency(report.total_revenue)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div className="px-5 py-3 bg-(--gray-2)">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-(--gray-10)">Beban Operasional</h4>
          </div>
          {report.expenses?.map((e) => (
            <AmountRow key={e.account_id} label={`${e.code} - ${e.name}`} amount={e.balance} />
          ))}
          {(!report.expenses?.length) && (
            <div className="px-5 py-3"><p className="text-xs text-(--gray-9) italic">Tidak ada transaksi beban</p></div>
          )}
          <div className="px-5 py-2.5 bg-(--gray-2) flex justify-between font-semibold text-sm border-t border-(--gray-6)">
            <span>Total Beban</span>
            <span className="font-mono tabular-nums">{formatCurrency(report.total_expenses)}</span>
          </div>
        </div>
      </div>

      {/* Net Income */}
      <div className={cn(
        'px-5 py-4 flex justify-between items-center border-t-2',
        isProfit
          ? 'bg-emerald-50 dark:bg-emerald-950/30'
          : 'bg-red-50 dark:bg-red-950/30'
      )}>
        <div>
          <span className={cn(
            'text-sm font-bold',
            isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          )}>
            {isProfit ? 'Laba Bersih' : 'Rugi Bersih'}
          </span>
          <p className="text-[10px] text-(--gray-10) mt-0.5">{isProfit ? 'Pendapatan melebihi beban' : 'Beban melebihi pendapatan'}</p>
        </div>
        <span className={cn(
          'text-lg font-bold font-mono tabular-nums',
          isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
        )}>
          {isProfit ? '+' : '-'} {formatCurrency(Math.abs(Number(report.net_income)))}
        </span>
      </div>
    </div>
  )
}

// -------------------------------------------------------
// Cash Flow
// -------------------------------------------------------

function CashFlowView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useCashFlow(workspaceId, DEFAULT_DATE_FROM, DEFAULT_DATE_TO)
  
  if (isLoading) return <LoadingState label="Memuat Arus Kas..." />
  if (!data || !Array.isArray(data) || data.length === 0) return <EmptyState>Data tidak tersedia.</EmptyState>

  const cashflowData = data as CashFlowEntry[]
  const totalInflow = cashflowData.reduce((acc, r) => acc + Number(r.total_debit), 0)
  const totalOutflow = cashflowData.reduce((acc, r) => acc + Number(r.total_credit), 0)
  const totalNetFlow = totalInflow - totalOutflow

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Uang Masuk</p>
          <p className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{formatCurrency(totalInflow)}</p>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-900 p-4 bg-red-50/50 dark:bg-red-950/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">Uang Keluar</p>
          <p className="text-lg font-bold font-mono tabular-nums text-red-700 dark:text-red-400">{formatCurrency(totalOutflow)}</p>
        </div>
        <div className={cn(
          'rounded-xl border p-4',
          totalNetFlow >= 0
            ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
        )}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-(--gray-10) mb-1">Arus Kas Bersih</p>
          <p className={cn(
            'text-lg font-bold font-mono tabular-nums',
            totalNetFlow >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
          )}>
            {formatCurrency(totalNetFlow)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-(--gray-2) border-b border-(--gray-6)">
          <h3 className="font-semibold text-(--gray-12) text-sm">Rincian Arus Kas</h3>
          <p className="text-xs text-(--gray-10) mt-0.5">{DEFAULT_DATE_FROM} – {DEFAULT_DATE_TO}</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-(--gray-6) text-[11px] font-semibold uppercase tracking-wider text-(--gray-10)">
              <th className="py-2.5 pl-5 pr-4">Periode</th>
              <th className="py-2.5 px-4 text-right w-[140px]">Uang Masuk</th>
              <th className="py-2.5 px-4 text-right w-[140px]">Uang Keluar</th>
              <th className="py-2.5 pr-5 pl-4 text-right w-[140px]">Arus Kas Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--gray-5)">
            {cashflowData.map((row, i) => (
              <tr key={i} className="hover:bg-(--gray-2) transition-colors">
                <td className="py-2.5 pl-5 pr-4 font-medium text-(--gray-12)">{formatDate(row.date)}</td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {Number(row.total_debit) > 0 ? formatCurrency(row.total_debit) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-red-600 dark:text-red-400">
                  {Number(row.total_credit) > 0 ? formatCurrency(row.total_credit) : '-'}
                </td>
                <td className={cn(
                  'py-2.5 pr-5 pl-4 text-right font-semibold font-mono tabular-nums',
                  Number(row.net_flow) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {formatCurrency(row.net_flow)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// -------------------------------------------------------
// Ledger
// -------------------------------------------------------

function LedgerView({ workspaceId }: { workspaceId: string }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  
  const { data: accountsData } = useAccounts(workspaceId, true)
  const accounts = (accountsData || []) as AccountResponse[]
  const selectableAccounts = accounts.filter(a => a.level > 1 && !a.is_system)

  const { data: ledgerData, isLoading } = useLedger(workspaceId, selectedAccount)
  const entries = (ledgerData || []) as LedgerEntryResponse[]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 rounded-xl border border-(--gray-6) bg-(--gray-2)">
        <label className="text-sm font-semibold text-(--gray-12) whitespace-nowrap">Pilih Akun</label>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[340px]">
            <SelectValue placeholder="-- Pilih Akun --" />
          </SelectTrigger>
          <SelectContent searchable searchPlaceholder="Cari akun...">
            {selectableAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedAccount ? (
        <EmptyState>Silakan pilih akun perkiraan di atas untuk melihat rincian Buku Besar (Ledger).</EmptyState>
      ) : isLoading ? (
        <LoadingState label="Memuat data buku besar..." />
      ) : entries.length === 0 ? (
        <EmptyState>Belum ada transaksi pada akun ini.</EmptyState>
      ) : (
        <div className="rounded-xl border border-(--gray-6) overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-(--gray-2) border-b border-(--gray-6)">
            <h3 className="font-semibold text-(--gray-12) text-sm">Buku Besar</h3>
            <p className="text-xs text-(--gray-10) mt-0.5">{entries.length} entri jurnal</p>
          </div>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-(--gray-6) text-[11px] font-semibold uppercase tracking-wider text-(--gray-10)">
                <th className="py-2.5 pl-5 pr-4 w-[110px]">Tanggal</th>
                <th className="py-2.5 px-4 w-[130px]">No. Transaksi</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-4 text-right w-[130px]">Debit</th>
                <th className="py-2.5 px-4 text-right w-[130px]">Kredit</th>
                <th className="py-2.5 pr-5 pl-4 text-right w-[140px]">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--gray-5)">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-(--gray-2) transition-colors">
                  <td className="py-2.5 pl-5 pr-4 text-(--gray-11) whitespace-nowrap">{formatDate(entry.transaction_date)}</td>
                  <td className="py-2.5 px-4 font-medium text-(--gray-12)">{entry.transaction_number}</td>
                  <td className="py-2.5 px-4 text-(--gray-11)">{entry.tx_description || '-'}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-(--gray-12)">
                    {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : ''}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-(--gray-12)">
                    {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : ''}
                  </td>
                  <td className="py-2.5 pr-5 pl-4 text-right font-semibold font-mono tabular-nums text-(--gray-12)">
                    {formatCurrency(entry.running_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// Main Reports Page
// ----------------------------------------------------------------------

function ReportsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const [activeTab, setActiveTab] = useState('INCOME_STATEMENT')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Laporan Keuangan
        </h1>
        <p className="text-sm text-(--gray-10)">
          Pantau kesehatan finansial perusahaan melalui laporan akuntansi terpadu secara real-time.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="INCOME_STATEMENT">Laba Rugi</TabsTrigger>
          <TabsTrigger value="BALANCE_SHEET">Neraca</TabsTrigger>
          <TabsTrigger value="TRIAL_BALANCE">Neraca Saldo</TabsTrigger>
          <TabsTrigger value="CASH_FLOW">Arus Kas</TabsTrigger>
          <TabsTrigger value="LEDGER">Buku Besar</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {activeWorkspace?.entity_id ? (
            <>
              {activeTab === 'INCOME_STATEMENT' && <IncomeStatementView workspaceId={activeWorkspace.entity_id} />}
              {activeTab === 'BALANCE_SHEET' && <BalanceSheetView workspaceId={activeWorkspace.entity_id} />}
              {activeTab === 'TRIAL_BALANCE' && <TrialBalanceView workspaceId={activeWorkspace.entity_id} />}
              {activeTab === 'CASH_FLOW' && <CashFlowView workspaceId={activeWorkspace.entity_id} />}
              {activeTab === 'LEDGER' && <LedgerView workspaceId={activeWorkspace.entity_id} />}
            </>
          ) : (
            <div className="py-12 text-center text-(--gray-11)">Pilih workspace aktif terlebih dahulu.</div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

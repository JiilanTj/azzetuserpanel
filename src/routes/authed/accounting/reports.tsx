import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
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

function TrialBalanceView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useTrialBalance(workspaceId, DEFAULT_PERIOD, DEFAULT_PERIOD)
  
  if (isLoading) return <div className="py-12 text-center text-(--gray-11)">Memuat Neraca Saldo...</div>
  if (!data || !Array.isArray(data) || data.length === 0) return <div className="py-12 text-center text-(--gray-11)">Data tidak tersedia.</div>

  const trialBalanceData = data as TrialBalanceEntry[]

  const totalDebit = trialBalanceData.reduce((acc, row) => acc + Number(row.total_debit), 0)
  const totalCredit = trialBalanceData.reduce((acc, row) => acc + Number(row.total_credit), 0)

  return (
    <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
          <tr>
            <th className="py-3 px-4 font-medium">Kode Akun</th>
            <th className="py-3 px-4 font-medium">Nama Akun</th>
            <th className="py-3 px-4 font-medium text-right">Debit (IDR)</th>
            <th className="py-3 px-4 font-medium text-right">Kredit (IDR)</th>
          </tr>
        </thead>
        <tbody>
          {trialBalanceData.map((row) => (
            <tr key={row.account_id} className="border-b border-(--gray-4) hover:bg-(--gray-3)">
              <td className="py-3 px-4 font-mono text-xs">{row.code}</td>
              <td className="py-3 px-4 font-medium text-(--gray-12)">{row.name}</td>
              <td className="py-3 px-4 text-right">{Number(row.total_debit) > 0 ? formatCurrency(row.total_debit) : '-'}</td>
              <td className="py-3 px-4 text-right">{Number(row.total_credit) > 0 ? formatCurrency(row.total_credit) : '-'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-(--gray-3) font-medium border-t-2 border-(--gray-6)">
          <tr>
            <td colSpan={2} className="py-3 px-4 text-right">Total:</td>
            <td className="py-3 px-4 text-right text-(--gray-12)">{formatCurrency(totalDebit)}</td>
            <td className="py-3 px-4 text-right text-(--gray-12)">{formatCurrency(totalCredit)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function BalanceSheetView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useBalanceSheet(workspaceId, DEFAULT_PERIOD)
  
  if (isLoading) return <div className="py-12 text-center text-(--gray-11)">Memuat Neraca...</div>
  if (!data) return <div className="py-12 text-center text-(--gray-11)">Data tidak tersedia.</div>

  const report = data as BalanceSheetReport

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Assets */}
      <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--gray-6) bg-(--gray-3)">
          <h3 className="font-bold text-(--gray-12)">Aset (Aktiva)</h3>
        </div>
        <div className="flex-1 p-5 space-y-2">
          {report.assets?.map((a) => (
            <div key={a.account_id} className="flex justify-between text-sm py-1.5 border-b border-(--gray-4) last:border-0">
              <span className="text-(--gray-11)">{a.code} - {a.name}</span>
              <span className="font-medium text-(--gray-12)">{formatCurrency(a.balance)}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t-2 border-(--gray-6) bg-(--gray-3) flex justify-between font-bold text-(--gray-12)">
          <span>Total Aset</span>
          <span>{formatCurrency(report.total_assets)}</span>
        </div>
      </div>

      {/* Liabilities & Equity */}
      <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-(--gray-6) bg-(--gray-3)">
          <h3 className="font-bold text-(--gray-12)">Kewajiban & Ekuitas (Pasiva)</h3>
        </div>
        <div className="flex-1 p-5 space-y-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-(--gray-10) uppercase tracking-wider mb-2">Kewajiban</h4>
            {report.liabilities?.map((l) => (
              <div key={l.account_id} className="flex justify-between text-sm py-1.5 border-b border-(--gray-4) last:border-0">
                <span className="text-(--gray-11)">{l.code} - {l.name}</span>
                <span className="font-medium text-(--gray-12)">{formatCurrency(l.balance)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-(--gray-10) uppercase tracking-wider mb-2">Ekuitas</h4>
            {report.equity?.map((e) => (
              <div key={e.account_id} className="flex justify-between text-sm py-1.5 border-b border-(--gray-4) last:border-0">
                <span className="text-(--gray-11)">{e.code} - {e.name}</span>
                <span className="font-medium text-(--gray-12)">{formatCurrency(e.balance)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t-2 border-(--gray-6) bg-(--gray-3) flex justify-between font-bold text-(--gray-12)">
          <span>Total Kewajiban & Ekuitas</span>
          <span>{formatCurrency(Number(report.total_liabilities) + Number(report.total_equity))}</span>
        </div>
      </div>
      
      {/* Balance Indicator */}
      <div className={`md:col-span-2 p-4 text-center rounded-lg font-medium border ${report.is_balanced ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900'}`}>
        {report.is_balanced ? '✓ Neraca Seimbang (Balanced)' : '⚠️ Neraca Tidak Seimbang (Unbalanced)'}
      </div>
    </div>
  )
}

function IncomeStatementView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useIncomeStatement(workspaceId, DEFAULT_PERIOD, DEFAULT_PERIOD)
  
  if (isLoading) return <div className="py-12 text-center text-(--gray-11)">Memuat Laba Rugi...</div>
  if (!data) return <div className="py-12 text-center text-(--gray-11)">Data tidak tersedia.</div>

  const report = data as IncomeStatementReport

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-(--gray-6) bg-(--gray-3) text-center">
        <h3 className="font-bold text-lg text-(--gray-12)">Laporan Laba Rugi</h3>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Revenue */}
        <div>
          <h4 className="font-bold text-(--gray-12) mb-3 border-b border-(--gray-5) pb-2">Pendapatan</h4>
          <div className="space-y-2">
            {report.revenue?.map((r) => (
              <div key={r.account_id} className="flex justify-between text-sm py-1">
                <span className="text-(--gray-11)">{r.code} - {r.name}</span>
                <span className="font-medium text-(--gray-12)">{formatCurrency(r.balance)}</span>
              </div>
            ))}
            {(!report.revenue || report.revenue.length === 0) && (
              <p className="text-sm text-(--gray-10) italic">Tidak ada transaksi pendapatan</p>
            )}
          </div>
          <div className="flex justify-between font-bold text-sm text-(--gray-12) mt-4 pt-2 border-t border-(--gray-5)">
            <span>Total Pendapatan</span>
            <span>{formatCurrency(report.total_revenue)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div>
          <h4 className="font-bold text-(--gray-12) mb-3 border-b border-(--gray-5) pb-2">Beban Pokok & Operasional</h4>
          <div className="space-y-2">
            {report.expenses?.map((e) => (
              <div key={e.account_id} className="flex justify-between text-sm py-1">
                <span className="text-(--gray-11)">{e.code} - {e.name}</span>
                <span className="font-medium text-(--gray-12)">{formatCurrency(e.balance)}</span>
              </div>
            ))}
            {(!report.expenses || report.expenses.length === 0) && (
              <p className="text-sm text-(--gray-10) italic">Tidak ada transaksi beban</p>
            )}
          </div>
          <div className="flex justify-between font-bold text-sm text-(--gray-12) mt-4 pt-2 border-t border-(--gray-5)">
            <span>Total Beban</span>
            <span>{formatCurrency(report.total_expenses)}</span>
          </div>
        </div>
      </div>

      {/* Net Income */}
      <div className={`px-6 py-5 border-t-4 border-(--gray-6) flex justify-between font-bold text-lg ${Number(report.net_income) >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
        <span>{Number(report.net_income) >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}</span>
        <span>{formatCurrency(report.net_income)}</span>
      </div>
    </div>
  )
}

function CashFlowView({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useCashFlow(workspaceId, DEFAULT_DATE_FROM, DEFAULT_DATE_TO)
  
  if (isLoading) return <div className="py-12 text-center text-(--gray-11)">Memuat Arus Kas...</div>
  if (!data || !Array.isArray(data) || data.length === 0) return <div className="py-12 text-center text-(--gray-11)">Data tidak tersedia.</div>

  const cashflowData = data as CashFlowEntry[]

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  return (
    <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden max-w-4xl mx-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
          <tr>
            <th className="py-3 px-4 font-medium">Periode (Tanggal)</th>
            <th className="py-3 px-4 font-medium text-right">Uang Masuk (Inflow)</th>
            <th className="py-3 px-4 font-medium text-right">Uang Keluar (Outflow)</th>
            <th className="py-3 px-4 font-medium text-right">Arus Kas Bersih</th>
          </tr>
        </thead>
        <tbody>
          {cashflowData.map((row, i) => (
            <tr key={i} className="border-b border-(--gray-4) hover:bg-(--gray-3)">
              <td className="py-3 px-4 font-medium text-(--gray-12)">{formatDate(row.date)}</td>
              <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">{formatCurrency(row.total_debit)}</td>
              <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">{formatCurrency(row.total_credit)}</td>
              <td className={`py-3 px-4 text-right font-bold ${Number(row.net_flow) >= 0 ? 'text-(--gray-12)' : 'text-red-500'}`}>
                {formatCurrency(row.net_flow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LedgerView({ workspaceId }: { workspaceId: string }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  
  const { data: accountsData } = useAccounts(workspaceId)
  const accounts = (accountsData || []) as AccountResponse[]
  // Only show level 2+ accounts that can have transactions
  const selectableAccounts = accounts.filter(a => a.level > 1 && !a.is_system)

  const { data: ledgerData, isLoading } = useLedger(workspaceId, selectedAccount)
  const entries = (ledgerData || []) as LedgerEntryResponse[]

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-(--gray-2) p-4 rounded-xl border border-(--gray-6) flex items-center gap-4">
        <label className="text-sm font-medium text-(--gray-12) whitespace-nowrap">Pilih Akun Buku Besar:</label>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="-- Pilih Akun --" />
          </SelectTrigger>
          <SelectContent>
            {selectableAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedAccount ? (
        <div className="py-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
          Silakan pilih akun perkiraan di atas untuk melihat rincian Buku Besar (Ledger).
        </div>
      ) : isLoading ? (
        <div className="py-12 text-center text-(--gray-11)">Memuat data buku besar...</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
          Belum ada transaksi pada akun ini.
        </div>
      ) : (
        <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
              <tr>
                <th className="py-3 px-4 font-medium w-[120px]">Tanggal</th>
                <th className="py-3 px-4 font-medium w-[150px]">No. Transaksi</th>
                <th className="py-3 px-4 font-medium">Keterangan</th>
                <th className="py-3 px-4 font-medium text-right w-[150px]">Debit</th>
                <th className="py-3 px-4 font-medium text-right w-[150px]">Kredit</th>
                <th className="py-3 px-4 font-medium text-right w-[150px]">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-(--gray-4) hover:bg-(--gray-3)">
                  <td className="py-3 px-4 whitespace-nowrap text-(--gray-11)">{formatDate(entry.transaction_date)}</td>
                  <td className="py-3 px-4 font-medium text-(--gray-12)">{entry.transaction_number}</td>
                  <td className="py-3 px-4 text-(--gray-11)">{entry.tx_description || '-'}</td>
                  <td className="py-3 px-4 text-right text-(--gray-12)">{Number(entry.debit) > 0 ? formatCurrency(entry.debit) : ''}</td>
                  <td className="py-3 px-4 text-right text-(--gray-12)">{Number(entry.credit) > 0 ? formatCurrency(entry.credit) : ''}</td>
                  <td className="py-3 px-4 text-right font-medium text-(--gray-12)">{formatCurrency(entry.running_balance)}</td>
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
        <TabsList className="mb-6 flex overflow-x-auto">
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

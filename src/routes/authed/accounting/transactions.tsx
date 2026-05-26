import { useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useTransactions, useVoidTransaction } from '@/hooks/use-accounting'
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import {
  PlusIcon,
  EyeOpenIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import type { TransactionResponse } from '@/lib/api/types/accounting.types'

export const transactionsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions',
  component: TransactionsPage,
})

function TransactionsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: transactionsData, isLoading } = useTransactions(activeWorkspace?.entity_id)
  const voidMutation = useVoidTransaction(activeWorkspace?.entity_id)

  const [activeTab, setActiveTab] = useState<'ALL' | 'IN' | 'OUT' | 'JOURNAL'>('ALL')

  const transactions = transactionsData || []
  
  const filteredTransactions = transactions.filter((t: TransactionResponse) => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'IN') return t.transaction_type === 'CASH_IN' || t.transaction_type === 'SALES'
    if (activeTab === 'OUT') return t.transaction_type === 'CASH_OUT' || t.transaction_type === 'PURCHASE'
    if (activeTab === 'JOURNAL') return t.transaction_type === 'JOURNAL'
    return true
  })

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const handleVoid = (id: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan (void) transaksi ini? Jurnal pembalik akan otomatis dibuat.')) {
      voidMutation.mutate(id)
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch(type) {
      case 'CASH_IN': return 'Uang Masuk'
      case 'CASH_OUT': return 'Uang Keluar'
      case 'SALES': return 'Penjualan'
      case 'PURCHASE': return 'Pembelian'
      case 'JOURNAL_ENTRY': return 'Jurnal Umum'
      default: return type
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Transaksi & Jurnal
          </h1>
          <p className="text-sm text-(--gray-10)">
            Catat dan pantau seluruh transaksi keuangan dan jurnal bisnis Anda.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Note: The "to" path assumes /accounting/transactions/new will exist shortly */}
          <Link to="/accounting/transactions/new" className="inline-flex">
            <Button variant="solid">
              <PlusIcon className="mr-2" />
              Catat Transaksi Baru
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'ALL' | 'IN' | 'OUT' | 'JOURNAL')} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">Semua</TabsTrigger>
          <TabsTrigger value="IN">Pemasukan</TabsTrigger>
          <TabsTrigger value="OUT">Pengeluaran</TabsTrigger>
          <TabsTrigger value="JOURNAL">Jurnal Umum</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border border-(--gray-6) rounded-xl overflow-hidden bg-white dark:bg-(--gray-2)">
        <table className="w-full text-sm text-left">
          <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
            <tr>
              <th className="py-3 px-4 font-medium w-[120px]">Tanggal</th>
              <th className="py-3 px-4 font-medium w-[160px]">Nomor Transaksi</th>
              <th className="py-3 px-4 font-medium min-w-[200px]">Deskripsi</th>
              <th className="py-3 px-4 font-medium w-[130px]">Tipe</th>
              <th className="py-3 px-4 font-medium w-[150px] text-right">Total (IDR)</th>
              <th className="py-3 px-4 font-medium w-[100px] text-center">Status</th>
              <th className="py-3 px-4 font-medium w-[100px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-(--gray-11)">Memuat data transaksi...</td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-(--gray-11)">Belum ada transaksi tercatat.</td>
              </tr>
            ) : (
              filteredTransactions.map((trx: TransactionResponse) => (
                <tr key={trx.id} className="border-b border-(--gray-5) hover:bg-(--gray-3) transition-colors group">
                  <td className="py-3 px-4 whitespace-nowrap text-(--gray-11)">
                    {formatDate(trx.transaction_date)}
                  </td>
                  <td className="py-3 px-4 font-medium text-(--gray-12)">
                    {trx.transaction_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="block truncate max-w-[200px]" title={trx.description || '-'}>
                      {trx.description || '-'}
                    </span>
                    {trx.counterparty_name && (
                      <span className="text-xs text-(--gray-10)">Klien/Vendor: {trx.counterparty_name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {getTransactionTypeLabel(trx.transaction_type)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-(--gray-12)">
                    {Number(trx.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge 
                      variant={trx.status === 'POSTED' ? 'success' : trx.status === 'VOIDED' ? 'error' : 'gray'} 
                      className="text-[10px]"
                    >
                      {trx.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Note: The "to" path assumes /accounting/transactions/$id will exist shortly */}
                      <Link to="/accounting/transactions/$id" params={{ id: trx.id }}>
                        <Button 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-(--gray-11)"
                          title="Lihat Jurnal"
                        >
                          <EyeOpenIcon className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {trx.status !== 'VOIDED' && (
                        <Button 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleVoid(trx.id)}
                          title="Void Transaksi"
                        >
                          <Cross2Icon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

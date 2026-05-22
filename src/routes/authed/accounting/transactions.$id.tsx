import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useTransaction, useVoidTransaction } from '@/hooks/use-accounting'
import {
  Button,
  Badge,
} from '@/components/ui'
import { ArrowLeftIcon, Cross2Icon } from '@radix-ui/react-icons'

export const transactionDetailRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions/$id',
  component: TransactionDetailPage,
})

function TransactionDetailPage() {
  const { id } = transactionDetailRoute.useParams()
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()
  
  const { data: trx, isLoading } = useTransaction(activeWorkspace?.id, id)
  const voidMutation = useVoidTransaction(activeWorkspace?.id)

  const handleVoid = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan (void) transaksi ini? Jurnal pembalik akan otomatis dibuat.')) {
      voidMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse h-8 bg-(--gray-4) w-1/4 rounded mb-4"></div>
        <div className="animate-pulse h-[300px] bg-(--gray-4) w-full rounded"></div>
      </div>
    )
  }

  if (!trx) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 text-center">
        <h2 className="text-xl font-medium text-(--gray-12)">Transaksi tidak ditemukan</h2>
        <Button variant="outline" onClick={() => navigate({ to: '/accounting/transactions' })}>
          Kembali ke Riwayat
        </Button>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
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

  const totalDebit = trx.journal_entries?.reduce((sum, entry) => sum + Number(entry.debit), 0) || 0
  const totalCredit = trx.journal_entries?.reduce((sum, entry) => sum + Number(entry.credit), 0) || 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-(--gray-5) pb-6">
        <Link to="/accounting/transactions">
          <Button variant="ghost" className="h-8 w-8 p-0" title="Kembali">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) flex items-center gap-3">
            {trx.transaction_number}
            <Badge 
              variant={trx.status === 'POSTED' ? 'success' : trx.status === 'VOIDED' ? 'error' : 'gray'}
            >
              {trx.status}
            </Badge>
          </h1>
          <p className="text-sm text-(--gray-10) mt-1">
            Dicatat pada {formatDate(trx.transaction_date)} • Oleh {trx.created_by || 'Sistem'}
          </p>
        </div>
        {trx.status !== 'VOIDED' && (
          <Button 
            variant="outline" 
            className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleVoid}
            loading={voidMutation.isPending}
          >
            <Cross2Icon className="mr-2" />
            Void Transaksi
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Detail Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-(--gray-2) p-5 rounded-xl border border-(--gray-6) space-y-4">
            <h3 className="font-semibold text-(--gray-12) border-b border-(--gray-5) pb-2">Informasi Umum</h3>
            
            <div className="space-y-1">
              <p className="text-xs text-(--gray-10)">Tipe Transaksi</p>
              <p className="text-sm font-medium text-(--gray-12)">{getTransactionTypeLabel(trx.transaction_type)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-(--gray-10)">Nominal Total</p>
              <p className="text-sm font-medium text-(--gray-12)">
                Rp {Number(trx.amount).toLocaleString('id-ID')}
              </p>
            </div>

            {trx.counterparty_name && (
              <div className="space-y-1">
                <p className="text-xs text-(--gray-10)">Pihak Ketiga</p>
                <p className="text-sm font-medium text-(--gray-12)">{trx.counterparty_name}</p>
              </div>
            )}

            {trx.category && (
              <div className="space-y-1">
                <p className="text-xs text-(--gray-10)">Kategori (AI)</p>
                <p className="text-sm font-medium text-(--gray-12) flex items-center gap-2">
                  {trx.category}
                  {trx.ai_confidence && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      {trx.ai_confidence}%
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {trx.description && (
              <div className="space-y-1">
                <p className="text-xs text-(--gray-10)">Keterangan Tambahan</p>
                <p className="text-sm font-medium text-(--gray-12)">{trx.description}</p>
              </div>
            )}

            {trx.reversed_transaction_id && (
              <div className="space-y-1 mt-4 p-3 bg-red-50 dark:bg-red-950 rounded border border-red-100 dark:border-red-900">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Transaksi ini adalah jurnal pembalik (Void) untuk ID:</p>
                <Link to="/accounting/transactions/$id" params={{ id: trx.reversed_transaction_id }} className="text-xs text-blue-600 hover:underline break-all">
                  {trx.reversed_transaction_id}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Journal Entries & Line Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--gray-6) bg-(--gray-3)">
              <h3 className="font-semibold text-(--gray-12)">Entri Jurnal</h3>
              <p className="text-xs text-(--gray-10)">Rincian debet dan kredit akun perkiraan</p>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-5)">
                <tr>
                  <th className="py-2.5 px-5 font-medium">Kode Akun</th>
                  <th className="py-2.5 px-5 font-medium">Nama Akun</th>
                  <th className="py-2.5 px-5 font-medium text-right">Debit</th>
                  <th className="py-2.5 px-5 font-medium text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {trx.journal_entries?.map((entry) => (
                  <tr key={entry.id} className="border-b border-(--gray-4) last:border-0 hover:bg-(--gray-3) transition-colors">
                    <td className="py-3 px-5 text-(--gray-11) font-mono text-xs">{entry.account_code}</td>
                    <td className="py-3 px-5 font-medium text-(--gray-12)">{entry.account_name}</td>
                    <td className="py-3 px-5 text-right text-(--gray-12)">
                      {Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-5 text-right text-(--gray-12)">
                      {Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-(--gray-3) font-medium border-t-2 border-(--gray-6)">
                <tr>
                  <td colSpan={2} className="py-3 px-5 text-right">Total Balance:</td>
                  <td className="py-3 px-5 text-right text-(--gray-12)">
                    {totalDebit.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-5 text-right text-(--gray-12)">
                    {totalCredit.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {trx.line_items && trx.line_items.length > 0 && (
            <div className="bg-white dark:bg-(--gray-2) border border-(--gray-6) rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-(--gray-6) bg-(--gray-3)">
                <h3 className="font-semibold text-(--gray-12)">Rincian Item (Line Items)</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-5)">
                  <tr>
                    <th className="py-2.5 px-5 font-medium">Item</th>
                    <th className="py-2.5 px-5 font-medium text-right">Qty</th>
                    <th className="py-2.5 px-5 font-medium text-right">Harga Satuan</th>
                    <th className="py-2.5 px-5 font-medium text-right">Total Baris</th>
                  </tr>
                </thead>
                <tbody>
                  {trx.line_items.map((item) => (
                    <tr key={item.id} className="border-b border-(--gray-4) last:border-0 hover:bg-(--gray-3)">
                      <td className="py-3 px-5">
                        <span className="font-medium text-(--gray-12) block">{item.description}</span>
                      </td>
                      <td className="py-3 px-5 text-right text-(--gray-11)">{item.quantity} {item.unit || ''}</td>
                      <td className="py-3 px-5 text-right text-(--gray-12)">{Number(item.unit_price).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-5 text-right font-medium text-(--gray-12)">
                        {Number(item.line_total).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

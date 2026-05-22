import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'

export const transactionDetailRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions/$id',
  component: TransactionDetailPage,
})

function TransactionDetailPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="p-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
        Detail Transaksi & Jurnal (Work in progress...)
      </div>
    </div>
  )
}

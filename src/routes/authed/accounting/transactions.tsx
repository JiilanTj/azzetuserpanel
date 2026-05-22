import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'

export const transactionsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions',
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Transaksi & Jurnal
        </h1>
        <p className="text-sm text-(--gray-10)">
          Catat dan pantau seluruh transaksi keuangan bisnis Anda.
        </p>
      </div>
      <div className="p-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
        Work in progress...
      </div>
    </div>
  )
}

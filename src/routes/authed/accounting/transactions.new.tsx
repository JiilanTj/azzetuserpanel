import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'

export const newTransactionRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions/new',
  component: NewTransactionPage,
})

function NewTransactionPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="p-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
        Form Pencatatan Transaksi Baru (Work in progress...)
      </div>
    </div>
  )
}

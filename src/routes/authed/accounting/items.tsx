import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'

export const itemsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/items',
  component: ItemsPage,
})

function ItemsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Katalog Barang & Jasa
        </h1>
        <p className="text-sm text-(--gray-10)">
          Kelola daftar produk dan layanan untuk transaksi penjualan atau pembelian.
        </p>
      </div>
      <div className="p-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
        Work in progress...
      </div>
    </div>
  )
}

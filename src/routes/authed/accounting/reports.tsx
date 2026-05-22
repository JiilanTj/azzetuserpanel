import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'

export const reportsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/reports',
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Laporan Keuangan
        </h1>
        <p className="text-sm text-(--gray-10)">
          Pantau kesehatan finansial perusahaan melalui laporan akuntansi terpadu.
        </p>
      </div>
      <div className="p-12 text-center text-(--gray-11) border border-dashed border-(--gray-6) rounded-xl">
        Work in progress...
      </div>
    </div>
  )
}

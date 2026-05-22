import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { Button } from '@/components/ui'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import logoSvg from '@/assets/logo.svg'

export const paymentFailedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/failed',
  component: PaymentFailedPage,
})

function PaymentFailedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-8" />

      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-5">
          <CrossCircledIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-(--gray-12) mb-2">
          Pembayaran Gagal
        </h1>
        <p className="text-sm text-(--gray-10) mb-6 leading-relaxed">
          Pembayaran tidak dapat diproses. Ini bisa terjadi karena saldo tidak mencukupi, timeout, atau pembatalan. Silakan coba lagi.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={() => navigate({ to: '/plans', replace: true })}
            variant="solid"
            size="3"
            className="w-full"
          >
            Coba Lagi
          </Button>
          <Button
            onClick={() => navigate({ to: '/workspaces', replace: true })}
            variant="outline"
            size="3"
            className="w-full"
          >
            Kembali ke Workspace
          </Button>
        </div>
      </div>
    </div>
  )
}

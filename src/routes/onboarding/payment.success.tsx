import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { rootRoute } from '../__root'
import { Button } from '@/components/ui'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import logoSvg from '@/assets/logo.svg'

export const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment/success',
  component: PaymentSuccessPage,
})

function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate({ to: '/dashboard', replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-8" />

      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-5">
          <CheckCircledIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold text-(--gray-12) mb-2">
          Pembayaran Berhasil!
        </h1>
        <p className="text-sm text-(--gray-10) mb-6 leading-relaxed">
          Terima kasih! Langganan Anda telah aktif. Anda akan dialihkan ke dashboard dalam {countdown} detik.
        </p>

        <Button
          onClick={() => navigate({ to: '/dashboard', replace: true })}
          variant="solid"
          size="3"
          className="w-full max-w-xs"
        >
          Masuk ke Dashboard
        </Button>
      </div>
    </div>
  )
}

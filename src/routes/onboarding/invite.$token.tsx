import { createRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { rootRoute } from '../__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import { workspaceService } from '@/lib/api/services'
import { Button } from '@/components/ui'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import logoSvg from '@/assets/logo.svg'

export const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invite/$token',
  beforeLoad: authMiddleware.requireAuth,
  component: InvitePage,
})

type InviteStatus = 'loading' | 'success' | 'error'

function InvitePage() {
  const navigate = useNavigate()
  const { token } = inviteRoute.useParams()
  const [status, setStatus] = useState<InviteStatus>(() => token ? 'loading' : 'error')
  const [message, setMessage] = useState(() => token ? '' : 'Token undangan tidak valid.')

  useEffect(() => {
    if (!token) return

    async function acceptInvite() {
      try {
        const resp = await workspaceService.acceptInvite(token)
        setStatus('success')
        setMessage(resp.message || 'Undangan berhasil diterima!')
      } catch (err: unknown) {
        setStatus('error')
        if (err instanceof Error) {
          setMessage(err.message)
        } else {
          setMessage('Gagal menerima undangan. Silakan coba lagi.')
        }
      }
    }

    acceptInvite()
  }, [token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-8" />

      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent mb-4" />
          <p className="text-sm font-medium text-(--gray-12)">Memproses undangan...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
            <CheckCircledIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-(--gray-12) mb-2">Berhasil!</h1>
          <p className="text-sm text-(--gray-10) mb-6">{message}</p>
          <Button
            onClick={() => navigate({ to: '/workspaces', replace: true })}
            variant="solid"
            size="3"
            className="w-full max-w-xs"
          >
            Pilih Workspace
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
            <CrossCircledIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-(--gray-12) mb-2">Undangan Gagal</h1>
          <p className="text-sm text-(--gray-10) mb-6">{message}</p>
          <Button
            onClick={() => navigate({ to: '/workspaces', replace: true })}
            variant="outline"
            size="3"
            className="w-full max-w-xs"
          >
            Kembali ke Workspace
          </Button>
        </div>
      )}
    </div>
  )
}

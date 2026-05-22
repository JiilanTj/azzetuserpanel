import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { rootRoute } from '../__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import logoSvg from '@/assets/logo.svg'

export const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  beforeLoad: authMiddleware.requireAuth,
  component: SetupPage,
})

/**
 * Post-login orchestration page.
 * Simply redirects to workspace selection — always.
 */
function SetupPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/workspaces', replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <img src={logoSvg} alt="Azzet" className="h-12 w-12 mb-6" />
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent mb-4" />
      <p className="text-sm font-medium text-(--gray-12)">Memuat...</p>
    </div>
  )
}

import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { rootRoute } from './__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import { businessService } from '@/lib/api/services'
import { useWorkspaceStore } from '@/stores/workspace.store'
import type { WorkspaceResponse } from '@/lib/api/types'
import logoSvg from '@/assets/logo.svg'

export const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  beforeLoad: authMiddleware.requireAuth,
  component: SetupPage,
})

/**
 * Post-login orchestration page.
 *
 * Decision tree (per USER_FLOW.md):
 * 1. Fetch workspaces
 * 2. If empty → poll every 2s (backend auto-creates personal workspace async)
 *    - After 10s of polling with no result → redirect to /workspaces/new
 * 3. If 1 workspace → auto-select → check subscription
 * 4. If multiple workspaces → redirect to /workspaces (picker)
 * 5. Check subscription:
 *    - active/trial → /dashboard
 *    - 404/expired/cancelled → /plans
 */
function SetupPage() {
  const navigate = useNavigate()
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()
  const [status, setStatus] = useState<'loading' | 'polling' | 'checking-sub'>('loading')
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | null = null

    async function checkSubscription(workspace: WorkspaceResponse) {
      if (cancelled) return
      setStatus('checking-sub')

      try {
        const subscription = await businessService.getSubscription(workspace.entity_id)
        if (cancelled) return

        if (subscription && (subscription.status === 'active' || subscription.status === 'trial')) {
          navigate({ to: '/dashboard', replace: true })
        } else {
          // expired or cancelled
          navigate({ to: '/plans', replace: true })
        }
      } catch {
        // 404 = no subscription
        if (!cancelled) navigate({ to: '/plans', replace: true })
      }
    }

    async function handleWorkspaces(workspaces: WorkspaceResponse[]) {
      if (cancelled) return

      if (workspaces.length === 1) {
        // Single workspace → auto-select
        setActiveWorkspace(workspaces[0])
        await checkSubscription(workspaces[0])
      } else if (workspaces.length > 1) {
        // Multiple workspaces → check if we already have one selected that's valid
        if (activeWorkspace && workspaces.find(w => w.id === activeWorkspace.id)) {
          await checkSubscription(activeWorkspace)
        } else {
          // No valid selection → go to workspace picker
          navigate({ to: '/workspaces', replace: true })
        }
      }
    }

    async function fetchWorkspaces() {
      try {
        const workspaces = await businessService.listWorkspaces()
        if (cancelled) return

        if (workspaces && workspaces.length > 0) {
          await handleWorkspaces(workspaces)
        } else {
          // No workspaces yet — start polling (backend creates async)
          setStatus('polling')
          poll()
        }
      } catch {
        if (!cancelled) {
          // Network error — try to proceed to dashboard anyway
          navigate({ to: '/dashboard', replace: true })
        }
      }
    }

    function poll() {
      setPollCount(prev => {
        const next = prev + 1
        if (next > 5) {
          // After 5 polls (10 seconds), fallback to manual creation
          if (!cancelled) navigate({ to: '/workspaces/new', replace: true })
          return next
        }
        return next
      })

      pollTimer = setTimeout(async () => {
        if (cancelled) return
        try {
          const workspaces = await businessService.listWorkspaces()
          if (cancelled) return

          if (workspaces && workspaces.length > 0) {
            await handleWorkspaces(workspaces)
          } else {
            poll()
          }
        } catch {
          if (!cancelled) poll()
        }
      }, 2000)
    }

    fetchWorkspaces()

    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <img src={logoSvg} alt="Azzet" className="h-12 w-12 mb-6" />
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent mb-4" />
      <p className="text-sm font-medium text-(--gray-12) mb-1">
        {status === 'polling'
          ? 'Menyiapkan workspace Anda...'
          : status === 'checking-sub'
          ? 'Memeriksa langganan...'
          : 'Memuat...'}
      </p>
      <p className="text-xs text-(--gray-9)">
        {status === 'polling'
          ? `Menunggu sistem memproses... (${pollCount}/5)`
          : 'Memeriksa status akun Anda'}
      </p>
    </div>
  )
}

import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { adminAuthService } from '@/lib/api/services'

// -------------------------------------------------------
// Auth Middleware
//
// Reusable guard functions for TanStack Router's
// `beforeLoad` and `loader` hooks.
//
// Usage in a route:
//   beforeLoad: authMiddleware.requireGuest
//   loader:     authMiddleware.requireAuth
//
// NOTE: accessToken is in-memory only (not persisted).
// On page refresh the token is gone, so EVERY guard that
// cares about auth must attempt a silent refresh via the
// HttpOnly refresh cookie before making a decision.
// -------------------------------------------------------

/** Shared silent-refresh helper — returns true if user has a valid session */
async function tryRefresh(): Promise<boolean> {
  const { isAuthenticated, setAuth } = useAuthStore.getState()
  if (isAuthenticated) return true

  try {
    const data = await adminAuthService.refresh()
    setAuth(data.access_token, data.admin)
    return true
  } catch {
    return false
  }
}

export const authMiddleware = {
  /**
   * `requireAuth` — Use in `loader` of protected routes.
   *
   * Flow:
   *  1. If access token is in memory → allow.
   *  2. If not → try silent refresh via HttpOnly cookie.
   *  3. If refresh fails → redirect to /login with ?redirect=<current url>.
   */
  requireAuth: async ({ location }: { location: { href: string } }) => {
    const authed = await tryRefresh()
    if (!authed) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },

  /**
   * `requireGuest` — Use in `beforeLoad` of public-only routes (e.g. /login).
   *
   * Flow:
   *  1. If access token is in memory → already logged in → redirect /dashboard.
   *  2. If not → try silent refresh.
   *  3. If refresh succeeds → already has valid session → redirect /dashboard.
   *  4. If refresh fails → genuinely a guest → show the page.
   */
  requireGuest: async () => {
    const authed = await tryRefresh()
    if (authed) throw redirect({ to: '/dashboard' })
  },

  /**
   * `smartRedirect` — Use in `beforeLoad` of the index route ( / ).
   *
   * Authenticated (or valid cookie) → /dashboard
   * Guest                           → /login
   */
  smartRedirect: async () => {
    const authed = await tryRefresh()
    throw redirect({ to: authed ? '/dashboard' : '/login' })
  },
}

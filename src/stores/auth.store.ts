import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AdminResponse } from '@/lib/api/types'

// -------------------------------------------------------
// Auth Store
//
// Strategy:
//   - access_token → in-memory only (not persisted to avoid XSS leakage)
//   - admin profile → persisted to sessionStorage (not localStorage) so it
//     survives a page refresh within the same tab but not across sessions.
//   - The HttpOnly refresh cookie is managed by the backend/browser.
// -------------------------------------------------------

interface AuthState {
  /** JWT access token — kept in memory only */
  accessToken: string | null
  /** Authenticated admin profile */
  admin: AdminResponse | null
  /** True when we have a valid access token */
  isAuthenticated: boolean

  /** Store tokens + profile after a successful login/refresh */
  setAuth: (accessToken: string, admin: AdminResponse) => void
  /** Wipe all auth state (on logout or refresh failure) */
  clearAuth: () => void
  /** Update just the access token (e.g. after silent refresh) */
  setToken: (accessToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (accessToken, admin) =>
        set({ accessToken, admin, isAuthenticated: true }),

      clearAuth: () =>
        set({ accessToken: null, admin: null, isAuthenticated: false }),

      setToken: (accessToken) =>
        set({ accessToken, isAuthenticated: true }),
    }),
    {
      name: 'azzet-admin-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist profile — never persist the access token
      partialize: (state) => ({ admin: state.admin }),
    }
  )
)

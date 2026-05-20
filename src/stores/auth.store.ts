import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserResponse } from '@/lib/api/types'

// -------------------------------------------------------
// Auth Store
//
// Strategy:
//   - access_token → in-memory only (not persisted to avoid XSS leakage)
//   - user profile → persisted to sessionStorage (not localStorage) so it
//     survives a page refresh within the same tab but not across sessions.
//   - The HttpOnly refresh cookie is managed by the backend/browser.
// -------------------------------------------------------

interface AuthState {
  /** JWT access token — kept in memory only */
  accessToken: string | null
  /** Authenticated user profile */
  user: UserResponse | null
  /** True when we have a valid access token */
  isAuthenticated: boolean

  /** Store token + profile after a successful login/refresh */
  setAuth: (accessToken: string, user: UserResponse) => void
  /** Wipe all auth state (on logout or refresh failure) */
  clearAuth: () => void
  /** Update just the access token (e.g. after silent refresh) */
  setToken: (accessToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }),

      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),

      setToken: (accessToken) =>
        set({ accessToken, isAuthenticated: true }),
    }),
    {
      name: 'azzet-user-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist profile — never persist the access token
      partialize: (state) => ({ user: state.user }),
    }
  )
)

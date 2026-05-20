import ky, { HTTPError } from 'ky'
import type { APIResponse, AuthResponse } from './types'

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

// -------------------------------------------------------
// Token-refresh queue
// -------------------------------------------------------

let _isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
let _queue: QueueItem[] = []

function drainQueue(err: unknown, token: string | null) {
  _queue.forEach(p => (err ? p.reject(err) : p.resolve(token!)))
  _queue = []
}

async function doRefresh(): Promise<string> {
  if (_isRefreshing) {
    return new Promise<string>((resolve, reject) => _queue.push({ resolve, reject }))
  }

  _isRefreshing = true
  try {
    const { useAuthStore } = await import('@/stores/auth.store')

    const res = await ky
      .post(`${BASE_URL}/auth/refresh`, { credentials: 'include' })
      .json<APIResponse<AuthResponse>>()

    const { access_token, user } = res.data
    useAuthStore.getState().setAuth(access_token, user)
    drainQueue(null, access_token)
    return access_token
  } catch (err) {
    drainQueue(err, null)
    const { useAuthStore } = await import('@/stores/auth.store')
    useAuthStore.getState().clearAuth()
    window.location.replace('/login')
    throw err
  } finally {
    _isRefreshing = false
  }
}

// -------------------------------------------------------
// NOTE: ky v2 auto-populates HTTPError.data with the
// parsed JSON response body when you call .json() on the
// ResponsePromise. DO NOT use err.response.clone().json()
// in catch handlers — the stream is already consumed.
// Use err.data directly instead.
// -------------------------------------------------------

export const apiClient = ky.create({
  prefix: BASE_URL,
  credentials: 'include',
  timeout: 30_000,
  retry: 0,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { useAuthStore } = await import('@/stores/auth.store')
        const token = useAuthStore.getState().accessToken
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }

        const { useWorkspaceStore } = await import('@/stores/workspace.store')
        const activeWorkspace = useWorkspaceStore.getState().activeWorkspace
        if (activeWorkspace && !request.headers.has('X-Workspace-ID')) {
          request.headers.set('X-Workspace-ID', activeWorkspace.entity_id)
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        const isAuth401 =
          response.status === 401 &&
          retryCount === 0 &&
          !request.url.includes('/auth/refresh') &&
          !request.url.includes('/auth/login/')

        if (!isAuth401) return response

        try {
          const newToken = await doRefresh()
          const headers = new Headers(request.headers)
          headers.set('Authorization', `Bearer ${newToken}`)
          return ky.retry({ request: new Request(request, { headers }), code: 'TOKEN_REFRESHED' })
        } catch {
          return response
        }
      },
    ],
  },
})

export const publicClient = ky.create({
  prefix: BASE_URL,
  credentials: 'include',
  timeout: 30_000,
  retry: 0,
})

export { HTTPError }

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminAuthService } from '@/lib/api/services'
import { HTTPError } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginRequest, MFAVerifyRequest, MFASetupConfirmRequest } from '@/lib/api/types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const adminAuthKeys = {
  all: ['admin', 'auth'] as const,
  me: () => [...adminAuthKeys.all, 'me'] as const,
}

// -------------------------------------------------------
// API error types
// -------------------------------------------------------

interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    domain?: string
  }
}

// -------------------------------------------------------
// Friendly message mapper
//
// Maps backend error code + message combos to copy that
// matches the app's professional-but-human tone.
// Unknown errors fall back to a safe generic message.
// -------------------------------------------------------

const MESSAGE_MAP: Record<string, string> = {
  // Auth — credentials
  'UNAUTHORIZED:invalid credentials':                          'Invalid email or password. Please double-check and try again.',
  'UNAUTHORIZED:account is suspended':                         'This account has been suspended. Contact your super administrator.',

  // Auth — MFA verify
  'BAD_REQUEST:invalid mfa code':                              'That code is incorrect or has expired — please check your authenticator app and enter the latest code.',
  'UNAUTHORIZED:invalid or expired mfa token':                 'Your MFA session has expired. Please start the sign-in process again.',
  'UNAUTHORIZED:invalid mfa session':                          'Your MFA session is invalid. Please sign in again.',
  'BAD_REQUEST:mfa is already enabled':                        'Two-factor authentication is already set up for this account.',
  'BAD_REQUEST:mfa setup not initiated':                       'Please initiate MFA setup first.',

  // Token / Session
  'UNAUTHORIZED:invalid access token':                         'Your session is no longer valid. Please sign in again.',
  'UNAUTHORIZED:invalid refresh token':                        'Your session has expired. Please sign in again.',
  'UNAUTHORIZED:missing refresh token':                        'No active session found. Please sign in.',
  'UNAUTHORIZED:invalid or expired token':                     'Your session has expired. Please sign in again.',
  'UNAUTHORIZED:token has been revoked':                       'Your session was revoked. Please sign in again.',

  // Admin management
  'BAD_REQUEST:email already registered':                      'An admin with this email already exists.',
  'BAD_REQUEST:invalid role':                                  'Invalid role specified.',
  'BAD_REQUEST:invalid status':                                'Invalid status specified.',
  'BAD_REQUEST:password must be at least 12 characters':       'Password must be at least 12 characters.',

  // Validation
  'BAD_REQUEST:invalid request body':                          'The request format is invalid. Please check your input.',
  'BAD_REQUEST:email and password are required':               'Email and password are required.',
  'BAD_REQUEST:mfa_token and code are required':               'MFA token and verification code are required.',
  'BAD_REQUEST:code is required':                              'Verification code is required.',
  'BAD_REQUEST:email, name, role, and password are required':  'All fields are required to invite an admin.',

  // Not found
  'NOT_FOUND:admin not found':                                 'Admin account not found.',

  // Server errors
  'INTERNAL_ERROR:failed to list admins':                      'Failed to load admin list. Please try again.',
  'INTERNAL_ERROR:failed to verify token':                     'Something went wrong verifying your session. Please try again.',
  'INTERNAL_ERROR:failed to create mfa session':               'Failed to start MFA verification. Please try again.',
}

function friendlyMessage(body: ApiErrorBody): string {
  const { code, message } = body.error
  const key = `${code}:${message.toLowerCase()}`

  // Exact match first
  if (MESSAGE_MAP[key]) return MESSAGE_MAP[key]

  // Partial message match (handles slight variations from the backend)
  const partialKey = Object.keys(MESSAGE_MAP).find(k => {
    const [mapCode, mapMsg] = k.split(':')
    return mapCode === code && message.toLowerCase().includes(mapMsg)
  })
  if (partialKey) return MESSAGE_MAP[partialKey]

  // Generic fallbacks by code
  switch (code) {
    case 'UNAUTHORIZED':      return 'Authentication failed. Please sign in again.'
    case 'FORBIDDEN':         return 'You don\'t have permission to perform this action.'
    case 'NOT_FOUND':         return 'The requested resource could not be found.'
    case 'TOO_MANY_REQUESTS': return 'Too many attempts. Please wait a moment before trying again.'
    case 'BAD_REQUEST':       return 'The request could not be completed. Please check your input and try again.'
    default:                  return 'Something went wrong. Please try again.'
  }
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof HTTPError) {
    // error.data is pre-populated by the attachErrorBody beforeError hook in client.ts
    const body = err.data as ApiErrorBody | { message?: string } | undefined

    if (body && 'error' in body && (body as ApiErrorBody).error?.code) {
      return friendlyMessage(body as ApiErrorBody)
    }
    // Non-standard shape fallback
    return (body as { message?: string } | undefined)?.message
      ?? err.response.statusText
      ?? 'Something went wrong. Please try again.'
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

// -------------------------------------------------------
// useLogin — Step 1 (email + password)
// -------------------------------------------------------

export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (body: LoginRequest) => adminAuthService.login(body),
    onError: (err) => {
      const msg = extractErrorMessage(err)
      toast.error('Login failed', { description: msg })
    },
    // NOTE: Callers should inspect `data.requires_mfa` to decide next step:
    //   true  → show MFA input, call useMfaVerify
    //   false → first login, call useMfaSetup
    //
    // Store temp token when MFA not yet set up:
    onSuccess: (data) => {
      if (!data.requires_mfa && data.access_token) {
        // Temp token — only store for MFA setup flow
        setAuth(data.access_token, data.admin)
      }
    },
  })
}

// -------------------------------------------------------
// useMfaVerify — Step 2a (verify TOTP for existing MFA)
// -------------------------------------------------------

export function useMfaVerify() {
  const { setAuth } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: MFAVerifyRequest) => adminAuthService.mfaVerify(body),
    onSuccess: (data) => {
      setAuth(data.access_token, data.admin)
      qc.invalidateQueries({ queryKey: adminAuthKeys.me() })
      toast.success(`Welcome back, ${data.admin.name}!`)
    },
    onError: (err) => {
      const msg = extractErrorMessage(err)
      toast.error('MFA verification failed', { description: msg })
    },
  })
}

// -------------------------------------------------------
// useMfaSetup — Step 2b first login — initiate MFA setup
// -------------------------------------------------------

export function useMfaSetup() {
  return useMutation({
    mutationFn: () => adminAuthService.mfaSetup(),
    onError: (err) => {
      const msg = extractErrorMessage(err)
      toast.error('MFA setup failed', { description: msg })
    },
  })
}

// -------------------------------------------------------
// useMfaConfirm — Step 2b first login — confirm TOTP code
// -------------------------------------------------------

export function useMfaConfirm() {
  const { setAuth } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: MFASetupConfirmRequest) => adminAuthService.mfaConfirm(body),
    onSuccess: (data) => {
      setAuth(data.access_token, data.admin)
      qc.invalidateQueries({ queryKey: adminAuthKeys.me() })
      toast.success(`MFA enabled! Welcome, ${data.admin.name}`)
    },
    onError: (err) => {
      const msg = extractErrorMessage(err)
      toast.error('MFA confirmation failed', { description: msg })
    },
  })
}

// -------------------------------------------------------
// useLogout
// -------------------------------------------------------

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => adminAuthService.logout(),
    onSettled: () => {
      clearAuth()
      qc.clear()
    },
    onSuccess: () => toast.success('Signed out successfully'),
    onError: (err) => {
      const msg = extractErrorMessage(err)
      toast.error('Logout error', { description: msg })
    },
  })
}

// -------------------------------------------------------
// useMe — Get current admin profile (React Query cached)
// -------------------------------------------------------

export function useMe() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: adminAuthKeys.me(),
    queryFn: () => adminAuthService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000, // 5 min
  })
}

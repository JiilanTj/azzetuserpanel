import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/api/services'
import { useAuthStore } from '@/stores/auth.store'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  LoginEmailRequest,
  LoginOTPRequest,
  RegisterRequest,
  VerifyOTPRequest,
  RequestOTPRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from '@/lib/api/types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
}

// -------------------------------------------------------
// useRegister — create new account
// -------------------------------------------------------

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => authService.register(body),
    onError: (err) => {
      toast.error('Pendaftaran gagal', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useVerifyOTP — activate account after registration
// -------------------------------------------------------

export function useVerifyOTP() {
  return useMutation({
    mutationFn: (body: VerifyOTPRequest) => authService.verifyOTP(body),
    onSuccess: () => {
      toast.success('Akun berhasil diverifikasi!')
    },
    onError: (err) => {
      toast.error('Verifikasi gagal', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useRequestOTP — send OTP via WhatsApp
// -------------------------------------------------------

export function useRequestOTP() {
  return useMutation({
    mutationFn: (body: RequestOTPRequest) => authService.requestOTP(body),
    onSuccess: () => {
      toast.success('Kode OTP telah dikirim ke WhatsApp kamu.')
    },
    onError: (err) => {
      toast.error('Gagal mengirim OTP', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useLoginEmail — Step 1: email + password
// -------------------------------------------------------

export function useLoginEmail() {
  const { setAuth } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: LoginEmailRequest) => authService.loginEmail(body),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      qc.invalidateQueries({ queryKey: authKeys.me() })
      toast.success(`Selamat datang, ${data.user.name}!`)
    },
    onError: (err) => {
      toast.error('Login gagal', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useLoginOTP — WhatsApp OTP login
// -------------------------------------------------------

export function useLoginOTP() {
  const { setAuth } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: LoginOTPRequest) => authService.loginOTP(body),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      qc.invalidateQueries({ queryKey: authKeys.me() })
      toast.success(`Selamat datang, ${data.user.name}!`)
    },
    onError: (err) => {
      toast.error('Login gagal', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useLogout — logout current session
// -------------------------------------------------------

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth()
      qc.clear()
      navigate({ to: '/login' })
    },
    onSuccess: () => toast.success('Berhasil keluar.'),
    onError: (err) => {
      toast.error('Gagal keluar', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useLogoutAll — revoke all sessions
// -------------------------------------------------------

export function useLogoutAll() {
  const { clearAuth } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSettled: () => {
      clearAuth()
      qc.clear()
      navigate({ to: '/login' })
    },
    onSuccess: () => toast.success('Semua sesi berhasil diakhiri.'),
    onError: (err) => {
      toast.error('Gagal mengakhiri semua sesi', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useMe — get current user profile (React Query cached)
// -------------------------------------------------------

export function useMe() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000, // 5 min
  })
}

// -------------------------------------------------------
// useSessions — list all active sessions
// -------------------------------------------------------

export function useSessions() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authService.listSessions(),
    enabled: isAuthenticated,
    staleTime: 60_000, // 1 min
  })
}

// -------------------------------------------------------
// useRevokeSession — revoke a specific session by ID
// -------------------------------------------------------

export function useRevokeSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.sessions() })
      toast.success('Sesi berhasil dicabut.')
    },
    onError: (err) => {
      toast.error('Gagal mencabut sesi', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useChangePassword — change password (requires auth)
// -------------------------------------------------------

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => authService.changePassword(body),
    onSuccess: () => {
      toast.success('Password berhasil diubah.')
    },
    onError: (err) => {
      toast.error('Gagal mengubah password', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useResetPassword — reset password via OTP (no auth)
// -------------------------------------------------------

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: ResetPasswordRequest) => authService.resetPassword(body),
    onSuccess: () => {
      toast.success('Password berhasil direset. Silakan masuk dengan password baru.')
    },
    onError: (err) => {
      toast.error('Gagal reset password', { description: extractErrorMessage(err) })
    },
  })
}

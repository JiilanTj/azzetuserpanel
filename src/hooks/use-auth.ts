import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/api/services'
import { HTTPError } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth.store'
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
// feels natural for end users (not admins).
// -------------------------------------------------------

const MESSAGE_MAP: Record<string, string> = {
  // Credentials
  'UNAUTHORIZED:invalid credentials':                    'Email atau password salah. Silakan cek kembali.',
  'UNAUTHORIZED:account is suspended':                   'Akun ini telah dinonaktifkan. Hubungi dukungan kami.',
  'UNAUTHORIZED:account is not verified':                'Akun belum diverifikasi. Cek email atau WhatsApp kamu.',
  'UNAUTHORIZED:account is deleted':                     'Akun ini tidak ditemukan.',

  // OTP
  'BAD_REQUEST:invalid or expired otp':                  'Kode salah atau sudah kedaluwarsa. Coba minta kode baru.',
  'BAD_REQUEST:otp already used':                        'Kode ini sudah digunakan. Minta kode baru.',
  'BAD_REQUEST:otp not found':                           'Kode tidak ditemukan. Silakan minta kode baru.',
  'TOO_MANY_REQUESTS:too many otp requests':             'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.',

  // Registration
  'BAD_REQUEST:email already registered':                'Email ini sudah terdaftar.',
  'BAD_REQUEST:whatsapp already registered':             'Nomor WhatsApp ini sudah terdaftar.',
  'BAD_REQUEST:email or whatsapp is required':           'Email atau nomor WhatsApp harus diisi.',
  'BAD_REQUEST:invalid email format':                    'Format email tidak valid.',
  'BAD_REQUEST:invalid whatsapp format':                 'Format nomor WhatsApp tidak valid.',
  'BAD_REQUEST:password is required':                    'Password harus diisi.',
  'BAD_REQUEST:name is required':                        'Nama harus diisi.',

  // Password
  'BAD_REQUEST:old password is incorrect':               'Password lama tidak sesuai.',
  'BAD_REQUEST:password must be at least 8 characters':  'Password minimal 8 karakter.',

  // Token / Session
  'UNAUTHORIZED:invalid access token':                   'Sesi tidak valid. Silakan masuk kembali.',
  'UNAUTHORIZED:invalid refresh token':                  'Sesi telah berakhir. Silakan masuk kembali.',
  'UNAUTHORIZED:missing refresh token':                  'Tidak ada sesi aktif. Silakan masuk.',
  'UNAUTHORIZED:token has been revoked':                 'Sesi telah dicabut. Silakan masuk kembali.',

  // Session management
  'NOT_FOUND:session not found':                         'Sesi tidak ditemukan.',
  'BAD_REQUEST:cannot revoke current session':           'Tidak dapat mencabut sesi yang sedang aktif.',

  // Generic validation
  'BAD_REQUEST:invalid request body':                    'Format permintaan tidak valid. Periksa kembali isian kamu.',
}

function friendlyMessage(body: ApiErrorBody): string {
  const { code, message } = body.error
  const key = `${code}:${message.toLowerCase()}`

  if (MESSAGE_MAP[key]) return MESSAGE_MAP[key]

  const partialKey = Object.keys(MESSAGE_MAP).find(k => {
    const [mapCode, mapMsg] = k.split(':')
    return mapCode === code && message.toLowerCase().includes(mapMsg)
  })
  if (partialKey) return MESSAGE_MAP[partialKey]

  switch (code) {
    case 'UNAUTHORIZED':      return 'Autentikasi gagal. Silakan masuk kembali.'
    case 'FORBIDDEN':         return 'Kamu tidak memiliki izin untuk melakukan tindakan ini.'
    case 'NOT_FOUND':         return 'Data yang diminta tidak ditemukan.'
    case 'TOO_MANY_REQUESTS': return 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.'
    case 'BAD_REQUEST':       return 'Permintaan tidak dapat diproses. Periksa kembali isian kamu.'
    default:                  return 'Terjadi kesalahan. Silakan coba lagi.'
  }
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof HTTPError) {
    const body = err.data as ApiErrorBody | { message?: string } | undefined

    if (body && 'error' in body && (body as ApiErrorBody).error?.code) {
      return friendlyMessage(body as ApiErrorBody)
    }
    return (body as { message?: string } | undefined)?.message
      ?? err.response.statusText
      ?? 'Terjadi kesalahan. Silakan coba lagi.'
  }
  if (err instanceof Error) return err.message
  return 'Terjadi kesalahan. Silakan coba lagi.'
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

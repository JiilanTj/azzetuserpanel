import { HTTPError } from '@/lib/api/client'

// -------------------------------------------------------
// Shared API Error Handling
//
// Centralized error parsing and friendly message mapping
// for all domains. Each domain can register its own
// message mappings via the MESSAGE_MAP.
// -------------------------------------------------------

export interface ApiErrorBody {
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
// Format: "CODE:message in lowercase" → friendly string
// -------------------------------------------------------

const MESSAGE_MAP: Record<string, string> = {
  // =====================================================
  // Auth Domain
  // =====================================================

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

  // =====================================================
  // Workspace Domain
  // =====================================================

  // Entity
  'BAD_REQUEST:invalid entity_id':                       'ID entitas tidak valid.',
  'BAD_REQUEST:entity not found':                        'Entitas tidak ditemukan.',
  'BAD_REQUEST:personal entity not found':               'Entitas personal tidak ditemukan. Hubungi dukungan.',

  // Workspace
  'BAD_REQUEST:workspace already exists for this entity':'Workspace untuk entitas ini sudah ada.',
  'FORBIDDEN:you don\'t have access to this workspace':  'Kamu tidak memiliki akses ke workspace ini.',

  // Members
  'BAD_REQUEST:relation already exists':                 'Anggota ini sudah terdaftar di workspace.',
  'BAD_REQUEST:member not found':                        'Anggota tidak ditemukan.',
  'BAD_REQUEST:cannot remove workspace owner':           'Tidak dapat menghapus pemilik workspace.',
  'FORBIDDEN:insufficient permissions':                  'Kamu tidak memiliki izin untuk melakukan tindakan ini.',

  // Roles
  'BAD_REQUEST:at least one permission is required':     'Minimal satu permission harus dipilih.',
  'BAD_REQUEST:cannot modify system roles':              'Role bawaan sistem tidak dapat diubah.',
  'BAD_REQUEST:cannot delete system roles':              'Role bawaan sistem tidak dapat dihapus.',
  'BAD_REQUEST:cannot assign wildcard permission to custom roles': 'Permission wildcard (*) hanya untuk pemilik workspace.',
  'BAD_REQUEST:role not found':                          'Role tidak ditemukan.',
  'BAD_REQUEST:role does not belong to this workspace':  'Role tidak termasuk dalam workspace ini.',
  'BAD_REQUEST:member not found in workspace':           'Anggota tidak ditemukan di workspace ini.',

  // Invites
  'BAD_REQUEST:email is required':                       'Email harus diisi.',
  'BAD_REQUEST:user tersebut sudah menjadi anggota workspace ini': 'User tersebut sudah menjadi anggota workspace ini.',
  'BAD_REQUEST:undangan untuk email ini sudah dikirim dan masih berlaku': 'Undangan untuk email ini sudah dikirim dan masih berlaku.',
  'NOT_FOUND:undangan tidak ditemukan atau sudah tidak berlaku.': 'Undangan tidak ditemukan atau sudah tidak berlaku.',
  'BAD_REQUEST:undangan sudah kedaluwarsa':              'Undangan sudah kedaluwarsa. Minta pengirim untuk mengirim ulang.',
  'BAD_REQUEST:undangan sudah diterima sebelumnya.':     'Undangan sudah diterima sebelumnya.',
  'FORBIDDEN:email akun anda tidak sesuai dengan email yang diundang.': 'Email akun kamu tidak sesuai dengan email yang diundang.',

  // =====================================================
  // Subscription Domain
  // =====================================================

  // Plans
  'BAD_REQUEST:plan_id is required':                     'Pilih plan terlebih dahulu.',
  'BAD_REQUEST:plan not found':                          'Plan tidak ditemukan.',
  'BAD_REQUEST:plan is not available':                   'Plan ini tidak tersedia saat ini.',

  // Subscription
  'BAD_REQUEST:workspace already has an active subscription': 'Workspace sudah memiliki langganan aktif.',
  'NOT_FOUND:no active subscription':                    'Tidak ada langganan aktif untuk workspace ini.',
  'BAD_REQUEST:billing service not configured':          'Layanan pembayaran belum dikonfigurasi. Hubungi dukungan.',

  // Billing
  'BAD_REQUEST:invoice not found':                       'Invoice tidak ditemukan.',
  'BAD_REQUEST:invoice already paid':                    'Invoice ini sudah dibayar.',

  // =====================================================
  // Generic
  // =====================================================
  'BAD_REQUEST:invalid request body':                    'Format permintaan tidak valid. Periksa kembali isian kamu.',
}

/**
 * Maps a backend API error to a user-friendly Indonesian message.
 * Supports exact match, partial match, and fallback by error code.
 */
export function friendlyMessage(body: ApiErrorBody): string {
  const { code, message } = body.error
  const key = `${code}:${message.toLowerCase()}`

  // Exact match
  if (MESSAGE_MAP[key]) return MESSAGE_MAP[key]

  // Partial match (message contains the mapped key's message)
  const partialKey = Object.keys(MESSAGE_MAP).find(k => {
    const colonIdx = k.indexOf(':')
    const mapCode = k.slice(0, colonIdx)
    const mapMsg = k.slice(colonIdx + 1)
    return mapCode === code && message.toLowerCase().includes(mapMsg)
  })
  if (partialKey) return MESSAGE_MAP[partialKey]

  // Fallback by code
  switch (code) {
    case 'UNAUTHORIZED':      return 'Autentikasi gagal. Silakan masuk kembali.'
    case 'FORBIDDEN':         return 'Kamu tidak memiliki izin untuk melakukan tindakan ini.'
    case 'NOT_FOUND':         return 'Data yang diminta tidak ditemukan.'
    case 'TOO_MANY_REQUESTS': return 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.'
    case 'BAD_REQUEST':       return 'Permintaan tidak dapat diproses. Periksa kembali isian kamu.'
    case 'INTERNAL_ERROR':    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    default:                  return 'Terjadi kesalahan. Silakan coba lagi.'
  }
}

/**
 * Extracts a user-friendly error message from any error thrown by ky/HTTPError.
 * Use this in all mutation onError callbacks.
 */
export function extractErrorMessage(err: unknown): string {
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

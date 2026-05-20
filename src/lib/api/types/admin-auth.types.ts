import type { APIResponse } from './shared.types'

// -------------------------------------------------------
// Admin Auth — domain-specific types
// POST /admin/auth/* endpoints
// -------------------------------------------------------

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT' | 'REVIEWER' | 'ENGINEER'
export type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'

export interface AdminResponse {
  id: string
  email: string
  name: string
  role: AdminRole
  status: AdminStatus
  mfa_enabled: boolean
  last_login: string
  created_at: string
}

/** POST /admin/auth/login */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Step-1 login response.
 * - requires_mfa=true  → use mfa_token to call /admin/auth/mfa/verify
 * - requires_mfa=false → MFA not set up yet; access_token is a temp token
 *                        for calling /admin/auth/mfa/setup + /confirm
 */
export interface LoginResponse {
  admin: AdminResponse
  expires_in: number
  requires_mfa: boolean
  /** Returned when requires_mfa=true — pass to /mfa/verify */
  mfa_token?: string
  /** Returned when requires_mfa=false (first login, needs MFA setup) */
  access_token?: string
}

/** Full auth tokens — returned after MFA verify/confirm or refresh */
export interface AuthResponse {
  access_token: string
  admin: AdminResponse
  expires_in: number
}

/** POST /admin/auth/mfa/verify */
export interface MFAVerifyRequest {
  mfa_token: string
  code: string
}

/** POST /admin/auth/mfa/setup response */
export interface MFASetupResponse {
  qr_code: string
  secret: string
}

/** POST /admin/auth/mfa/confirm */
export interface MFASetupConfirmRequest {
  code: string
}

export interface MessageResponse {
  message: string
}

// Re-export for convenience within this domain
export type { APIResponse }

import type { APIResponse } from './shared.types'

// -------------------------------------------------------
// User Auth — domain-specific types
// POST/GET /auth/* endpoints
// -------------------------------------------------------

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'UNVERIFIED' | 'DELETED'
export type OTPPurpose = 'login' | 'verify_whatsapp' | 'verify_email' | 'reset_password'

// -------------------------------------------------------
// UserResponse — profile returned in every auth response
// -------------------------------------------------------

export interface UserResponse {
  id: string
  name: string
  email: string | null
  email_verified: boolean
  whatsapp: string | null
  whatsapp_verified: boolean
  status: UserStatus
  created_at: string
}

// -------------------------------------------------------
// POST /auth/register
// -------------------------------------------------------

export interface RegisterRequest {
  name: string
  /** Optional — either email or whatsapp is required */
  email?: string
  /** Optional — either email or whatsapp is required */
  whatsapp?: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: UserResponse
}

// -------------------------------------------------------
// POST /auth/verify  (OTP verification to activate account)
// -------------------------------------------------------

export interface VerifyOTPRequest {
  identifier: string   // email or whatsapp number
  otp: string          // 6-digit code
  purpose: Extract<OTPPurpose, 'verify_whatsapp' | 'verify_email'>
}

// -------------------------------------------------------
// POST /auth/otp/request  (request OTP via WhatsApp)
// -------------------------------------------------------

export interface RequestOTPRequest {
  whatsapp: string
  purpose: OTPPurpose
}

// -------------------------------------------------------
// POST /auth/login/email
// -------------------------------------------------------

export interface LoginEmailRequest {
  email: string
  password: string
}

// -------------------------------------------------------
// POST /auth/login/otp  (WhatsApp OTP login)
// -------------------------------------------------------

export interface LoginOTPRequest {
  whatsapp: string
  otp: string
}

// -------------------------------------------------------
// Auth success response — returned after login / refresh
// Refresh token is set as HttpOnly cookie by the server.
// -------------------------------------------------------

export interface AuthResponse {
  access_token: string
  expires_in: number
  user: UserResponse
}

// -------------------------------------------------------
// POST /auth/refresh  (exchange refresh cookie → new token)
// Same shape as AuthResponse
// -------------------------------------------------------

// -------------------------------------------------------
// POST /auth/logout / POST /auth/logout-all
// GET  /auth/me
// POST /auth/password/change
// POST /auth/password/reset
// → returns MessageResponse or UserResponse
// -------------------------------------------------------

export interface MessageResponse {
  message: string
}

// -------------------------------------------------------
// POST /auth/password/change  (requires authentication)
// -------------------------------------------------------

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// -------------------------------------------------------
// POST /auth/password/reset  (OTP-based, no auth required)
// -------------------------------------------------------

export interface ResetPasswordRequest {
  identifier: string   // email or whatsapp
  otp: string
  new_password: string
}

// -------------------------------------------------------
// GET /auth/sessions
// -------------------------------------------------------

export interface SessionResponse {
  id: string
  device_name: string
  ip_address: string
  created_at: string
  last_used_at: string
}

// Re-export for convenience within this domain
export type { APIResponse }

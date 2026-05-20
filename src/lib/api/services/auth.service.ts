import { publicClient, apiClient } from '../client'
import type {
  APIResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  RequestOTPRequest,
  LoginEmailRequest,
  LoginOTPRequest,
  AuthResponse,
  MessageResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  UserResponse,
  SessionResponse,
} from '../types'

// -------------------------------------------------------
// User Auth API — all endpoints under /auth/*
// -------------------------------------------------------

export const authService = {
  // -------------------------------------------------------
  // Registration & Verification
  // -------------------------------------------------------

  /**
   * POST /auth/register
   * Create a new user account. Either email or whatsapp is required.
   * Returns user + message. Account needs to be verified before login.
   */
  register: (body: RegisterRequest) =>
    publicClient
      .post('auth/register', { json: body })
      .json<APIResponse<RegisterResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/verify
   * Verify OTP code to activate account (email or WhatsApp verification).
   */
  verifyOTP: (body: VerifyOTPRequest) =>
    publicClient
      .post('auth/verify', { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/otp/request
   * Request OTP code sent via WhatsApp.
   * Purpose: 'login' | 'verify_whatsapp' | 'reset_password'
   */
  requestOTP: (body: RequestOTPRequest) =>
    publicClient
      .post('auth/otp/request', { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Login
  // -------------------------------------------------------

  /**
   * POST /auth/login/email
   * Authenticate with email + password.
   * Returns access_token in body, refresh token in HttpOnly cookie.
   */
  loginEmail: (body: LoginEmailRequest) =>
    publicClient
      .post('auth/login/email', { json: body })
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/login/otp
   * Authenticate with WhatsApp number + OTP code.
   * Returns access_token in body, refresh token in HttpOnly cookie.
   */
  loginOTP: (body: LoginOTPRequest) =>
    publicClient
      .post('auth/login/otp', { json: body })
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Session Management
  // -------------------------------------------------------

  /**
   * POST /auth/refresh
   * Exchange HttpOnly refresh cookie for a new access token.
   * Called automatically by the ky client on 401.
   */
  refresh: () =>
    publicClient
      .post('auth/refresh')
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/logout
   * Blacklist the current access token and clear the refresh cookie.
   */
  logout: () =>
    apiClient
      .post('auth/logout')
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/logout-all
   * Revoke all active sessions for this user.
   */
  logoutAll: () =>
    apiClient
      .post('auth/logout-all')
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * GET /auth/me
   * Return the authenticated user's profile.
   */
  me: () =>
    apiClient
      .get('auth/me')
      .json<APIResponse<UserResponse>>()
      .then(r => r.data),

  /**
   * GET /auth/sessions
   * List all active sessions for the authenticated user.
   */
  listSessions: () =>
    apiClient
      .get('auth/sessions')
      .json<APIResponse<SessionResponse[]>>()
      .then(r => r.data),

  /**
   * DELETE /auth/sessions/:id
   * Revoke a specific session by its ID.
   */
  revokeSession: (id: string) =>
    apiClient
      .delete(`auth/sessions/${id}`)
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Password Management
  // -------------------------------------------------------

  /**
   * POST /auth/password/change
   * Change password while authenticated. Requires old password.
   */
  changePassword: (body: ChangePasswordRequest) =>
    apiClient
      .post('auth/password/change', { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * POST /auth/password/reset
   * Reset password using OTP (no auth required).
   * Flow: requestOTP(reset_password) → verifyOTP → resetPassword
   */
  resetPassword: (body: ResetPasswordRequest) =>
    publicClient
      .post('auth/password/reset', { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),
}

import { publicClient, apiClient } from '../client'
import type {
  APIResponse,
  LoginRequest,
  LoginResponse,
  AuthResponse,
  MFAVerifyRequest,
  MFASetupResponse,
  MFASetupConfirmRequest,
  AdminResponse,
  MessageResponse,
} from '../types'

// -------------------------------------------------------
// Admin Auth API — all endpoints under /admin/auth/*
// -------------------------------------------------------

export const adminAuthService = {
  /**
   * Step 1 — Authenticate with email + password.
   *
   * Response scenarios:
   *  - requires_mfa=true  → proceed to mfaVerify()
   *  - requires_mfa=false → first login; use access_token to call mfaSetup()
   */
  login: (body: LoginRequest) =>
    publicClient
      .post('admin/auth/login', { json: body })
      .json<APIResponse<LoginResponse>>()
      .then(r => r.data),

  /**
   * Step 2a — Verify TOTP code (for existing MFA-enabled accounts).
   * Returns full AuthResponse + sets refresh cookie.
   */
  mfaVerify: (body: MFAVerifyRequest) =>
    publicClient
      .post('admin/auth/mfa/verify', { json: body })
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  /**
   * Step 2b (first login) — Initiate MFA setup.
   * Requires the temp access_token from login step.
   * Returns QR code URL + secret.
   */
  mfaSetup: () =>
    apiClient
      .post('admin/auth/mfa/setup')
      .json<APIResponse<MFASetupResponse>>()
      .then(r => r.data),

  /**
   * Step 2b (first login) — Confirm MFA setup with the first TOTP code.
   * Returns full AuthResponse + sets refresh cookie.
   */
  mfaConfirm: (body: MFASetupConfirmRequest) =>
    apiClient
      .post('admin/auth/mfa/confirm', { json: body })
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  /**
   * Refresh access token using the HttpOnly refresh cookie.
   * Called automatically by the ky client on 401.
   */
  refresh: () =>
    publicClient
      .post('admin/auth/refresh')
      .json<APIResponse<AuthResponse>>()
      .then(r => r.data),

  /**
   * Blacklist the current access token and clear the refresh cookie.
   */
  logout: () =>
    apiClient
      .post('admin/auth/logout')
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * Get the authenticated admin's profile.
   */
  me: () =>
    apiClient
      .get('admin/auth/me')
      .json<APIResponse<AdminResponse>>()
      .then(r => r.data),
}

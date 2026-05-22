import { publicClient, apiClient } from '../client'
import type {
  APIResponse,
  PlanResponse,
  SubscribeRequest,
  SubscriptionResponse,
  InvoiceResponse,
  CreatePaymentRequest,
  PaymentResponse,
  MessageResponse,
  UsageResponse,
} from '../types'

// Helper to construct headers with optional X-Workspace-ID
const wsHeaders = (workspaceId?: string) => {
  return workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined
}

export const subscriptionService = {
  // -------------------------------------------------------
  // Plans (Public)
  // -------------------------------------------------------

  /**
   * GET /plans
   * List all available plans. Public endpoint.
   */
  listPlans: () =>
    publicClient
      .get('plans')
      .json<APIResponse<PlanResponse[]>>()
      .then(r => r.data),

  /**
   * GET /plans/{slug}
   * Get a single plan with features. Public endpoint.
   */
  getPlanBySlug: (slug: string) =>
    publicClient
      .get(`plans/${slug}`)
      .json<APIResponse<PlanResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Subscriptions (Workspace Scoped)
  // -------------------------------------------------------

  /**
   * GET /subscription
   * Get active subscription details for the workspace.
   */
  getSubscription: (workspaceId: string) =>
    apiClient
      .get('subscription', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<SubscriptionResponse>>()
      .then(r => r.data),

  /**
   * POST /subscription
   * Subscribe the workspace to a plan.
   */
  subscribe: (workspaceId: string, body: SubscribeRequest) =>
    apiClient
      .post('subscription', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<SubscriptionResponse>>()
      .then(r => r.data),

  /**
   * POST /subscription/cancel
   * Cancel the active subscription for the workspace.
   */
  cancelSubscription: (workspaceId: string) =>
    apiClient
      .post('subscription/cancel', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * POST /subscription/change
   * Cancel current subscription and subscribe to a new plan.
   */
  changeSubscription: (workspaceId: string, body: SubscribeRequest) =>
    apiClient
      .post('subscription/change', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<SubscriptionResponse>>()
      .then(r => r.data),

  /**
   * GET /subscription/history
   * Returns all subscriptions (active, expired, cancelled) for the workspace.
   */
  getSubscriptionHistory: (workspaceId: string) =>
    apiClient
      .get('subscription/history', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<SubscriptionResponse[]>>()
      .then(r => r.data),

  /**
   * GET /subscription/usage
   * Returns quota usage for all tracked features in the current billing period.
   */
  getSubscriptionUsage: (workspaceId: string) =>
    apiClient
      .get('subscription/usage', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<UsageResponse[]>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Billing & Invoices (Workspace Scoped)
  // -------------------------------------------------------

  /**
   * GET /billing/invoices
   * Get all invoices for the workspace.
   */
  listInvoices: (workspaceId: string) =>
    apiClient
      .get('billing/invoices', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<InvoiceResponse[]>>()
      .then(r => r.data),

  /**
   * GET /billing/invoices/{id}
   * Get invoice detail by ID.
   */
  getInvoice: (workspaceId: string, id: string) =>
    apiClient
      .get(`billing/invoices/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<InvoiceResponse>>()
      .then(r => r.data),

  /**
   * POST /billing/pay
   * Create a payment attempt/checkout session for an invoice.
   */
  payInvoice: (workspaceId: string, body: CreatePaymentRequest) =>
    apiClient
      .post('billing/pay', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<PaymentResponse>>()
      .then(r => r.data),

  /**
   * GET /billing/payments
   * List all payment attempts for the current workspace.
   */
  listPayments: (workspaceId: string, params?: { limit?: number; offset?: number }) =>
    apiClient
      .get('billing/payments', { searchParams: params, headers: wsHeaders(workspaceId) })
      .json<APIResponse<PaymentResponse[]>>()
      .then(r => r.data),
}

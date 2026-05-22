import { publicClient, apiClient } from '../client'
import type {
  APIResponse,
  PlanResponse,
  SubscribeRequest,
  SubscriptionResponse,
  InvoiceResponse,
  CreatePaymentRequest,
  PaymentResponse,
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
   * POST /billing/pay
   * Create a payment attempt/checkout session for an invoice.
   */
  payInvoice: (workspaceId: string, body: CreatePaymentRequest) =>
    apiClient
      .post('billing/pay', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<PaymentResponse>>()
      .then(r => r.data),
}

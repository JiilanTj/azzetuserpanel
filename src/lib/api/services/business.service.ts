import { publicClient, apiClient } from '../client'
import type {
  APIResponse,
  EntityResponse,
  CreateEntityRequest,
  WorkspaceResponse,
  CreateWorkspaceRequest,
  PlanResponse,
  SubscribeRequest,
  SubscriptionResponse,
  InvoiceResponse,
  CreatePaymentRequest,
  PaymentResponse,
  MemberResponse,
  UpdateMemberRequest,
} from '../types'

// Helper to construct headers with optional X-Workspace-ID
const wsHeaders = (workspaceId?: string) => {
  return workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined
}

export const businessService = {
  // -------------------------------------------------------
  // Entities
  // -------------------------------------------------------

  /**
   * POST /entities
   * Create a new personal or business entity.
   */
  createEntity: (body: CreateEntityRequest) =>
    apiClient
      .post('entities', { json: body })
      .json<APIResponse<EntityResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Workspaces
  // -------------------------------------------------------

  /**
   * GET /workspaces
   * List all workspaces the user has access to.
   */
  listWorkspaces: () =>
    apiClient
      .get('workspaces')
      .json<APIResponse<WorkspaceResponse[]>>()
      .then(r => r.data),

  /**
   * POST /workspaces
   * Create a new workspace linked to an entity.
   */
  createWorkspace: (body: CreateWorkspaceRequest) =>
    apiClient
      .post('workspaces', { json: body })
      .json<APIResponse<WorkspaceResponse>>()
      .then(r => r.data),

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

  // -------------------------------------------------------
  // Workspace Members
  // -------------------------------------------------------

  /**
   * GET /workspaces/members
   * List all members of the workspace.
   */
  listMembers: (workspaceId: string) =>
    apiClient
      .get('workspaces/members', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MemberResponse[]>>()
      .then(r => r.data),

  /**
   * PATCH /workspaces/members/:id
   * Update a member's alias or status.
   */
  updateMember: (workspaceId: string, memberId: string, body: UpdateMemberRequest) =>
    apiClient
      .patch(`workspaces/members/${memberId}`, { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<MemberResponse>>()
      .then(r => r.data),

  /**
   * DELETE /workspaces/members/:id
   * Remove a member from the workspace.
   */
  removeMember: (workspaceId: string, memberId: string) =>
    apiClient
      .delete(`workspaces/members/${memberId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<{ message: string }>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Invites
  // -------------------------------------------------------

  /**
   * POST /workspaces/invites/accept
   * Accept a workspace invite using a token.
   */
  acceptInvite: (token: string) =>
    apiClient
      .post('workspaces/invites/accept', { json: { token } })
      .json<APIResponse<{ message: string }>>()
      .then(r => r.data),
}

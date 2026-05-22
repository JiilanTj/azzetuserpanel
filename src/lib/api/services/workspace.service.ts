import { apiClient } from '../client'
import type {
  APIResponse,
  EntityResponse,
  CreateEntityRequest,
  WorkspaceResponse,
  CreateWorkspaceRequest,
  MemberResponse,
  UpdateMemberRequest,
  UpdateEntityRequest,
  UpdateEntityMetaRequest,
  MessageResponse,
  InviteResponse,
  CreateInviteRequest,
  RoleResponse,
  CreateRoleRequest,
  AssignRoleRequest,
  RoleAssignmentResponse,
  UpdateRoleRequest,
  AddCounterpartyRequest,
  CounterpartyResponse,
} from '../types'

// Helper to construct headers with optional X-Workspace-ID
const wsHeaders = (workspaceId?: string) => {
  return workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined
}

export const workspaceService = {
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

  /**
   * GET /entities
   * List all entities belonging to the user.
   */
  listEntities: () =>
    apiClient
      .get('entities')
      .json<APIResponse<EntityResponse[]>>()
      .then(r => r.data),

  /**
   * GET /entities/search
   * Search active entities by name query.
   */
  searchEntities: (q: string, params?: { limit?: number; offset?: number }) =>
    apiClient
      .get('entities/search', { searchParams: { q, ...params } })
      .json<APIResponse<EntityResponse[]>>()
      .then(r => r.data),

  /**
   * GET /entities/{id}
   * Get detail of a single entity.
   */
  getEntity: (id: string) =>
    apiClient
      .get(`entities/${id}`)
      .json<APIResponse<EntityResponse>>()
      .then(r => r.data),

  /**
   * PATCH /entities/{id}
   * Update basic entity info.
   */
  updateEntity: (id: string, body: UpdateEntityRequest) =>
    apiClient
      .patch(`entities/${id}`, { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * PATCH /entities/{id}/meta
   * Update entity metadata (compliance/NPWP/address/etc).
   */
  updateEntityMeta: (id: string, body: UpdateEntityMetaRequest) =>
    apiClient
      .patch(`entities/${id}/meta`, { json: body })
      .json<APIResponse<MessageResponse>>()
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
  // Members
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

  /**
   * GET /workspaces/invites
   * List all pending invites of the workspace.
   */
  listInvites: (workspaceId: string) =>
    apiClient
      .get('workspaces/invites', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<InviteResponse[]>>()
      .then(r => r.data),

  /**
   * POST /workspaces/invites
   * Invite a user to the workspace via email.
   */
  createInvite: (workspaceId: string, body: CreateInviteRequest) =>
    apiClient
      .post('workspaces/invites', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<InviteResponse>>()
      .then(r => r.data),

  /**
   * DELETE /workspaces/invites/:id
   * Revoke/cancel a pending invite.
   */
  revokeInvite: (workspaceId: string, inviteId: string) =>
    apiClient
      .delete(`workspaces/invites/${inviteId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * GET /workspaces/roles
   * List all roles in the workspace.
   */
  listRoles: (workspaceId: string) =>
    apiClient
      .get('workspaces/roles', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<RoleResponse[]>>()
      .then(r => r.data),

  /**
   * POST /workspaces/roles
   * Create a custom workspace role.
   */
  createRole: (workspaceId: string, body: CreateRoleRequest) =>
    apiClient
      .post('workspaces/roles', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<RoleResponse>>()
      .then(r => r.data),

  /**
   * POST /workspaces/roles/assign
   * Assign a role to a member.
   */
  assignRole: (workspaceId: string, body: AssignRoleRequest) =>
    apiClient
      .post('workspaces/roles/assign', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<RoleAssignmentResponse>>()
      .then(r => r.data),

  /**
   * POST /workspaces/roles/unassign
   * Remove a role from a member.
   */
  unassignRole: (workspaceId: string, body: AssignRoleRequest) =>
    apiClient
      .post('workspaces/roles/unassign', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * DELETE /workspaces/roles/:id
   * Delete a custom workspace role.
   */
  deleteRole: (workspaceId: string, roleId: string) =>
    apiClient
      .delete(`workspaces/roles/${roleId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * PATCH /workspaces/roles/:id
   * Update a custom workspace role.
   */
  updateRole: (workspaceId: string, roleId: string, body: UpdateRoleRequest) =>
    apiClient
      .patch(`workspaces/roles/${roleId}`, { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  /**
   * GET /workspaces/counterparties
   * List all counterparties for the active workspace.
   */
  listCounterparties: (workspaceId: string) =>
    apiClient
      .get('workspaces/counterparties', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<CounterpartyResponse[]>>()
      .then(r => r.data),

  /**
   * POST /workspaces/counterparties
   * Add a counterparty to the active workspace.
   */
  addCounterparty: (workspaceId: string, body: AddCounterpartyRequest) =>
    apiClient
      .post('workspaces/counterparties', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<CounterpartyResponse>>()
      .then(r => r.data),
}


import { apiClient } from '../client'
import type {
  APIResponse,
  EntityResponse,
  CreateEntityRequest,
  WorkspaceResponse,
  CreateWorkspaceRequest,
  MemberResponse,
  UpdateMemberRequest,
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
}

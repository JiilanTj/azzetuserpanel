import { apiClient } from '../client'
import type { APIResponse } from '../types'
import type {
  VerificationResponse,
  LegalIDResponse,
  AliasResponse,
  FuzzyMatchResponse,
  AddLegalIDRequest,
  AddAliasRequest,
  UpdateLegalIDRequest,
  CounterpartyAliasResponse,
  SetCounterpartyAliasRequest,
} from '../types/identity.types'

const wsHeaders = (workspaceId?: string) =>
  workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined

export const identityService = {
  getVerification: (entityId: string) =>
    apiClient
      .get(`entities/${entityId}/verification`)
      .json<APIResponse<VerificationResponse>>()
      .then(r => r.data),

  listLegalIDs: (entityId: string) =>
    apiClient
      .get(`entities/${entityId}/legal-ids`)
      .json<APIResponse<LegalIDResponse[]>>()
      .then(r => r.data),

  addLegalID: (entityId: string, body: AddLegalIDRequest) =>
    apiClient
      .post(`entities/${entityId}/legal-ids`, { json: body })
      .json<APIResponse<LegalIDResponse>>()
      .then(r => r.data),

  updateLegalID: (entityId: string, idType: string, body: UpdateLegalIDRequest) =>
    apiClient
      .patch(`entities/${entityId}/legal-ids/${idType}`, { json: body })
      .json<APIResponse<LegalIDResponse>>()
      .then(r => r.data),

  deleteLegalID: (entityId: string, idType: string) =>
    apiClient
      .delete(`entities/${entityId}/legal-ids/${idType}`)
      .json<APIResponse<{ status: string }>>()
      .then(r => r.data),

  listAliases: (entityId: string) =>
    apiClient
      .get(`entities/${entityId}/aliases`)
      .json<APIResponse<AliasResponse[]>>()
      .then(r => r.data),

  addAlias: (entityId: string, body: AddAliasRequest) =>
    apiClient
      .post(`entities/${entityId}/aliases`, { json: body })
      .json<APIResponse<AliasResponse>>()
      .then(r => r.data),

  deleteAlias: (entityId: string, aliasId: string) =>
    apiClient
      .delete(`entities/${entityId}/aliases/${aliasId}`)
      .json<APIResponse<{ status: string }>>()
      .then(r => r.data),

  findDuplicates: (entityId: string, limit = 10) =>
    apiClient
      .get(`entities/${entityId}/duplicates`, { searchParams: { limit } })
      .json<APIResponse<FuzzyMatchResponse[]>>()
      .then(r => r.data),

  searchFuzzy: (workspaceId: string, q: string, limit = 20) =>
    apiClient
      .get('entities/match', { searchParams: { workspace_id: workspaceId, q, limit } })
      .json<APIResponse<FuzzyMatchResponse[]>>()
      .then(r => r.data),

  listCounterpartyAliases: (workspaceId: string) =>
    apiClient
      .get('workspaces/counterparties/aliases', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<CounterpartyAliasResponse[]>>()
      .then(r => r.data),

  setCounterpartyAlias: (workspaceId: string, body: SetCounterpartyAliasRequest) =>
    apiClient
      .post('workspaces/counterparties/aliases', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<CounterpartyAliasResponse>>()
      .then(r => r.data),

  deleteCounterpartyAlias: (workspaceId: string, entityId: string) =>
    apiClient
      .delete(`workspaces/counterparties/aliases/${entityId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<{ message: string }>>()
      .then(r => r.data),
}

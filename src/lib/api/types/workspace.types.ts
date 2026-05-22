// -------------------------------------------------------
// Workspace Domain Types — Entities, Workspaces, Members, Roles, Invites
// -------------------------------------------------------

export type EntityType = 'ORANG_PRIBADI' | 'BADAN_USAHA'
export type WorkspaceRole = string // Dynamic roles from ABAC system
export type MemberStatus = 'ACTIVE' | 'INACTIVE'

export interface EntityMetaResponse {
  bidang_usaha?: string
  logo_url?: string
  website?: string
  email?: string
  description?: string
}

export interface EntityResponse {
  id: string
  user_id?: string
  entity_type: EntityType
  nama_utama: string
  nik_npwp?: string
  nomor_wa?: string
  alamat_lengkap?: string
  status: string
  is_shadow: boolean
  meta?: EntityMetaResponse
  created_at: string
  updated_at: string
}

export interface CreateEntityRequest {
  entity_type: EntityType
  nama_utama: string
  nik_npwp?: string
  nomor_wa?: string
  alamat_lengkap?: string
}

export interface WorkspaceResponse {
  id: string
  entity_id: string
  entity_name: string
  entity_type: EntityType
  role: WorkspaceRole
  subscription_status?: import('./subscription.types').SubscriptionStatus
  plan_name?: string
  created_at: string
}

export interface CreateWorkspaceRequest {
  entity_id: string
}

// -------------------------------------------------------
// Members
// -------------------------------------------------------

export interface MemberResponse {
  id: string
  entity_id: string
  entity_name: string
  entity_type: EntityType
  role?: WorkspaceRole
  custom_alias?: string
  relation_type: string
  status: MemberStatus
  created_at: string
}

export interface UpdateMemberRequest {
  custom_alias?: string
  status?: MemberStatus
}

// -------------------------------------------------------
// Business/Multi-Tenant Types — Entities, Workspaces, Plans, Subscriptions
// -------------------------------------------------------

export type EntityType = 'ORANG_PRIBADI' | 'BADAN_USAHA'
export type WorkspaceRole = 'PEMILIK' | 'KASIR' | 'AKUNTAN' | 'VIEWER'
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled'
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

export interface EntityMetaResponse {
  id: string
  entity_id: string
  meta_key: string
  meta_value: string
}

export interface EntityResponse {
  id: string
  user_id: string
  entity_type: EntityType
  nama_utama: string
  nik_npwp: string | null
  nomor_wa: string | null
  alamat_lengkap: string | null
  status: string
  is_shadow: boolean
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
  created_at: string
}

export interface CreateWorkspaceRequest {
  entity_id: string
}

export interface FeatureResponse {
  feature_key: string
  feature_type: 'boolean' | 'quota'
  value_bool: boolean
  value_int: number
}

export interface PlanResponse {
  id: string
  name: string
  slug: string
  description: string | null
  type: 'free' | 'paid'
  price_monthly: number
  price_yearly: number
  is_trial: boolean
  trial_days: number
  tier: number
  is_active: boolean
  features: FeatureResponse[]
  created_at: string
  updated_at: string
}

export interface SubscribeRequest {
  plan_id: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface SubscriptionResponse {
  id: string
  workspace_id: string
  plan_id: string
  plan_name: string
  plan_slug: string
  billing_cycle: 'monthly' | 'yearly' | null
  status: SubscriptionStatus
  started_at: string
  expires_at: string
  trial_ends_at: string | null
  cancelled_at: string | null
  created_at: string
}

export interface UsageResponse {
  usage: Record<string, number>
}

export interface InvoiceResponse {
  id: string
  workspace_id: string
  subscription_id: string
  invoice_number: string
  description: string
  amount: number
  currency: string
  status: InvoiceStatus
  due_date: string
  paid_at: string | null
  created_at: string
}

export interface CreatePaymentRequest {
  invoice_id: string
}

export interface PaymentResponse {
  id: string
  invoice_id: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  payment_url: string
  paid_at: string | null
  expires_at: string
  created_at: string
}

// -------------------------------------------------------
// Workspace Members
// -------------------------------------------------------

export type MemberStatus = 'active' | 'invited' | 'suspended'

export interface MemberResponse {
  id: string
  entity_id: string
  entity_name: string
  entity_type: EntityType
  role: WorkspaceRole
  custom_alias: string | null
  relation_type: string
  status: MemberStatus
  created_at: string
}

export interface InviteMemberRequest {
  entity_id?: string
  custom_alias?: string
  role: WorkspaceRole
}

export interface UpdateMemberRequest {
  role?: WorkspaceRole
  custom_alias?: string
  status?: MemberStatus
}

// -------------------------------------------------------
// Business/Multi-Tenant Types — Entities, Workspaces, Plans, Subscriptions
// -------------------------------------------------------

export type EntityType = 'ORANG_PRIBADI' | 'BADAN_USAHA'
export type WorkspaceRole = string // Dynamic roles from ABAC system (e.g. "PEMILIK", "KARYAWAN", or custom role names)
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'pending_payment'
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
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
  subscription_status?: SubscriptionStatus
  plan_name?: string
  created_at: string
}

export interface CreateWorkspaceRequest {
  entity_id: string
}

export interface FeatureResponse {
  feature_key: string
  feature_type: 'boolean' | 'quota' | 'tier'
  value_bool?: boolean
  value_int?: number
  value_text?: string
}

export interface PlanResponse {
  id: string
  name: string
  slug: string
  description?: string
  type: 'free' | 'paid'
  price_monthly: number
  price_yearly: number
  is_trial: boolean
  trial_days: number
  tier: number
  is_active: boolean
  features?: FeatureResponse[]
  created_at: string
  updated_at?: string
}

export interface SubscribeRequest {
  plan_id: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface SubscriptionResponse {
  id: string
  workspace_id: string
  plan_id: string
  plan_name?: string
  plan_slug?: string
  billing_cycle?: 'monthly' | 'yearly'
  status: SubscriptionStatus
  started_at: string
  expires_at?: string
  trial_ends_at?: string
  cancelled_at?: string
  payment_url?: string
  created_at: string
}

export interface UsageResponse {
  feature_key: string
  usage_count: number
  limit: number
  period_start: string
  period_end: string
}

export interface InvoiceResponse {
  id: string
  workspace_id: string
  subscription_id: string
  invoice_number: string
  description?: string
  amount: number
  currency: string
  status: InvoiceStatus
  due_date: string
  paid_at?: string
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
  payment_method?: string
  payment_url?: string
  paid_at?: string
  expires_at?: string
  created_at: string
}

// -------------------------------------------------------
// Workspace Members
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

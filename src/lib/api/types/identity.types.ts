export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type LegalIDType = 'NPWP' | 'NIB' | 'SIUP' | 'KTP' | 'AKTA'
export type AliasSource = 'MANUAL' | 'CLAIM' | 'COUNTERPARTY' | 'SYSTEM'

export interface VerificationResponse {
  entity_id: string
  status: VerificationStatus
  verified_by?: string
  verified_at?: string
  rejection_reason?: string
  notes?: string
}

export interface LegalIDResponse {
  id: string
  entity_id: string
  id_type: LegalIDType
  id_value: string
  is_verified: boolean
  verified_at?: string
  created_at: string
}

export interface AliasResponse {
  id: string
  entity_id: string
  alias: string
  source: AliasSource
  created_at: string
}

export interface FuzzyMatchResponse {
  id: string
  nama_utama: string
  entity_type: 'ORANG_PRIBADI' | 'BADAN_USAHA'
  is_shadow: boolean
  match_score: number
}

export interface AddLegalIDRequest {
  id_type: LegalIDType
  id_value: string
}

export interface AddAliasRequest {
  alias: string
  source?: AliasSource
}

export interface UpdateLegalIDRequest {
  id_value: string
}

export interface CounterpartyAliasResponse {
  entity_id: string
  entity_name: string
  custom_alias: string
  relation_type: 'PELANGGAN' | 'VENDOR'
  created_at: string
}

export interface SetCounterpartyAliasRequest {
  entity_id: string
  custom_alias: string
}

export type TaxStatus = 'NON_PKP' | 'PKP' | 'NOT_REGISTERED'

export type TaxType =
  | 'PPN_MASUKAN'
  | 'PPN_KELUARAN'
  | 'PPH21'
  | 'PPH23'
  | 'PPH4_AYAT2'
  | 'PPH25'
  | 'PPH29'

export interface TaxProfileResponse {
  id: string
  workspace_id: string
  entity_id: string
  npwp?: string
  tax_status: TaxStatus
  is_ppn_liable: boolean
  default_ppn_rate: number
  pph23_enabled: boolean
  default_pph23_rate: number
  pkp_number?: string
  tax_office_code?: string
  efaktur_ready: boolean
  ebupot_ready: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface UpdateTaxProfileRequest {
  npwp?: string
  tax_status: TaxStatus
  is_ppn_liable?: boolean
  default_ppn_rate?: number
  pph23_enabled?: boolean
  default_pph23_rate?: number
  pkp_number?: string
  tax_office_code?: string
  efaktur_ready?: boolean
  ebupot_ready?: boolean
  notes?: string
}

export interface TaxCalculationResponse {
  id: string
  workspace_id: string
  transaction_id: string
  transaction_number?: string
  transaction_type?: string
  transaction_description?: string
  tax_type: TaxType
  direction: string
  base_amount: string
  tax_rate: number
  tax_amount: string
  period: string
  status: string
  counterparty_entity_id?: string
  faktur_number?: string
  created_at: string
}

export interface PPNSummaryResponse {
  period: string
  ppn_masukan: string
  ppn_keluaran: string
  net_ppn: string
  dpp_masukan: string
  dpp_keluaran: string
  transaction_count: number
}

export interface PPhSummaryRow {
  tax_type: string
  direction: string
  total_base: string
  total_tax: string
  count: number
}

export interface PPhSummaryResponse {
  period_from: string
  period_to: string
  rows: PPhSummaryRow[]
}

export interface RequestTaxReportRequest {
  report_type: 'PPN_SUMMARY' | 'PPH_SUMMARY' | 'TAX_OVERVIEW'
  period_from: string
  period_to: string
}

export interface TaxReportJobResponse {
  id: string
  report_type: string
  period_from: string
  period_to: string
  status: string
  result?: unknown
  error_message?: string
  created_at: string
  completed_at?: string
}

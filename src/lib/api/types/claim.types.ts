export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPUTED'

export type ClaimDocumentType =
  | 'NPWP'
  | 'NIB'
  | 'SIUP'
  | 'AKTA_PENDIRIAN'
  | 'AKTA_PERUBAHAN'
  | 'KTP_DIREKTUR'
  | 'SURAT_KUASA'
  | 'OTHER'

export type DocumentUploadStatus = 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'

export interface ClaimResponse {
  id: string
  entity_id: string
  entity_name: string
  entity_type: string
  status: ClaimStatus
  created_at: string
  updated_at: string
}

export interface ClaimListResponse extends ClaimResponse {
  claimant_name: string
  document_count: number
}

export interface ClaimDocumentResponse {
  id: string
  claim_id: string
  document_type: ClaimDocumentType
  file_name: string
  file_size: number
  mime_type: string
  upload_status: DocumentUploadStatus
  view_url?: string
  created_at: string
}

export interface ClaimAuditLogEntry {
  id: string
  claim_id: string
  actor_id: string
  actor_type: string
  action: string
  old_status?: string
  new_status?: string
  details?: Record<string, unknown>
  created_at: string
}

export interface ClaimDetailResponse extends ClaimResponse {
  claimant_user_id: string
  claimant_entity_id: string
  reviewer_id?: string
  reviewed_at?: string
  rejection_reason?: string
  dispute_reason?: string
  notes?: string
  documents: ClaimDocumentResponse[]
  audit_log: ClaimAuditLogEntry[]
}

export interface CreateClaimRequest {
  entity_id: string
  notes?: string
}

export interface DocumentUploadRequest {
  document_type: ClaimDocumentType
  file_name: string
  mime_type: string
  file_size: number
}

export interface PresignedUploadResponse {
  document_id: string
  upload_url: string
  file_key: string
  expires_in: number
}

export interface DisputeClaimRequest {
  reason: string
}

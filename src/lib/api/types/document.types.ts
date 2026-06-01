export type DocumentType = 'RECEIPT' | 'INVOICE' | 'FAKTUR' | 'OTHER'

export type OCRUploadStatus = 'PENDING' | 'UPLOADED' | 'FAILED'

export type DocumentExtractionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'

export type DocumentVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'

export interface DocumentResponse {
  id: string
  workspace_id: string
  document_type: DocumentType
  file_name: string
  file_size: number
  mime_type: string
  upload_status: OCRUploadStatus
  extraction_status: DocumentExtractionStatus
  verification_status: DocumentVerificationStatus
  extracted_data?: Record<string, unknown>
  extraction_confidence?: number
  extraction_error?: string
  transaction_id?: string
  view_url?: string
  uploaded_at?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface DocumentListResponse {
  documents: DocumentResponse[]
  total: number
}

export interface OCRUploadRequest {
  document_type: DocumentType
  file_name: string
  mime_type: string
  file_size: number
}

export interface OCRPresignedUploadResponse {
  document_id: string
  upload_url: string
  file_key: string
  expires_in: number
}

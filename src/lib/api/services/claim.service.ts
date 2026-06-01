import { apiClient } from '../client'
import type { APIResponse } from '../types'
import type {
  ClaimResponse,
  ClaimListResponse,
  ClaimDetailResponse,
  CreateClaimRequest,
  DocumentUploadRequest,
  PresignedUploadResponse,
  DisputeClaimRequest,
  ClaimDocumentResponse,
} from '../types/claim.types'

export const claimService = {
  listMyClaims: () =>
    apiClient
      .get('claims')
      .json<APIResponse<ClaimListResponse[]>>()
      .then(r => r.data),

  getClaim: (claimId: string) =>
    apiClient
      .get(`claims/${claimId}`)
      .json<APIResponse<ClaimDetailResponse>>()
      .then(r => r.data),

  createClaim: (body: CreateClaimRequest) =>
    apiClient
      .post('claims', { json: body })
      .json<APIResponse<ClaimResponse>>()
      .then(r => r.data),

  submitClaim: (claimId: string) =>
    apiClient
      .post(`claims/${claimId}/submit`)
      .json<APIResponse<ClaimResponse>>()
      .then(r => r.data),

  disputeClaim: (claimId: string, body: DisputeClaimRequest) =>
    apiClient
      .post(`claims/${claimId}/dispute`, { json: body })
      .json<APIResponse<ClaimResponse>>()
      .then(r => r.data),

  requestDocumentUpload: (claimId: string, body: DocumentUploadRequest) =>
    apiClient
      .post(`claims/${claimId}/documents`, { json: body })
      .json<APIResponse<PresignedUploadResponse>>()
      .then(r => r.data),

  confirmDocumentUpload: (claimId: string, documentId: string) =>
    apiClient
      .post(`claims/${claimId}/documents/${documentId}/confirm`)
      .json<APIResponse<{ status: string }>>()
      .then(r => r.data),

  listClaimDocuments: (claimId: string) =>
    apiClient
      .get(`claims/${claimId}/documents`)
      .json<APIResponse<ClaimDocumentResponse[]>>()
      .then(r => r.data),

  /** Upload file to R2 presigned URL (direct, no auth header needed). */
  uploadToPresignedUrl: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    })
    if (!res.ok) {
      throw new Error(`Upload gagal (${res.status})`)
    }
  },
}

import { apiClient } from '../client'
import type { APIResponse } from '../types'
import type {
  DocumentResponse,
  DocumentListResponse,
  OCRUploadRequest,
  OCRPresignedUploadResponse,
} from '../types/document.types'

export const documentService = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient
      .get('documents', { searchParams: params })
      .json<APIResponse<DocumentListResponse>>()
      .then(r => r.data),

  get: (documentId: string) =>
    apiClient
      .get(`documents/${documentId}`)
      .json<APIResponse<DocumentResponse>>()
      .then(r => r.data),

  requestUpload: (body: OCRUploadRequest) =>
    apiClient
      .post('documents', { json: body })
      .json<APIResponse<OCRPresignedUploadResponse>>()
      .then(r => r.data),

  confirmUpload: (documentId: string) =>
    apiClient
      .post(`documents/${documentId}/confirm`)
      .json<APIResponse<DocumentResponse>>()
      .then(r => r.data),

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

  /** Full upload flow: presign → PUT → confirm */
  uploadDocument: async (file: File, documentType: OCRUploadRequest['document_type']) => {
    const presigned = await documentService.requestUpload({
      document_type: documentType,
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
    })
    await documentService.uploadToPresignedUrl(presigned.upload_url, file)
    return documentService.confirmUpload(presigned.document_id)
  },
}

import { apiClient } from '../client'
import type { APIResponse } from '../types'
import type {
  DocumentResponse,
  DocumentListResponse,
  OCRUploadRequest,
  OCRPresignedUploadResponse,
} from '../types/document.types'

const wsHeaders = (workspaceId?: string) =>
  workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined

export const documentService = {
  list: (workspaceId: string, params?: { limit?: number; offset?: number }) =>
    apiClient
      .get('documents', {
        headers: wsHeaders(workspaceId),
        searchParams: params,
      })
      .json<APIResponse<DocumentListResponse>>()
      .then(r => r.data),

  get: (workspaceId: string, documentId: string) =>
    apiClient
      .get(`documents/${documentId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<DocumentResponse>>()
      .then(r => r.data),

  requestUpload: (workspaceId: string, body: OCRUploadRequest) =>
    apiClient
      .post('documents', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<OCRPresignedUploadResponse>>()
      .then(r => r.data),

  confirmUpload: (workspaceId: string, documentId: string) =>
    apiClient
      .post(`documents/${documentId}/confirm`, { headers: wsHeaders(workspaceId) })
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
  uploadDocument: async (workspaceId: string, file: File, documentType: OCRUploadRequest['document_type']) => {
    const presigned = await documentService.requestUpload(workspaceId, {
      document_type: documentType,
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
    })
    await documentService.uploadToPresignedUrl(presigned.upload_url, file)
    return documentService.confirmUpload(workspaceId, presigned.document_id)
  },
}

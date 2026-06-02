import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { documentService } from '@/lib/api/services/document.service'
import { extractErrorMessage } from '@/lib/api/errors'
import type { DocumentType } from '@/lib/api/types/document.types'

export const documentKeys = {
  all: ['documents'] as const,
  list: (wsId: string) => [...documentKeys.all, 'list', wsId] as const,
  detail: (wsId: string, id: string) => [...documentKeys.all, 'detail', wsId, id] as const,
}

export function useDocuments(workspaceId?: string) {
  return useQuery({
    queryKey: documentKeys.list(workspaceId ?? ''),
    queryFn: () => documentService.list(),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const docs = query.state.data?.documents
      if (docs?.some(d => d.extraction_status === 'PENDING' || d.extraction_status === 'PROCESSING')) {
        return 3000
      }
      return false
    },
  })
}

export function useDocument(workspaceId?: string, documentId?: string) {
  return useQuery({
    queryKey: documentKeys.detail(workspaceId ?? '', documentId ?? ''),
    queryFn: () => documentService.get(documentId!),
    enabled: !!workspaceId && !!documentId,
    refetchInterval: (query) => {
      const d = query.state.data
      if (d && (d.extraction_status === 'PENDING' || d.extraction_status === 'PROCESSING')) {
        return 3000
      }
      return false
    },
  })
}

export function useUploadDocument(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: DocumentType }) =>
      documentService.uploadDocument(file, documentType),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: documentKeys.list(workspaceId) })
      }
      toast.success('Dokumen berhasil diunggah', {
        description: 'OCR sedang memproses dokumen. Transaksi akan dibuat otomatis.',
      })
    },
    onError: (err) => {
      toast.error('Gagal mengunggah dokumen', { description: extractErrorMessage(err) })
    },
  })
}

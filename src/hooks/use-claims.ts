import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { claimService } from '@/lib/api/services/claim.service'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  CreateClaimRequest,
  DisputeClaimRequest,
  DocumentUploadRequest,
} from '@/lib/api/types/claim.types'

export const claimKeys = {
  all: ['claims'] as const,
  list: () => [...claimKeys.all, 'list'] as const,
  detail: (id: string) => [...claimKeys.all, 'detail', id] as const,
  documents: (id: string) => [...claimKeys.all, 'documents', id] as const,
}

export function useMyClaims() {
  return useQuery({
    queryKey: claimKeys.list(),
    queryFn: () => claimService.listMyClaims(),
  })
}

export function useClaim(claimId?: string) {
  return useQuery({
    queryKey: claimKeys.detail(claimId ?? ''),
    queryFn: () => claimService.getClaim(claimId!),
    enabled: !!claimId,
  })
}

export function useCreateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClaimRequest) => claimService.createClaim(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: claimKeys.list() })
      toast.success('Klaim entitas berhasil dibuat')
    },
    onError: (err) => toast.error('Gagal membuat klaim', { description: extractErrorMessage(err) }),
  })
}

export function useSubmitClaim(claimId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => claimService.submitClaim(claimId!),
    onSuccess: () => {
      if (claimId) {
        qc.invalidateQueries({ queryKey: claimKeys.detail(claimId) })
        qc.invalidateQueries({ queryKey: claimKeys.documents(claimId) })
      }
      qc.invalidateQueries({ queryKey: claimKeys.list() })
      toast.success('Klaim berhasil diajukan untuk review')
    },
    onError: (err) => toast.error('Gagal mengajukan klaim', { description: extractErrorMessage(err) }),
  })
}

export function useDisputeClaim(claimId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: DisputeClaimRequest) => claimService.disputeClaim(claimId!, body),
    onSuccess: () => {
      if (claimId) qc.invalidateQueries({ queryKey: claimKeys.detail(claimId) })
      qc.invalidateQueries({ queryKey: claimKeys.list() })
      toast.success('Dispute berhasil diajukan')
    },
    onError: (err) => toast.error('Gagal mengajukan dispute', { description: extractErrorMessage(err) }),
  })
}

export function useUploadClaimDocument(claimId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, meta }: { file: File; meta: DocumentUploadRequest }) => {
      const presigned = await claimService.requestDocumentUpload(claimId!, meta)
      await claimService.uploadToPresignedUrl(presigned.upload_url, file)
      await claimService.confirmDocumentUpload(claimId!, presigned.document_id)
    },
    onSuccess: () => {
      if (claimId) {
        qc.invalidateQueries({ queryKey: claimKeys.detail(claimId) })
        qc.invalidateQueries({ queryKey: claimKeys.documents(claimId) })
      }
      toast.success('Dokumen berhasil diunggah')
    },
    onError: (err) => toast.error('Gagal mengunggah dokumen', { description: extractErrorMessage(err) }),
  })
}

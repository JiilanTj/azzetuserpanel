import type { ClaimStatus, ClaimDocumentType } from '@/lib/api/types/claim.types'
import type { VerificationStatus, LegalIDType } from '@/lib/api/types/identity.types'

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  UNVERIFIED: 'Belum Terverifikasi',
  PENDING: 'Menunggu Review',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Diajukan',
  UNDER_REVIEW: 'Sedang Direview',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  DISPUTED: 'Dispute',
}

export const LEGAL_ID_LABELS: Record<LegalIDType, string> = {
  NPWP: 'NPWP',
  NIB: 'NIB',
  SIUP: 'SIUP',
  KTP: 'KTP',
  AKTA: 'Akta',
}

export const CLAIM_DOC_LABELS: Record<ClaimDocumentType, string> = {
  NPWP: 'NPWP',
  NIB: 'NIB',
  SIUP: 'SIUP',
  AKTA_PENDIRIAN: 'Akta Pendirian',
  AKTA_PERUBAHAN: 'Akta Perubahan',
  KTP_DIREKTUR: 'KTP Direktur',
  SURAT_KUASA: 'Surat Kuasa',
  OTHER: 'Dokumen Lainnya',
}

export const CLAIM_DOC_TYPES = Object.keys(CLAIM_DOC_LABELS) as ClaimDocumentType[]

export function claimStatusVariant(status: ClaimStatus): 'gray' | 'soft' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'DRAFT': return 'gray'
    case 'SUBMITTED':
    case 'UNDER_REVIEW': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'error'
    case 'DISPUTED': return 'warning'
    default: return 'gray'
  }
}

export function verificationStatusVariant(status: VerificationStatus): 'gray' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'UNVERIFIED': return 'gray'
    case 'PENDING': return 'warning'
    case 'VERIFIED': return 'success'
    case 'REJECTED': return 'error'
    default: return 'gray'
  }
}

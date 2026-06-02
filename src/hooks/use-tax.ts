import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { taxService } from '@/lib/api/services/tax.service'
import { extractErrorMessage } from '@/lib/api/errors'
import { useWorkspaceStore } from '@/stores/workspace.store'
import type { UpdateTaxProfileRequest, RequestTaxReportRequest, LinkTaxDocumentRequest } from '@/lib/api/types/tax.types'

export const taxKeys = {
  all: (wsId: string) => ['tax', wsId] as const,
  profile: (wsId: string) => [...taxKeys.all(wsId), 'profile'] as const,
  calculations: (wsId: string, period?: string) => [...taxKeys.all(wsId), 'calculations', period ?? 'all'] as const,
  calculation: (wsId: string, id: string) => [...taxKeys.all(wsId), 'calculation', id] as const,
  calculationDocs: (wsId: string, calcId: string) => [...taxKeys.all(wsId), 'calculation-docs', calcId] as const,
  ppnSummary: (wsId: string, period: string) => [...taxKeys.all(wsId), 'ppn', period] as const,
  pphSummary: (wsId: string, from: string, to: string) => [...taxKeys.all(wsId), 'pph', from, to] as const,
  reports: (wsId: string) => [...taxKeys.all(wsId), 'reports'] as const,
  report: (wsId: string, id: string) => [...taxKeys.all(wsId), 'report', id] as const,
}

function useWorkspaceEntityId() {
  return useWorkspaceStore(s => s.activeWorkspace?.entity_id ?? '')
}

export function useTaxProfile() {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.profile(wsId),
    queryFn: () => taxService.getProfile(wsId),
    enabled: !!wsId,
  })
}

export function useUpdateTaxProfile() {
  const wsId = useWorkspaceEntityId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTaxProfileRequest) => taxService.updateProfile(wsId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taxKeys.all(wsId) })
      toast.success('Profil pajak disimpan')
    },
    onError: (err) => toast.error('Gagal menyimpan profil pajak', { description: extractErrorMessage(err) }),
  })
}

export function useTaxCalculations(period?: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.calculations(wsId, period),
    queryFn: () => taxService.listCalculations(wsId, { period, limit: 50 }),
    enabled: !!wsId,
  })
}

export function useTaxCalculation(calculationId?: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.calculation(wsId, calculationId ?? ''),
    queryFn: () => taxService.getCalculation(wsId, calculationId!),
    enabled: !!wsId && !!calculationId,
  })
}

export function useTaxCalculationDocuments(calculationId?: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.calculationDocs(wsId, calculationId ?? ''),
    queryFn: () => taxService.listCalculationDocuments(wsId, calculationId!),
    enabled: !!wsId && !!calculationId,
  })
}

export function useLinkTaxDocument(calculationId?: string) {
  const wsId = useWorkspaceEntityId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: LinkTaxDocumentRequest) =>
      taxService.linkCalculationDocument(wsId, calculationId!, body),
    onSuccess: () => {
      if (calculationId) {
        qc.invalidateQueries({ queryKey: taxKeys.calculationDocs(wsId, calculationId) })
      }
      toast.success('Dokumen berhasil ditautkan')
    },
    onError: (err) => toast.error('Gagal menautkan dokumen', { description: extractErrorMessage(err) }),
  })
}

export function usePPNSummary(period: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.ppnSummary(wsId, period),
    queryFn: () => taxService.getPPNSummary(wsId, period),
    enabled: !!wsId && !!period,
  })
}

export function usePPhSummary(periodFrom: string, periodTo: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.pphSummary(wsId, periodFrom, periodTo),
    queryFn: () => taxService.getPPhSummary(wsId, periodFrom, periodTo),
    enabled: !!wsId && !!periodFrom && !!periodTo,
  })
}

export function useRequestTaxReport() {
  const wsId = useWorkspaceEntityId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RequestTaxReportRequest) => taxService.requestReport(wsId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taxKeys.reports(wsId) })
      toast.success('Laporan pajak sedang diproses')
    },
    onError: (err) => toast.error('Gagal meminta laporan', { description: extractErrorMessage(err) }),
  })
}

export function useTaxReportJobs() {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.reports(wsId),
    queryFn: () => taxService.listReportJobs(wsId, { limit: 10 }),
    enabled: !!wsId,
    refetchInterval: (query) => {
      const jobs = query.state.data
      if (jobs?.some(j => j.status === 'PENDING' || j.status === 'PROCESSING')) return 3000
      return false
    },
  })
}

export function useTaxReportJob(jobId?: string) {
  const wsId = useWorkspaceEntityId()
  return useQuery({
    queryKey: taxKeys.report(wsId, jobId ?? ''),
    queryFn: () => taxService.getReportJob(wsId, jobId!),
    enabled: !!wsId && !!jobId,
    refetchInterval: (query) => {
      const job = query.state.data
      if (job?.status === 'PENDING' || job?.status === 'PROCESSING') return 2000
      return false
    },
  })
}

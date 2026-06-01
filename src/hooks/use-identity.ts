import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { identityService } from '@/lib/api/services/identity.service'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  AddLegalIDRequest,
  AddAliasRequest,
  UpdateLegalIDRequest,
  SetCounterpartyAliasRequest,
} from '@/lib/api/types/identity.types'

export const identityKeys = {
  all: ['identity'] as const,
  verification: (entityId: string) => [...identityKeys.all, 'verification', entityId] as const,
  legalIDs: (entityId: string) => [...identityKeys.all, 'legal-ids', entityId] as const,
  aliases: (entityId: string) => [...identityKeys.all, 'aliases', entityId] as const,
  duplicates: (entityId: string) => [...identityKeys.all, 'duplicates', entityId] as const,
  fuzzySearch: (q: string) => [...identityKeys.all, 'fuzzy', q] as const,
  counterpartyAliases: (wsId: string) => [...identityKeys.all, 'cp-aliases', wsId] as const,
}

export function useVerification(entityId?: string) {
  return useQuery({
    queryKey: identityKeys.verification(entityId ?? ''),
    queryFn: () => identityService.getVerification(entityId!),
    enabled: !!entityId,
  })
}

export function useLegalIDs(entityId?: string) {
  return useQuery({
    queryKey: identityKeys.legalIDs(entityId ?? ''),
    queryFn: () => identityService.listLegalIDs(entityId!),
    enabled: !!entityId,
  })
}

export function useAddLegalID(entityId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AddLegalIDRequest) => identityService.addLegalID(entityId!, body),
    onSuccess: () => {
      if (entityId) qc.invalidateQueries({ queryKey: identityKeys.legalIDs(entityId) })
      toast.success('Identitas legal berhasil ditambahkan')
    },
    onError: (err) => toast.error('Gagal menambah identitas', { description: extractErrorMessage(err) }),
  })
}

export function useUpdateLegalID(entityId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ idType, body }: { idType: string; body: UpdateLegalIDRequest }) =>
      identityService.updateLegalID(entityId!, idType, body),
    onSuccess: () => {
      if (entityId) qc.invalidateQueries({ queryKey: identityKeys.legalIDs(entityId) })
      toast.success('Identitas legal berhasil diperbarui')
    },
    onError: (err) => toast.error('Gagal memperbarui identitas', { description: extractErrorMessage(err) }),
  })
}

export function useDeleteLegalID(entityId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idType: string) => identityService.deleteLegalID(entityId!, idType),
    onSuccess: () => {
      if (entityId) qc.invalidateQueries({ queryKey: identityKeys.legalIDs(entityId) })
      toast.success('Identitas legal dihapus')
    },
    onError: (err) => toast.error('Gagal menghapus identitas', { description: extractErrorMessage(err) }),
  })
}

export function useAliases(entityId?: string) {
  return useQuery({
    queryKey: identityKeys.aliases(entityId ?? ''),
    queryFn: () => identityService.listAliases(entityId!),
    enabled: !!entityId,
  })
}

export function useAddAlias(entityId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AddAliasRequest) => identityService.addAlias(entityId!, body),
    onSuccess: () => {
      if (entityId) qc.invalidateQueries({ queryKey: identityKeys.aliases(entityId) })
      toast.success('Alias berhasil ditambahkan')
    },
    onError: (err) => toast.error('Gagal menambah alias', { description: extractErrorMessage(err) }),
  })
}

export function useDeleteAlias(entityId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (aliasId: string) => identityService.deleteAlias(entityId!, aliasId),
    onSuccess: () => {
      if (entityId) qc.invalidateQueries({ queryKey: identityKeys.aliases(entityId) })
      toast.success('Alias dihapus')
    },
    onError: (err) => toast.error('Gagal menghapus alias', { description: extractErrorMessage(err) }),
  })
}

export function useFindDuplicates(entityId?: string) {
  return useQuery({
    queryKey: identityKeys.duplicates(entityId ?? ''),
    queryFn: () => identityService.findDuplicates(entityId!),
    enabled: !!entityId,
  })
}

export function useFuzzySearch(q: string, enabled = true) {
  return useQuery({
    queryKey: identityKeys.fuzzySearch(q),
    queryFn: () => identityService.searchFuzzy(q),
    enabled: enabled && q.trim().length >= 3,
    staleTime: 5000,
  })
}

export function useCounterpartyAliases(workspaceId?: string) {
  return useQuery({
    queryKey: identityKeys.counterpartyAliases(workspaceId ?? ''),
    queryFn: () => identityService.listCounterpartyAliases(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useSetCounterpartyAlias(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SetCounterpartyAliasRequest) =>
      identityService.setCounterpartyAlias(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: identityKeys.counterpartyAliases(workspaceId) })
        qc.invalidateQueries({ queryKey: ['workspace', workspaceId, 'counterparties'] })
      }
      toast.success('Alias pihak ketiga diperbarui')
    },
    onError: (err) => toast.error('Gagal memperbarui alias', { description: extractErrorMessage(err) }),
  })
}

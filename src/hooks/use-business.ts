import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { businessService } from '@/lib/api/services'
import type {
  CreateEntityRequest,
  CreateWorkspaceRequest,
  SubscribeRequest,
  CreatePaymentRequest,
  InviteMemberRequest,
  UpdateMemberRequest,
} from '@/lib/api/types'

export const businessKeys = {
  all: ['business'] as const,
  workspaces: () => [...businessKeys.all, 'workspaces'] as const,
  plans: () => [...businessKeys.all, 'plans'] as const,
  subscription: (workspaceId: string) => [...businessKeys.all, 'subscription', workspaceId] as const,
  invoices: (workspaceId: string) => [...businessKeys.all, 'invoices', workspaceId] as const,
  members: (workspaceId: string) => [...businessKeys.all, 'members', workspaceId] as const,
}

// -------------------------------------------------------
// Entity Hooks
// -------------------------------------------------------

export function useCreateEntity() {
  return useMutation({
    mutationFn: (body: CreateEntityRequest) => businessService.createEntity(body),
    onError: (err: unknown) => {
      toast.error('Gagal membuat entitas bisnis', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Workspace Hooks
// -------------------------------------------------------

export function useWorkspaces() {
  return useQuery({
    queryKey: businessKeys.workspaces(),
    queryFn: () => businessService.listWorkspaces(),
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkspaceRequest) => businessService.createWorkspace(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.workspaces() })
    },
    onError: (err: unknown) => {
      toast.error('Gagal membuat workspace', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Plan Hooks (Public)
// -------------------------------------------------------

export function usePlans() {
  return useQuery({
    queryKey: businessKeys.plans(),
    queryFn: () => businessService.listPlans(),
    staleTime: 10 * 60_000, // 10 mins
  })
}

// -------------------------------------------------------
// Subscription Hooks
// -------------------------------------------------------

export function useSubscription(workspaceId?: string) {
  return useQuery({
    queryKey: businessKeys.subscription(workspaceId ?? ''),
    queryFn: () => businessService.getSubscription(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useSubscribe(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SubscribeRequest) => businessService.subscribe(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: businessKeys.subscription(workspaceId) })
      }
      toast.success('Pendaftaran langganan berhasil diproses!')
    },
    onError: (err: unknown) => {
      toast.error('Gagal memproses langganan', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Billing Hooks
// -------------------------------------------------------

export function useInvoices(workspaceId?: string) {
  return useQuery({
    queryKey: businessKeys.invoices(workspaceId ?? ''),
    queryFn: () => businessService.listInvoices(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function usePayInvoice(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => businessService.payInvoice(workspaceId!, body),
    onSuccess: (data) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: businessKeys.invoices(workspaceId) })
      }
      toast.success('Sesi pembayaran berhasil dibuat! Mengalihkan...')
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    },
    onError: (err: unknown) => {
      toast.error('Gagal membuat sesi pembayaran', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Member Hooks
// -------------------------------------------------------

export function useMembers(workspaceId?: string) {
  return useQuery({
    queryKey: businessKeys.members(workspaceId ?? ''),
    queryFn: () => businessService.listMembers(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useInviteMember(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: InviteMemberRequest) => businessService.inviteMember(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: businessKeys.members(workspaceId) })
      }
      toast.success('Anggota berhasil ditambahkan!')
    },
    onError: (err: unknown) => {
      toast.error('Gagal menambahkan anggota', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

export function useUpdateMember(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: string; body: UpdateMemberRequest }) =>
      businessService.updateMember(workspaceId!, memberId, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: businessKeys.members(workspaceId) })
      }
      toast.success('Data anggota berhasil diperbarui.')
    },
    onError: (err: unknown) => {
      toast.error('Gagal memperbarui anggota', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

export function useRemoveMember(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => businessService.removeMember(workspaceId!, memberId),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: businessKeys.members(workspaceId) })
      }
      toast.success('Anggota berhasil dihapus dari workspace.')
    },
    onError: (err: unknown) => {
      toast.error('Gagal menghapus anggota', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

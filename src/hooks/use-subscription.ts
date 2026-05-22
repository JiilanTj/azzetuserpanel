import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subscriptionService } from '@/lib/api/services'
import type {
  SubscribeRequest,
  CreatePaymentRequest,
} from '@/lib/api/types'

export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  subscription: (workspaceId: string) => [...subscriptionKeys.all, 'detail', workspaceId] as const,
  invoices: (workspaceId: string) => [...subscriptionKeys.all, 'invoices', workspaceId] as const,
}

// -------------------------------------------------------
// Plan Hooks (Public)
// -------------------------------------------------------

export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.listPlans(),
    staleTime: 10 * 60_000, // 10 mins
  })
}

export function usePlansWithFeatures() {
  return useQuery({
    queryKey: [...subscriptionKeys.plans(), 'with-features'],
    queryFn: async () => {
      const plans = await subscriptionService.listPlans()
      const detailed = await Promise.all(
        plans.map(p => subscriptionService.getPlanBySlug(p.slug))
      )
      return detailed
    },
    staleTime: 10 * 60_000,
  })
}

// -------------------------------------------------------
// Subscription Hooks
// -------------------------------------------------------

export function useSubscription(workspaceId?: string) {
  return useQuery({
    queryKey: subscriptionKeys.subscription(workspaceId ?? ''),
    queryFn: () => subscriptionService.getSubscription(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useSubscribe(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SubscribeRequest) => subscriptionService.subscribe(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: subscriptionKeys.subscription(workspaceId) })
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
    queryKey: subscriptionKeys.invoices(workspaceId ?? ''),
    queryFn: () => subscriptionService.listInvoices(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function usePayInvoice(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => subscriptionService.payInvoice(workspaceId!, body),
    onSuccess: (data) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: subscriptionKeys.invoices(workspaceId) })
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

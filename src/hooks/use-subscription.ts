import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subscriptionService } from '@/lib/api/services'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  SubscribeRequest,
  CreatePaymentRequest,
} from '@/lib/api/types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const subscriptionKeys = {
  all: ['subscription'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  subscription: (workspaceId: string) => [...subscriptionKeys.all, 'detail', workspaceId] as const,
  invoices: (workspaceId: string) => [...subscriptionKeys.all, 'invoices', workspaceId] as const,
}

// -------------------------------------------------------
// usePlans — list all available plans (public)
// -------------------------------------------------------

export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionService.listPlans(),
    staleTime: 10 * 60_000, // 10 mins
  })
}

// -------------------------------------------------------
// usePlansWithFeatures — list plans with full feature details
// -------------------------------------------------------

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
// useSubscription — get active subscription for workspace
// -------------------------------------------------------

export function useSubscription(workspaceId?: string) {
  return useQuery({
    queryKey: subscriptionKeys.subscription(workspaceId ?? ''),
    queryFn: () => subscriptionService.getSubscription(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 60_000, // 1 min
  })
}

// -------------------------------------------------------
// useSubscribe — subscribe workspace to a plan
// -------------------------------------------------------

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
    onError: (err) => {
      toast.error('Gagal memproses langganan', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useInvoices — list invoices for workspace
// -------------------------------------------------------

export function useInvoices(workspaceId?: string) {
  return useQuery({
    queryKey: subscriptionKeys.invoices(workspaceId ?? ''),
    queryFn: () => subscriptionService.listInvoices(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 60_000, // 1 min
  })
}

// -------------------------------------------------------
// usePayInvoice — initiate payment for an invoice
// -------------------------------------------------------

export function usePayInvoice(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => subscriptionService.payInvoice(workspaceId!, body),
    onSuccess: (data) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: subscriptionKeys.invoices(workspaceId) })
      }
      if (data.payment_url) {
        toast.success('Mengalihkan ke halaman pembayaran...')
        window.location.href = data.payment_url
      } else {
        toast.success('Pembayaran berhasil diproses!')
      }
    },
    onError: (err) => {
      toast.error('Gagal memproses pembayaran', { description: extractErrorMessage(err) })
    },
  })
}

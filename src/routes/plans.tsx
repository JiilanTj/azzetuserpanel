import { createRoute } from '@tanstack/react-router'
import { authedLayout } from './_authed'
import { usePlans, useSubscription, useSubscribe } from '@/hooks/use-business'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { Button } from '@/components/ui'
import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons'
import { cn, formatIDR } from '@/lib/utils'

export const plansRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/plans',
  component: PlansPage,
})

function PlansPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: plans, isLoading: loadingPlans } = usePlans()
  const { data: subscription, isLoading: loadingSub } = useSubscription(activeWorkspace?.entity_id)
  const subscribeMutation = useSubscribe(activeWorkspace?.entity_id)

  const handleSelectPlan = async (planId: string, type: 'free' | 'paid') => {
    if (!activeWorkspace) {
      return
    }

    await subscribeMutation.mutateAsync({
      plan_id: planId,
      billing_cycle: type === 'paid' ? 'monthly' : undefined,
    }, {
      onSuccess: (data) => {
        // If it's a paid subscription, usePayInvoice will handle redirection, but let's notify the user
        if (data.status === 'active' || data.status === 'trial') {
          window.location.reload()
        }
      }
    })
  }

  const isLoading = loadingPlans || loadingSub

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-(--gray-12) mb-2">Pilih Rencana Layanan</h1>
        <p className="text-sm text-(--gray-10) max-w-lg mx-auto">
          Dapatkan akses penuh ke fitur akuntansi B2B tercanggih yang didesain untuk mendorong performa bisnis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans?.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id
          const isTrialActive = subscription?.status === 'trial' && isCurrentPlan

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col p-8 rounded-2xl border bg-(--color-surface) transition-all duration-300 hover:shadow-lg',
                isCurrentPlan
                  ? 'border-(--blue-9) ring-2 ring-(--blue-9)/20 scale-[1.02]'
                  : 'border-(--gray-4) hover:border-(--gray-8)'
              )}
            >
              {isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-(--blue-9) text-(--blue-contrast) text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Plan Aktif {isTrialActive ? '(Uji Coba)' : ''}
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-(--gray-12) mb-1">{plan.name}</h3>
                <p className="text-xs text-(--gray-10) min-h-[32px]">{plan.description || `Fitur dasar untuk plan ${plan.name}`}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-(--gray-12)">
                    {plan.price_monthly === 0 ? 'Gratis' : formatIDR(plan.price_monthly)}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="ml-1 text-xs text-(--gray-10)">/ bulan</span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 mb-8">
                <p className="text-xs font-semibold text-(--gray-12) mb-4 uppercase tracking-wider">Fitur Termasuk:</p>
                <ul className="space-y-3">
                  {plan.features?.map((feat, idx) => {
                    const isEnabled = feat.value_bool || feat.value_int > 0
                    return (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {isEnabled ? (
                          <CheckIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Cross1Icon className="h-3.5 w-3.5 text-red-400 shrink-0 mt-1" />
                        )}
                        <span className={cn('leading-normal', isEnabled ? 'text-(--gray-12)' : 'text-(--gray-9) line-through')}>
                          {feat.feature_key === 'max_entities'
                            ? `Batas Entitas Maksimal: ${feat.value_int}`
                            : feat.feature_key === 'ocr_enabled'
                            ? 'Teknologi Pemindai Dokumen OCR'
                            : feat.feature_key}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id, plan.type)}
                disabled={isCurrentPlan || subscribeMutation.isPending}
                variant={isCurrentPlan ? 'outline' : 'solid'}
                className="w-full"
              >
                {isCurrentPlan
                  ? 'Plan Aktif'
                  : plan.is_trial
                  ? 'Mulai Uji Coba 14 Hari'
                  : 'Pilih Plan'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

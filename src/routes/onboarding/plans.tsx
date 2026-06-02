import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "../__root";
import { authMiddleware } from "@/middleware/auth.middleware";
import { usePlansWithFeatures, useSubscription, useSubscribe, useChangeSubscription } from "@/hooks/use-subscription";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Button } from "@/components/ui";
import { CheckIcon, Cross1Icon, RocketIcon } from "@radix-ui/react-icons";
import { cn, formatIDR } from "@/lib/utils";
import logoSvg from "@/assets/logo.svg";

export const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plans",
  beforeLoad: authMiddleware.requireAuth,
  component: PlansPage,
});

// Human-readable feature labels
const FEATURE_LABELS: Record<string, string> = {
  max_entities: "Entitas Bisnis",
  max_transactions_monthly: "Transaksi / Bulan",
  ocr_enabled: "Pemindai Dokumen OCR",
  can_export_reports: "Ekspor Laporan",
  support_level: "Level Dukungan",
  max_users: "Pengguna / Workspace",
  ai_categorization: "Kategorisasi AI Otomatis",
  multi_workspace: "Multi Workspace",
};

function getFeatureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getFeatureValue(feat: { feature_type: string; value_bool?: boolean; value_int?: number; value_text?: string }): { enabled: boolean; display: string } {
  switch (feat.feature_type) {
    case "boolean":
      return { enabled: !!feat.value_bool, display: feat.value_bool ? "Ya" : "Tidak" };
    case "quota": {
      if (feat.value_int === -1) return { enabled: true, display: "Unlimited" };
      if (feat.value_int != null && feat.value_int > 0) return { enabled: true, display: feat.value_int.toLocaleString("id-ID") };
      return { enabled: false, display: "0" };
    }
    case "tier":
      return { enabled: !!feat.value_text, display: feat.value_text ? feat.value_text.charAt(0).toUpperCase() + feat.value_text.slice(1) : "-" };
    default:
      return { enabled: false, display: "-" };
  }
}

function PlansPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceStore();
  const { data: plans, isLoading: loadingPlans } = usePlansWithFeatures();
  const { data: subscription, isLoading: loadingSub } = useSubscription(
    activeWorkspace?.entity_id,
  );
  const subscribeMutation = useSubscribe(activeWorkspace?.entity_id);
  const changeMutation = useChangeSubscription(activeWorkspace?.entity_id);

  const hasActiveSubscription =
    subscription != null &&
    (subscription.status === "active" ||
      subscription.status === "trial" ||
      subscription.status === "pending_payment");

  const handleSelectPlan = async (planId: string, type: "free" | "paid") => {
    if (!activeWorkspace) return;

    const body = {
      plan_id: planId,
      billing_cycle: type === "paid" ? ("monthly" as const) : undefined,
    };

    const mutation = hasActiveSubscription ? changeMutation : subscribeMutation;

    await mutation.mutateAsync(body, {
      onSuccess: (data) => {
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else if (data.status === "active" || data.status === "trial") {
          navigate({ to: "/dashboard", replace: true });
        }
      },
    });
  };

  const isLoading = loadingPlans || loadingSub;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-6 py-12">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-8" />

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-(--gray-12) mb-3">
          Pilih Rencana Layanan
        </h1>
        <p className="text-sm text-(--gray-10) max-w-lg mx-auto leading-relaxed">
          Mulai kelola keuangan bisnis Anda dengan plan yang sesuai kebutuhan.
          Upgrade kapan saja seiring pertumbuhan bisnis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl items-stretch">
        {plans?.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const isTrialActive = subscription?.status === "trial" && isCurrentPlan;
          const isFree = plan.type === "free";
          const isPopular = plan.tier === 2; // Middle tier is usually the popular one

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface transition-all duration-300",
                isCurrentPlan
                  ? "border-(--blue-9) ring-2 ring-(--blue-9)/20"
                  : isPopular
                    ? "border-(--blue-6) shadow-(--blue-3)"
                    : "border-(--gray-4) hover:border-(--gray-7)",
              )}
            >
              {/* Top badges */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-(--blue-9) text-(--blue-contrast) text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                  Plan Aktif {isTrialActive ? "(Uji Coba)" : ""}
                </div>
              )}
              {isPopular && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <RocketIcon className="h-3 w-3" />
                  Paling Populer
                </div>
              )}

              {/* Header section */}
              <div className="p-6 pb-0">
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                      isFree
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                    )}
                  >
                    {isFree ? "Gratis" : "Berbayar"}
                  </span>
                  {plan.is_trial && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      Free Trial {plan.trial_days} Hari
                    </span>
                  )}
                </div>

                {/* Plan name & description */}
                <h3 className="text-xl font-bold text-(--gray-12) mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-(--gray-10) min-h-8 leading-relaxed">
                  {plan.description || `Plan ${plan.name} untuk kebutuhan bisnis Anda.`}
                </p>

                {/* Pricing */}
                <div className="mt-5 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-(--gray-12)">
                      {plan.price_monthly === 0 ? "Rp 0" : formatIDR(plan.price_monthly)}
                    </span>
                    <span className="text-sm text-(--gray-9)">/ bulan</span>
                  </div>
                  {plan.price_yearly > 0 && (
                    <p className="text-xs text-(--gray-9) mt-1">
                      atau {formatIDR(plan.price_yearly)} / tahun{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        (hemat {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-(--gray-3)" />

              {/* Features list */}
              <div className="flex-1 p-6">
                <p className="text-xs font-semibold text-(--gray-11) mb-4 uppercase tracking-wider">
                  Fitur yang didapat:
                </p>
                <ul className="space-y-3">
                  {plan.features?.map((feat, idx) => {
                    const { enabled, display } = getFeatureValue(feat);
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        {enabled ? (
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                            <CheckIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-50 dark:bg-red-950/20 shrink-0">
                            <Cross1Icon className="h-3 w-3 text-red-400" />
                          </span>
                        )}
                        <span
                          className={cn(
                            "leading-tight",
                            enabled ? "text-(--gray-12)" : "text-(--gray-9) line-through",
                          )}
                        >
                          {getFeatureLabel(feat.feature_key)}
                          {/* Show quota/tier value inline */}
                          {enabled && feat.feature_type === "quota" && (
                            <span className="ml-1 text-(--gray-9) font-medium">
                              ({display})
                            </span>
                          )}
                          {enabled && feat.feature_type === "tier" && (
                            <span className="ml-1 text-(--gray-9) font-medium">
                              — {display}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                  {(!plan.features || plan.features.length === 0) && (
                    <li className="text-xs text-(--gray-9) italic">
                      Belum ada fitur yang dikonfigurasi.
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="p-6 pt-0">
                <Button
                  onClick={() => handleSelectPlan(plan.id, plan.type)}
                  disabled={isCurrentPlan || subscribeMutation.isPending || changeMutation.isPending}
                  variant={isCurrentPlan ? "outline" : "solid"}
                  size="3"
                  className={cn(
                    "w-full",
                    isPopular && !isCurrentPlan && "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                  )}
                >
                  {isCurrentPlan
                    ? "Plan Aktif Anda"
                    : hasActiveSubscription
                      ? "Ganti ke Plan Ini"
                      : plan.is_trial
                      ? `Coba Gratis ${plan.trial_days} Hari`
                      : isFree
                        ? "Mulai Gratis"
                        : "Pilih Plan Ini"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-(--gray-9) text-center max-w-md">
        Semua plan termasuk akses ke fitur dasar platform. Anda dapat mengubah plan kapan saja dari halaman pengaturan.
      </p>
    </div>
  );
}

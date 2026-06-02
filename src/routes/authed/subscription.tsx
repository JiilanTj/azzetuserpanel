import { useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  useSubscription,
  useSubscriptionHistory,
  useSubscriptionUsage,
  useCancelSubscription,
} from "@/hooks/use-subscription";
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CrossCircledIcon,
  UpdateIcon,
  BarChartIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";

export const subscriptionRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/subscription",
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const workspaceId = activeWorkspace?.entity_id;
  
  const { data: subscription, isLoading: isSubLoading } = useSubscription(workspaceId);
  const { data: usage, isLoading: isUsageLoading } = useSubscriptionUsage(workspaceId);
  const { data: history, isLoading: isHistoryLoading } = useSubscriptionHistory(workspaceId);
  
  const navigate = useNavigate();

  if (isSubLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Langganan & Kuota
        </h1>
        <p className="text-sm text-(--gray-10)">
          Kelola paket langganan dan pantau penggunaan fitur workspace Anda.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="history">Riwayat Langganan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Active Subscription Banner */}
          <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={subscription?.status === "active" ? "success" : "warning"}>
                  {subscription?.status === "active" ? "Aktif" : subscription?.status === "trial" ? "Trial" : subscription?.status}
                </Badge>
                {subscription?.billing_cycle && (
                  <span className="text-xs text-(--gray-9) uppercase tracking-wider font-semibold">
                    • Siklus {subscription.billing_cycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-(--gray-12) mb-1">
                {subscription?.plan_name || "Free Plan"}
              </h2>
              <p className="text-sm text-(--gray-10)">
                Berlaku hingga: <span className="font-medium text-(--gray-12)">
                  {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CancelSubscriptionDialog />
              <Button 
                variant="solid" 
                className="gap-2 bg-(--blue-9) hover:bg-(--blue-10)"
                onClick={() => navigate({ to: "/plans" })}
              >
                <UpdateIcon className="h-4 w-4" />
                {subscription?.status === "active" || subscription?.status === "trial"
                  ? "Upgrade / Ganti Paket"
                  : "Ganti Paket"}
              </Button>
            </div>
          </div>

          {/* Quota Usage */}
          <div>
            <h3 className="text-lg font-bold text-(--gray-12) mb-4 flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-(--blue-9)" />
              Penggunaan Kuota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isUsageLoading ? (
                <div className="col-span-full py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
                </div>
              ) : !usage || usage.length === 0 ? (
                <div className="col-span-full py-8 text-center border border-(--gray-4) rounded-xl bg-(--gray-2)">
                  <p className="text-sm text-(--gray-11)">Belum ada data penggunaan tercatat.</p>
                </div>
              ) : (
                usage.map((u) => {
                  const percentage = u.limit > 0 ? Math.min(100, Math.round((u.usage_count / u.limit) * 100)) : 0;
                  const isWarning = percentage >= 80;
                  const isDanger = percentage >= 100;
                  
                  return (
                    <div key={u.feature_key} className="p-4 border border-(--gray-4) rounded-xl bg-surface">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-xs font-medium text-(--gray-9) uppercase tracking-wider mb-1">
                            {formatFeatureName(u.feature_key)}
                          </p>
                          <p className="text-lg font-bold text-(--gray-12)">
                            {u.usage_count} <span className="text-sm font-normal text-(--gray-10)">/ {u.limit === -1 ? 'Unlimited' : u.limit}</span>
                          </p>
                        </div>
                        {u.limit > 0 && (
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            isDanger ? "bg-red-100 text-red-700" : isWarning ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {percentage}%
                          </span>
                        )}
                      </div>
                      {u.limit > 0 && (
                        <div className="h-2 w-full bg-(--gray-3) rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-(--blue-9)"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
            <div className="px-6 py-4 border-b border-(--gray-4)">
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-(--gray-9)" />
                <h2 className="text-sm font-semibold text-(--gray-12)">
                  Riwayat Langganan
                </h2>
              </div>
            </div>

            {isHistoryLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
              </div>
            ) : !history || history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileTextIcon className="h-10 w-10 text-(--gray-7) mb-3" />
                <p className="text-sm font-medium text-(--gray-11) mb-1">
                  Belum ada riwayat
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                        Paket
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                        Siklus
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((hist) => (
                      <tr
                        key={hist.id}
                        className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-(--gray-12)">
                          {hist.plan_name}
                        </td>
                        <td className="px-6 py-4 text-(--gray-11) capitalize">
                          {hist.billing_cycle || '-'}
                        </td>
                        <td className="px-6 py-4 text-(--gray-10)">
                          {new Date(hist.started_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          {" - "}
                          {hist.expires_at ? new Date(hist.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : 'Sekarang'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={hist.status === 'active' ? 'success' : hist.status === 'cancelled' ? 'error' : 'gray'}
                          >
                            {hist.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CancelSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const { activeWorkspace } = useWorkspaceStore();
  const cancelMutation = useCancelSubscription(activeWorkspace?.entity_id);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      setOpen(false);
    } catch {
      // toast already handled
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline" 
        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        onClick={() => setOpen(true)}
      >
        <CrossCircledIcon className="h-4 w-4" />
        Batalkan
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <CrossCircledIcon className="h-5 w-5" />
            Konfirmasi Pembatalan
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin membatalkan langganan paket ini? Anda masih bisa mengakses fitur premium hingga akhir siklus penagihan saat ini.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>Kembali</Button>
          <Button 
            variant="solid" 
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            loading={cancelMutation.isPending}
            onClick={handleCancel}
          >
            Ya, Batalkan Langganan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFeatureName(key: string) {
  const map: Record<string, string> = {
    'max_transactions_monthly': 'Transaksi / Bulan',
    'max_workspaces': 'Maks Workspace',
    'max_users': 'Pengguna Workspace',
    'max_ocr_monthly': 'Scan Bon (OCR) / Bulan'
  };
  return map[key] || key.replace(/_/g, ' ');
}

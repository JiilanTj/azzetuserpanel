import { createRoute, Link } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  ArrowRightIcon,
  FileTextIcon,
  PersonIcon,
  RocketIcon,
  CheckCircledIcon,
  ClockIcon,
} from "@radix-ui/react-icons";
import { cn, formatIDR } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  useSubscription,
  useInvoices,
  useMembers,
  useWorkspaces,
} from "@/hooks/use-business";
import { useMe } from "@/hooks/use-auth";
import { Badge } from "@/components/ui";

export const dashboardRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/dashboard",
  component: DashboardPage,
});

function DashboardPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: user } = useMe();
  const { data: subscription } = useSubscription(activeWorkspace?.entity_id);
  const { data: invoices } = useInvoices(activeWorkspace?.entity_id);
  const { data: members } = useMembers(activeWorkspace?.entity_id);
  const { data: workspaces } = useWorkspaces();

  const pendingInvoices =
    invoices?.filter((inv) => inv.status === "pending") ?? [];
  const paidInvoices = invoices?.filter((inv) => inv.status === "paid") ?? [];
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 max-w-300 mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1">
            Selamat datang, {user?.name?.split(" ")[0] ?? "User"}
          </h1>
          <p className="text-sm text-(--gray-10)">
            {activeWorkspace
              ? `Workspace: ${activeWorkspace.entity_name}`
              : "Pilih atau buat workspace untuk memulai."}
          </p>
        </div>
        {!activeWorkspace && (
          <Link
            to="/workspaces/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--blue-9) text-(--blue-contrast) text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RocketIcon className="h-4 w-4" />
            Buat Workspace
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Workspace"
          value={String(workspaces?.length ?? 0)}
          sub="Total workspace Anda"
          icon={<RocketIcon className="h-4 w-4" />}
          color="blue"
        />
        <StatCard
          label="Anggota Tim"
          value={String(members?.length ?? 0)}
          sub={activeWorkspace ? "Di workspace aktif" : "Pilih workspace"}
          icon={<PersonIcon className="h-4 w-4" />}
          color="emerald"
        />
        <StatCard
          label="Invoice Tertunda"
          value={String(pendingInvoices.length)}
          sub={
            pendingInvoices.length > 0
              ? formatIDR(pendingInvoices.reduce((s, i) => s + i.amount, 0))
              : "Semua lunas"
          }
          icon={<ClockIcon className="h-4 w-4" />}
          color="amber"
        />
        <StatCard
          label="Total Dibayar"
          value={formatIDR(totalPaid)}
          sub={`${paidInvoices.length} invoice lunas`}
          icon={<CheckCircledIcon className="h-4 w-4" />}
          color="emerald"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Card */}
        <div className="lg:col-span-2 rounded-2xl border border-(--gray-4) bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-(--gray-12)">
              Langganan Aktif
            </h2>
            <Link
              to="/plans"
              className="text-xs text-(--blue-11) hover:text-(--blue-9) font-medium flex items-center gap-1"
            >
              Kelola Plan <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-(--gray-12)">
                    {subscription.plan_name}
                  </p>
                  <p className="text-xs text-(--gray-10) mt-0.5">
                    Siklus:{" "}
                    {subscription.billing_cycle === "monthly"
                      ? "Bulanan"
                      : subscription.billing_cycle === "yearly"
                        ? "Tahunan"
                        : "Gratis"}
                  </p>
                </div>
                <Badge
                  variant={
                    subscription.status === "active"
                      ? "success"
                      : subscription.status === "trial"
                        ? "warning"
                        : "error"
                  }
                >
                  {subscription.status === "active"
                    ? "Aktif"
                    : subscription.status === "trial"
                      ? "Uji Coba"
                      : subscription.status === "expired"
                        ? "Kedaluwarsa"
                        : "Dibatalkan"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-(--gray-3)">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-(--gray-9) font-medium mb-1">
                    Mulai
                  </p>
                  <p className="text-xs font-medium text-(--gray-12)">
                    {new Date(subscription.started_at).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-(--gray-9) font-medium mb-1">
                    Berakhir
                  </p>
                  <p className="text-xs font-medium text-(--gray-12)">
                    {subscription.expires_at
                      ? new Date(subscription.expires_at).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : '-'}
                  </p>
                </div>
                {subscription.trial_ends_at && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-(--gray-9) font-medium mb-1">
                      Trial Berakhir
                    </p>
                    <p className="text-xs font-medium text-amber-600">
                      {new Date(subscription.trial_ends_at).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <RocketIcon className="h-8 w-8 text-(--gray-7) mb-3" />
              <p className="text-sm font-medium text-(--gray-11) mb-1">
                Belum ada langganan
              </p>
              <p className="text-xs text-(--gray-9) mb-4">
                Pilih plan untuk mulai menggunakan fitur lengkap.
              </p>
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--blue-9) text-(--blue-contrast) text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Lihat Plan
              </Link>
            </div>
          )}
        </div>

        {/* Team Members Quick View */}
        <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-(--gray-12)">Tim Anda</h2>
            <Link
              to="/users"
              className="text-xs text-(--blue-11) hover:text-(--blue-9) font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-(--gray-3) flex items-center justify-center text-(--gray-11) text-xs font-bold">
                    {(member.custom_alias || member.entity_name)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-(--gray-12) truncate">
                      {member.custom_alias || member.entity_name}
                    </p>
                    <p className="text-[10px] text-(--gray-9)">{member.role ?? '-'}</p>
                  </div>
                  <Badge
                    variant={member.status === "ACTIVE" ? "success" : "warning"}
                    className="text-[9px]"
                  >
                    {member.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              ))}
              {members.length > 5 && (
                <p className="text-[10px] text-(--gray-9) text-center pt-2">
                  +{members.length - 5} anggota lainnya
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <PersonIcon className="h-6 w-6 text-(--gray-7) mb-2" />
              <p className="text-xs text-(--gray-9)">Belum ada anggota tim.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-(--gray-9)" />
            <h2 className="text-sm font-semibold text-(--gray-12)">
              Invoice Terbaru
            </h2>
          </div>
          <Link
            to="/billing"
            className="text-xs text-(--blue-11) hover:text-(--blue-9) font-medium flex items-center gap-1"
          >
            Lihat Semua <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-3)">
                  <th className="text-left pb-3 text-xs font-medium text-(--gray-9)">
                    No. Invoice
                  </th>
                  <th className="text-left pb-3 text-xs font-medium text-(--gray-9)">
                    Deskripsi
                  </th>
                  <th className="text-left pb-3 text-xs font-medium text-(--gray-9)">
                    Jumlah
                  </th>
                  <th className="text-left pb-3 text-xs font-medium text-(--gray-9)">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-(--gray-2) last:border-b-0"
                  >
                    <td className="py-3 font-mono text-xs text-(--gray-12)">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 text-xs text-(--gray-11)">
                      {invoice.description}
                    </td>
                    <td className="py-3 text-xs font-medium text-(--gray-12)">
                      {formatIDR(invoice.amount)}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "success"
                            : invoice.status === "pending"
                              ? "warning"
                              : "error"
                        }
                        className="text-[10px]"
                      >
                        {invoice.status === "paid"
                          ? "Lunas"
                          : invoice.status === "pending"
                            ? "Menunggu"
                            : invoice.status === "expired"
                              ? "Kedaluwarsa"
                              : "Gagal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileTextIcon className="h-6 w-6 text-(--gray-7) mb-2" />
            <p className="text-xs text-(--gray-9)">Belum ada invoice.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Stat Card Component ----
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  };

  return (
    <div className="rounded-2xl border border-(--gray-4) bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-(--gray-9)">{label}</p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border",
            colorMap[color],
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-(--gray-12) mb-0.5">{value}</p>
      <p className="text-[11px] text-(--gray-9)">{sub}</p>
    </div>
  );
}

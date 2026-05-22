import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  useInvoices,
  usePayInvoice,
  useSubscription,
  useInvoice,
  usePayments,
} from "@/hooks/use-subscription";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import { cn, formatIDR } from "@/lib/utils";
import {
  FileTextIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

export const billingRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/billing",
  component: BillingPage,
});

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "error" | "gray";
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Menunggu",
    variant: "warning",
    icon: <ClockIcon className="h-3 w-3" />,
  },
  paid: {
    label: "Lunas",
    variant: "success",
    icon: <CheckCircledIcon className="h-3 w-3" />,
  },
  failed: {
    label: "Gagal",
    variant: "error",
    icon: <CrossCircledIcon className="h-3 w-3" />,
  },
  expired: {
    label: "Kedaluwarsa",
    variant: "gray",
    icon: <ExclamationTriangleIcon className="h-3 w-3" />,
  },
  refunded: {
    label: "Dikembalikan",
    variant: "gray",
    icon: <ExclamationTriangleIcon className="h-3 w-3" />,
  },
};

function BillingPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: invoices, isLoading } = useInvoices(activeWorkspace?.entity_id);
  const { data: subscription } = useSubscription(activeWorkspace?.entity_id);
  const payMutation = usePayInvoice(activeWorkspace?.entity_id);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Tagihan & Pembayaran
        </h1>
        <p className="text-sm text-(--gray-10)">
          Kelola invoice dan riwayat pembayaran workspace Anda.
        </p>
      </div>

      {/* Subscription Summary Card */}
      {subscription && (
        <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-(--gray-9) uppercase tracking-wider mb-1">
                Langganan Aktif
              </p>
              <p className="text-lg font-bold text-(--gray-12)">
                {subscription.plan_name ?? '-'}
              </p>
              <p className="text-xs text-(--gray-10) mt-0.5">
                Siklus:{" "}
                {subscription.billing_cycle === "monthly"
                  ? "Bulanan"
                  : subscription.billing_cycle === "yearly"
                    ? "Tahunan"
                    : "-"}
                {" · "}Status:{" "}
                <span
                  className={cn(
                    "font-medium",
                    subscription.status === "active"
                      ? "text-emerald-600"
                      : subscription.status === "trial"
                        ? "text-amber-600"
                        : "text-red-600",
                  )}
                >
                  {subscription.status === "active"
                    ? "Aktif"
                    : subscription.status === "trial"
                      ? "Uji Coba"
                      : subscription.status === "expired"
                        ? "Kedaluwarsa"
                        : "Dibatalkan"}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-(--gray-9)">Berlaku hingga</p>
              <p className="text-sm font-semibold text-(--gray-12)">
                {subscription.expires_at
                  ? new Date(subscription.expires_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-(--gray-4)">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-(--gray-9)" />
            <h2 className="text-sm font-semibold text-(--gray-12)">
              Daftar Invoice
            </h2>
          </div>
        </div>

        {!invoices || invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileTextIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">
              Belum ada invoice
            </p>
            <p className="text-xs text-(--gray-9)">
              Invoice akan muncul setelah Anda berlangganan plan berbayar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    No. Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Jatuh Tempo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const status =
                    statusConfig[invoice.status] ?? statusConfig.pending;
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs">
                        <button
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                          className="text-(--blue-9) hover:underline font-semibold focus:outline-none cursor-pointer text-left"
                        >
                          {invoice.invoice_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-(--gray-11)">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 font-semibold text-(--gray-12)">
                        {formatIDR(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 text-(--gray-10)">
                        {new Date(invoice.due_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === "pending" && (
                          <Button
                            size="1"
                            variant="solid"
                            loading={payMutation.isPending}
                            onClick={() =>
                              payMutation.mutate({ invoice_id: invoice.id })
                            }
                          >
                            Bayar
                          </Button>
                        )}
                        {invoice.status === "paid" && invoice.paid_at && (
                          <span className="text-xs text-(--gray-9)">
                            {new Date(invoice.paid_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Attempts Section */}
      <PaymentAttemptsSection />

      {/* Invoice Detail Dialog */}
      {selectedInvoiceId && (
        <InvoiceDetailDialog
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
}

interface InvoiceDetailDialogProps {
  invoiceId: string;
  onClose: () => void;
}

function InvoiceDetailDialog({ invoiceId, onClose }: InvoiceDetailDialogProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: invoice, isLoading } = useInvoice(activeWorkspace?.entity_id, invoiceId);
  const payMutation = usePayInvoice(activeWorkspace?.entity_id);

  const status = invoice ? (statusConfig[invoice.status] ?? statusConfig.pending) : statusConfig.pending;

  return (
    <Dialog open={!!invoiceId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-(--gray-9)" />
            Detail Invoice
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap penagihan dan status pembayaran.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
          </div>
        ) : !invoice ? (
          <p className="text-sm text-(--gray-10) text-center py-6">
            Gagal memuat detail invoice.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-(--gray-3) pb-4">
              <div>
                <p className="text-xs text-(--gray-9)">Nomor Invoice</p>
                <p className="font-mono text-sm font-semibold text-(--gray-12)">
                  {invoice.invoice_number}
                </p>
              </div>
              <Badge variant={status.variant} className="gap-1 text-xs">
                {status.icon}
                {status.label}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-(--gray-9) mb-0.5">Tanggal Invoice</p>
                <p className="font-medium text-(--gray-12)">
                  {new Date(invoice.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--gray-9) mb-0.5">Jatuh Tempo</p>
                <p className="font-medium text-(--gray-12)">
                  {new Date(invoice.due_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {invoice.paid_at && (
                <div className="col-span-2">
                  <p className="text-xs text-(--gray-9) mb-0.5">Tanggal Pembayaran</p>
                  <p className="font-medium text-emerald-600">
                    {new Date(invoice.paid_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Billing Items summary */}
            <div className="rounded-xl border border-(--gray-3) bg-(--gray-1) p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-(--gray-12)">Deskripsi Layanan</p>
                  <p className="text-xs text-(--gray-10) mt-0.5">{invoice.description || "Pembayaran Langganan"}</p>
                </div>
                <p className="text-sm font-semibold text-(--gray-12)">
                  {formatIDR(invoice.amount)}
                </p>
              </div>
              <div className="border-t border-(--gray-3) pt-3 flex justify-between items-center">
                <p className="text-xs font-bold text-(--gray-12)">Total Tagihan</p>
                <p className="text-base font-bold text-(--gray-12)">
                  {formatIDR(invoice.amount)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {invoice.status === "pending" && (
              <Button
                variant="solid"
                className="w-full"
                loading={payMutation.isPending}
                onClick={() => payMutation.mutate({ invoice_id: invoice.id })}
              >
                Bayar Sekarang
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentAttemptsSection() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: payments, isLoading } = usePayments(activeWorkspace?.entity_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-(--gray-4)">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-(--gray-9)" />
          <h2 className="text-sm font-semibold text-(--gray-12)">
            Riwayat Percobaan Pembayaran
          </h2>
        </div>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClockIcon className="h-10 w-10 text-(--gray-7) mb-3" />
          <p className="text-sm font-medium text-(--gray-11) mb-1">
            Belum ada riwayat pembayaran
          </p>
          <p className="text-xs text-(--gray-9)">
            Riwayat pembayaran Anda akan tercatat di sini setelah Anda mencoba membayar invoice.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                  Waktu Percobaan
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                  Metode Pembayaran
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const status = statusConfig[payment.status] ?? statusConfig.pending;
                const isExpired = payment.expires_at ? new Date(payment.expires_at) < new Date() : false;
                const canRetry = payment.status === "pending" && payment.payment_url && !isExpired;

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                  >
                    <td className="px-6 py-4 text-(--gray-11) text-xs">
                      {new Date(payment.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-(--gray-12) font-medium text-xs">
                      {payment.payment_method || "Metode belum dipilih"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-(--gray-12)">
                      {formatIDR(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canRetry && (
                        <Button
                          size="1"
                          variant="outline"
                          onClick={() => {
                            window.location.href = payment.payment_url!;
                          }}
                        >
                          Lanjutkan Pembayaran
                        </Button>
                      )}
                      {payment.status === "pending" && isExpired && (
                        <span className="text-xs text-(--gray-9)">Kedaluwarsa</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


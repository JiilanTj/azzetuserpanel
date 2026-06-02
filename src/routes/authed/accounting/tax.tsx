import { useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useDocuments } from '@/hooks/use-documents'
import {
  useTaxProfile,
  useUpdateTaxProfile,
  useTaxCalculations,
  useTaxCalculation,
  useTaxCalculationDocuments,
  useLinkTaxDocument,
  usePPNSummary,
  usePPhSummary,
  useRequestTaxReport,
  useTaxReportJobs,
  useTaxReportJob,
} from '@/hooks/use-tax'
import {
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TaxStatus } from '@/lib/api/types/tax.types'

export const taxRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/tax',
  component: TaxPage,
})

const currentDate = new Date()
const DEFAULT_PERIOD = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

const TAX_STATUS_LABELS: Record<TaxStatus, string> = {
  NON_PKP: 'Non-PKP',
  PKP: 'PKP (Pengusaha Kena Pajak)',
  NOT_REGISTERED: 'Belum Terdaftar',
}

const TAX_TYPE_LABELS: Record<string, string> = {
  PPN_MASUKAN: 'PPN Masukan',
  PPN_KELUARAN: 'PPN Keluaran',
  PPH23: 'PPh 23',
  PPH21: 'PPh 21',
}

function formatIDR(val: string | number) {
  return Number(val).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
}

const TAX_DOC_REF_TYPES = [
  { value: 'FAKTUR_PAJAK', label: 'Faktur Pajak' },
  { value: 'BUKTI_POTONG', label: 'Bukti Potong' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'OTHER', label: 'Lainnya' },
] as const

function TaxPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const [tab, setTab] = useState('summary')
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [selectedCalcId, setSelectedCalcId] = useState<string | null>(null)
  const [selectedReportJobId, setSelectedReportJobId] = useState<string | null>(null)

  const { data: profile, isLoading: profileLoading } = useTaxProfile()
  const updateProfile = useUpdateTaxProfile()
  const { data: ppnSummary, isLoading: ppnLoading } = usePPNSummary(period)
  const { data: pphSummary, isLoading: pphLoading } = usePPhSummary(period, period)
  const { data: calculations, isLoading: calcLoading } = useTaxCalculations(period)
  const requestReport = useRequestTaxReport()
  const { data: reportJobs } = useTaxReportJobs()
  const { data: selectedReportJob } = useTaxReportJob(selectedReportJobId ?? undefined)

  const [form, setForm] = useState<{
    npwp: string
    tax_status: TaxStatus
    is_ppn_liable: boolean
    pph23_enabled: boolean
    pkp_number: string
    tax_office_code: string
    notes: string
  } | null>(null)

  const profileForm = form ?? (profile ? {
    npwp: profile.npwp ?? '',
    tax_status: profile.tax_status,
    is_ppn_liable: profile.is_ppn_liable,
    pph23_enabled: profile.pph23_enabled,
    pkp_number: profile.pkp_number ?? '',
    tax_office_code: profile.tax_office_code ?? '',
    notes: profile.notes ?? '',
  } : null)

  const handleSaveProfile = () => {
    if (!profileForm) return
    updateProfile.mutate({
      npwp: profileForm.npwp,
      tax_status: profileForm.tax_status,
      is_ppn_liable: profileForm.is_ppn_liable,
      pph23_enabled: profileForm.pph23_enabled,
      pkp_number: profileForm.pkp_number,
      tax_office_code: profileForm.tax_office_code,
      notes: profileForm.notes,
    }, { onSuccess: () => setForm(null) })
  }

  const handleRequestReport = () => {
    requestReport.mutate({
      report_type: 'TAX_OVERVIEW',
      period_from: period,
      period_to: period,
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-(--gray-12) tracking-tight">Pajak</h1>
        <p className="text-sm text-(--gray-10) mt-1">
          Profil PKP/NPWP, ringkasan PPN, dan perhitungan pajak otomatis dari transaksi.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="tax-period" className="text-sm text-(--gray-10) shrink-0">Periode</Label>
        <Input
          id="tax-period"
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-44"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="summary">Ringkasan PPN</TabsTrigger>
          <TabsTrigger value="pph">Ringkasan PPh</TabsTrigger>
          <TabsTrigger value="calculations">Perhitungan</TabsTrigger>
          <TabsTrigger value="profile">Profil Pajak</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ppnLoading ? (
            <div className="col-span-3 py-16 text-center text-(--gray-10)">Memuat ringkasan...</div>
          ) : ppnSummary ? (
            <>
              <SummaryCard label="PPN Masukan" value={formatIDR(ppnSummary.ppn_masukan)} sub={`DPP ${formatIDR(ppnSummary.dpp_masukan)}`} />
              <SummaryCard label="PPN Keluaran" value={formatIDR(ppnSummary.ppn_keluaran)} sub={`DPP ${formatIDR(ppnSummary.dpp_keluaran)}`} />
              <SummaryCard
                label="Net PPN (Kurang/Lebih Bayar)"
                value={formatIDR(ppnSummary.net_ppn)}
                sub={`${ppnSummary.transaction_count} transaksi`}
                highlight
              />
            </>
          ) : (
            <div className="col-span-3 py-16 text-center text-(--gray-10)">Belum ada perhitungan pajak untuk periode ini.</div>
          )}
        </div>
      )}

      {tab === 'pph' && (
        <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
          {pphLoading ? (
            <div className="py-16 text-center text-(--gray-10)">Memuat ringkasan PPh...</div>
          ) : !pphSummary || pphSummary.rows.length === 0 ? (
            <div className="py-16 text-center text-(--gray-10)">Belum ada perhitungan PPh untuk periode ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--gray-4) bg-(--gray-2) text-left text-xs text-(--gray-9)">
                    <th className="px-4 py-3 font-medium">Jenis Pajak</th>
                    <th className="px-4 py-3 font-medium">Arah</th>
                    <th className="px-4 py-3 font-medium text-right">DPP</th>
                    <th className="px-4 py-3 font-medium text-right">PPh</th>
                    <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--gray-3)">
                  {pphSummary.rows.map((row, idx) => (
                    <tr key={`${row.tax_type}-${row.direction}-${idx}`} className="hover:bg-(--gray-1)">
                      <td className="px-4 py-3">
                        <Badge variant="soft">{TAX_TYPE_LABELS[row.tax_type] ?? row.tax_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-(--gray-11) capitalize">{row.direction.toLowerCase()}</td>
                      <td className="px-4 py-3 text-right font-mono text-(--gray-11)">{formatIDR(row.total_base)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-(--gray-12)">{formatIDR(row.total_tax)}</td>
                      <td className="px-4 py-3 text-right text-(--gray-9)">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'calculations' && (
        <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
          {calcLoading ? (
            <div className="py-16 text-center text-(--gray-10)">Memuat perhitungan...</div>
          ) : !calculations || calculations.length === 0 ? (
            <div className="py-16 text-center text-(--gray-10)">Belum ada perhitungan pajak.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--gray-4) bg-(--gray-2) text-left text-xs text-(--gray-9)">
                    <th className="px-4 py-3 font-medium">Transaksi</th>
                    <th className="px-4 py-3 font-medium">Jenis</th>
                    <th className="px-4 py-3 font-medium text-right">DPP</th>
                    <th className="px-4 py-3 font-medium text-right">Pajak</th>
                    <th className="px-4 py-3 font-medium">Periode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--gray-3)">
                  {calculations.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-(--gray-1) cursor-pointer"
                      onClick={() => setSelectedCalcId(c.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-(--gray-12)">{c.transaction_number}</p>
                        <p className="text-xs text-(--gray-9) truncate max-w-[200px]">{c.transaction_description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="soft">{TAX_TYPE_LABELS[c.tax_type] ?? c.tax_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-(--gray-11)">{formatIDR(c.base_amount)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-(--gray-12)">{formatIDR(c.tax_amount)}</td>
                      <td className="px-4 py-3 text-(--gray-9)">{c.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 max-w-xl space-y-5">
          {profileLoading || !profileForm ? (
            <div className="py-8 text-center text-(--gray-10)">Memuat profil...</div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  id="npwp"
                  value={profileForm.npwp}
                  onChange={(e) => setForm({ ...profileForm, npwp: e.target.value })}
                  placeholder="01.234.567.8-901.000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax-status">Status Pajak</Label>
                <select
                  id="tax-status"
                  value={profileForm.tax_status}
                  onChange={(e) => setForm({ ...profileForm, tax_status: e.target.value as TaxStatus, is_ppn_liable: e.target.value === 'PKP' })}
                  className="w-full h-10 rounded-lg border border-(--gray-6) bg-surface px-3 text-sm"
                >
                  {(Object.keys(TAX_STATUS_LABELS) as TaxStatus[]).map((s) => (
                    <option key={s} value={s}>{TAX_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--gray-12)">Wajib PPN (PKP)</p>
                  <p className="text-xs text-(--gray-9)">Aktifkan perhitungan PPN otomatis</p>
                </div>
                <Switch
                  checked={profileForm.is_ppn_liable}
                  onCheckedChange={(v) => setForm({ ...profileForm, is_ppn_liable: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--gray-12)">PPh 23 (Jasa)</p>
                  <p className="text-xs text-(--gray-9)">Potong PPh 23 pada transaksi jasa</p>
                </div>
                <Switch
                  checked={profileForm.pph23_enabled}
                  onCheckedChange={(v) => setForm({ ...profileForm, pph23_enabled: v })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkp-number">Nomor PKP (NPPKP)</Label>
                <Input
                  id="pkp-number"
                  value={profileForm.pkp_number}
                  onChange={(e) => setForm({ ...profileForm, pkp_number: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kpp">Kode KPP</Label>
                <Input
                  id="kpp"
                  value={profileForm.tax_office_code}
                  onChange={(e) => setForm({ ...profileForm, tax_office_code: e.target.value })}
                  placeholder="061"
                />
              </div>
              <Button variant="solid" loading={updateProfile.isPending} onClick={handleSaveProfile}>
                Simpan Profil
              </Button>
            </>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="soft" loading={requestReport.isPending} onClick={handleRequestReport}>
              Generate Laporan Pajak
            </Button>
            <span className="text-xs text-(--gray-9)">Periode {period} — diproses async</span>
          </div>
          <div className="rounded-2xl border border-(--gray-4) bg-surface divide-y divide-(--gray-3)">
            {!reportJobs || reportJobs.length === 0 ? (
              <div className="py-12 text-center text-(--gray-10) text-sm">Belum ada laporan.</div>
            ) : (
              reportJobs.map((job) => (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedReportJobId(job.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedReportJobId(job.id)}
                  className={cn(
                    'px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-(--gray-1)',
                    selectedReportJobId === job.id && 'bg-(--blue-2)',
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-(--gray-12)">{job.report_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-(--gray-9)">{job.period_from} — {job.period_to}</p>
                  </div>
                  <Badge variant={job.status === 'COMPLETED' ? 'success' : job.status === 'FAILED' ? 'error' : 'warning'}>
                    {job.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
          {selectedReportJob && (
            <div className="rounded-xl border border-(--gray-4) bg-(--gray-2) p-4 text-sm space-y-2">
              <p className="font-medium text-(--gray-12)">Detail job laporan</p>
              <p className="text-xs text-(--gray-10)">
                Status: <Badge variant={selectedReportJob.status === 'COMPLETED' ? 'success' : selectedReportJob.status === 'FAILED' ? 'error' : 'warning'}>
                  {selectedReportJob.status}
                </Badge>
              </p>
              {selectedReportJob.error_message && (
                <p className="text-xs text-(--red-11)">{selectedReportJob.error_message}</p>
              )}
              {selectedReportJob.result != null && (
                <pre className="text-xs text-(--gray-11) whitespace-pre-wrap break-words max-h-48 overflow-y-auto rounded-lg bg-surface p-3 border border-(--gray-4)">
                  {JSON.stringify(selectedReportJob.result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      <TaxCalculationDetailDialog
        calculationId={selectedCalcId}
        workspaceId={activeWorkspace?.entity_id}
        onClose={() => setSelectedCalcId(null)}
        taxTypeLabels={TAX_TYPE_LABELS}
        formatIDR={formatIDR}
      />
    </div>
  )
}

function TaxCalculationDetailDialog({
  calculationId,
  workspaceId,
  onClose,
  taxTypeLabels,
  formatIDR,
}: {
  calculationId: string | null
  workspaceId?: string
  onClose: () => void
  taxTypeLabels: Record<string, string>
  formatIDR: (val: string | number) => string
}) {
  const { data: calc, isLoading: calcLoading } = useTaxCalculation(calculationId ?? undefined)
  const { data: docRefs, isLoading: docsLoading } = useTaxCalculationDocuments(calculationId ?? undefined)
  const { data: documentsData } = useDocuments(workspaceId)
  const linkDoc = useLinkTaxDocument(calculationId ?? undefined)
  const [documentId, setDocumentId] = useState('')
  const [refType, setRefType] = useState<string>('FAKTUR_PAJAK')

  const availableDocs = documentsData?.documents?.filter(
    d => d.extraction_status === 'COMPLETED' && !docRefs?.some(r => r.document_id === d.id),
  ) ?? []

  const handleLink = () => {
    if (!documentId) return
    linkDoc.mutate(
      { document_id: documentId, ref_type: refType },
      { onSuccess: () => setDocumentId('') },
    )
  }

  return (
    <Dialog open={!!calculationId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Perhitungan Pajak</DialogTitle>
          <DialogDescription>
            {calc ? `${taxTypeLabels[calc.tax_type] ?? calc.tax_type} — ${calc.transaction_number ?? calc.transaction_id}` : 'Memuat...'}
          </DialogDescription>
        </DialogHeader>
        {calcLoading || !calc ? (
          <div className="py-8 text-center text-(--gray-10) text-sm">Memuat detail...</div>
        ) : (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <dt className="text-(--gray-9)">DPP</dt>
              <dd className="font-mono text-(--gray-12)">{formatIDR(calc.base_amount)}</dd>
              <dt className="text-(--gray-9)">Pajak ({calc.tax_rate * 100}%)</dt>
              <dd className="font-mono font-medium text-(--gray-12)">{formatIDR(calc.tax_amount)}</dd>
              <dt className="text-(--gray-9)">Periode</dt>
              <dd>{calc.period}</dd>
              <dt className="text-(--gray-9)">Status</dt>
              <dd>{calc.status}</dd>
              {calc.faktur_number && (
                <>
                  <dt className="text-(--gray-9)">No. Faktur</dt>
                  <dd>{calc.faktur_number}</dd>
                </>
              )}
            </dl>
            {calc.transaction_id && (
              <Link
                to="/accounting/transactions/$id"
                params={{ id: calc.transaction_id }}
                className="text-xs text-(--blue-11) hover:underline font-medium"
              >
                Lihat transaksi
              </Link>
            )}

            <div className="border-t border-(--gray-4) pt-4 space-y-3">
              <p className="text-xs font-semibold text-(--gray-11) uppercase tracking-wide">Dokumen tertaut</p>
              {docsLoading ? (
                <p className="text-xs text-(--gray-9)">Memuat dokumen...</p>
              ) : !docRefs || docRefs.length === 0 ? (
                <p className="text-xs text-(--gray-9)">Belum ada dokumen tertaut.</p>
              ) : (
                <ul className="space-y-1">
                  {docRefs.map((ref) => (
                    <li key={ref.id} className="text-xs text-(--gray-11) flex justify-between gap-2">
                      <span>{ref.file_name} ({ref.ref_type})</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <p className="text-xs text-(--gray-10)">Tautkan dokumen workspace</p>
                <Select value={documentId} onValueChange={setDocumentId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDocs.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.file_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={refType} onValueChange={setRefType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_DOC_REF_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="soft"
                  size="2"
                  loading={linkDoc.isPending}
                  disabled={!documentId}
                  onClick={handleLink}
                >
                  Tautkan Dokumen
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SummaryCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn(
      'rounded-2xl border p-5',
      highlight ? 'border-(--blue-6) bg-(--blue-2)' : 'border-(--gray-4) bg-surface',
    )}>
      <p className="text-xs text-(--gray-9) font-medium uppercase tracking-wide">{label}</p>
      <p className={cn('text-xl font-bold mt-1', highlight ? 'text-(--blue-11)' : 'text-(--gray-12)')}>{value}</p>
      {sub && <p className="text-xs text-(--gray-9) mt-1">{sub}</p>}
    </div>
  )
}

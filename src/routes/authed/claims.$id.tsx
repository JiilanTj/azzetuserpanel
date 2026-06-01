import { useState, useRef } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authedLayout } from './_authed'
import {
  useClaim,
  useSubmitClaim,
  useDisputeClaim,
  useUploadClaimDocument,
} from '@/hooks/use-claims'
import { disputeClaimSchema, type DisputeClaimForm } from '@/lib/validations'
import {
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Textarea,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  CLAIM_STATUS_LABELS,
  CLAIM_DOC_LABELS,
  CLAIM_DOC_TYPES,
  claimStatusVariant,
} from '@/lib/constants/identity'
import type { ClaimDocumentType, ClaimStatus } from '@/lib/api/types/claim.types'
import {
  ArrowLeftIcon,
  UploadIcon,
  PaperPlaneIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons'

export const claimDetailRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/claims/$claimId',
  component: ClaimDetailPage,
})

function ClaimDetailPage() {
  const { claimId } = claimDetailRoute.useParams()
  const { data: claim, isLoading } = useClaim(claimId)
  const submitMutation = useSubmitClaim(claimId)
  const uploadMutation = useUploadClaimDocument(claimId)
  const [isDisputeOpen, setIsDisputeOpen] = useState(false)
  const [docType, setDocType] = useState<ClaimDocumentType>('NPWP')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))

  const canEdit = claim?.status === 'DRAFT' || claim?.status === 'REJECTED'
  const canSubmit = canEdit && (claim?.documents?.length ?? 0) > 0
  const canDispute = claim?.status === 'REJECTED'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMutation.mutateAsync({
      file,
      meta: {
        document_type: docType,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
      },
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!confirm('Ajukan klaim ini untuk review? Pastikan semua dokumen sudah benar.')) return
    submitMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-24">
        <p className="text-sm text-(--gray-10)">Klaim tidak ditemukan.</p>
        <Link to="/claims" className="text-sm text-(--blue-11) hover:underline mt-2 inline-block">
          Kembali ke daftar klaim
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link
        to="/claims"
        className="inline-flex items-center gap-1.5 text-sm text-(--gray-10) hover:text-(--gray-12) transition-colors"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Kembali
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-(--gray-12)">{claim.entity_name}</h1>
            <p className="text-sm text-(--gray-9) mt-1">
              {claim.entity_type === 'BADAN_USAHA' ? 'Badan Usaha' : 'Orang Pribadi'}
              {' · Dibuat '}
              {formatDate(claim.created_at)}
            </p>
          </div>
          <Badge variant={claimStatusVariant(claim.status)}>
            {CLAIM_STATUS_LABELS[claim.status]}
          </Badge>
        </div>

        {claim.notes && (
          <div className="rounded-lg bg-(--gray-2) px-4 py-3">
            <p className="text-xs text-(--gray-9) mb-0.5">Catatan</p>
            <p className="text-sm text-(--gray-12)">{claim.notes}</p>
          </div>
        )}

        {claim.rejection_reason && (
          <div className="rounded-lg bg-(--red-2) border border-(--red-6) px-4 py-3">
            <p className="text-xs text-(--red-11) font-medium mb-0.5">Alasan Penolakan</p>
            <p className="text-sm text-(--red-12)">{claim.rejection_reason}</p>
          </div>
        )}

        {claim.dispute_reason && (
          <div className="rounded-lg bg-(--amber-2) border border-(--amber-6) px-4 py-3">
            <p className="text-xs text-(--amber-11) font-medium mb-0.5">Alasan Dispute</p>
            <p className="text-sm text-(--amber-12)">{claim.dispute_reason}</p>
          </div>
        )}

        <StatusTimeline status={claim.status} />
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-(--gray-12)">Dokumen Pendukung</h2>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Select value={docType} onValueChange={(v) => setDocType(v as ClaimDocumentType)}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CLAIM_DOC_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="1"
                className="gap-1.5"
                loading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Unggah
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
              />
            </div>
          )}
        </div>

        {!claim.documents || claim.documents.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FileTextIcon className="h-8 w-8 text-(--gray-7) mb-2" />
            <p className="text-sm text-(--gray-9)">
              {canEdit
                ? 'Belum ada dokumen. Unggah minimal 1 dokumen sebelum mengajukan klaim.'
                : 'Tidak ada dokumen.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {claim.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-(--gray-3) bg-(--gray-1)"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-(--gray-12) truncate">
                    {CLAIM_DOC_LABELS[doc.document_type]} — {doc.file_name}
                  </p>
                  <p className="text-xs text-(--gray-9)">
                    {(doc.file_size / 1024).toFixed(0)} KB · {doc.upload_status}
                  </p>
                </div>
                {doc.view_url && (
                  <a
                    href={doc.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-(--blue-11) hover:text-(--blue-12) transition-colors"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {(canSubmit || canDispute) && (
        <div className="flex gap-3">
          {canSubmit && (
            <Button
              variant="solid"
              className="gap-2"
              loading={submitMutation.isPending}
              onClick={handleSubmit}
            >
              <PaperPlaneIcon className="h-4 w-4" />
              {claim.status === 'REJECTED' ? 'Ajukan Ulang' : 'Ajukan Klaim'}
            </Button>
          )}
          {canDispute && (
            <Button
              variant="outline"
              className="gap-2 text-(--amber-11) border-(--amber-6)"
              onClick={() => setIsDisputeOpen(true)}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              Ajukan Dispute
            </Button>
          )}
        </div>
      )}

      {/* Audit log */}
      {claim.audit_log && claim.audit_log.length > 0 && (
        <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
          <h2 className="text-sm font-semibold text-(--gray-12) mb-4">Riwayat Aktivitas</h2>
          <div className="space-y-3">
            {claim.audit_log.map((entry) => (
              <div key={entry.id} className="flex gap-3 text-xs">
                <span className="text-(--gray-9) shrink-0 w-36">
                  {formatDate(entry.created_at)}
                </span>
                <span className="text-(--gray-12)">
                  {entry.action}
                  {entry.new_status && (
                    <span className="text-(--gray-9)">
                      {' → '}
                      {CLAIM_STATUS_LABELS[entry.new_status as ClaimStatus] ?? entry.new_status}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DisputeDialog
        open={isDisputeOpen}
        onOpenChange={setIsDisputeOpen}
        claimId={claimId}
      />
    </div>
  )
}

function StatusTimeline({ status }: { status: ClaimStatus }) {
  const steps: { key: ClaimStatus; label: string }[] = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'SUBMITTED', label: 'Diajukan' },
    { key: 'UNDER_REVIEW', label: 'Review' },
    { key: 'APPROVED', label: 'Disetujui' },
  ]

  const order: ClaimStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISPUTED']
  const currentIdx = order.indexOf(status)

  if (status === 'REJECTED' || status === 'DISPUTED') {
    return (
      <div className="flex items-center gap-2 text-xs text-(--gray-9)">
        <ExclamationTriangleIcon className="h-3.5 w-3.5 text-(--amber-9)" />
        {status === 'REJECTED'
          ? 'Klaim ditolak. Anda dapat mengajukan ulang atau dispute.'
          : 'Dispute diajukan. Menunggu review ulang dari admin.'}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const stepIdx = order.indexOf(step.key)
        const done = currentIdx >= stepIdx
        const active = status === step.key || (status === 'UNDER_REVIEW' && step.key === 'SUBMITTED')
        return (
          <div key={step.key} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                done ? 'bg-(--blue-9)' : 'bg-(--gray-4)',
                active && 'ring-2 ring-(--blue-6) ring-offset-1',
              )}
            />
            {i < steps.length - 1 && null}
          </div>
        )
      })}
    </div>
  )
}

function DisputeDialog({
  open,
  onOpenChange,
  claimId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  claimId: string
}) {
  const disputeMutation = useDisputeClaim(claimId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisputeClaimForm>({
    resolver: zodResolver(disputeClaimSchema),
    defaultValues: { reason: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    await disputeMutation.mutateAsync(data)
    reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajukan Dispute</DialogTitle>
          <DialogDescription>
            Jelaskan mengapa keputusan penolakan perlu direview ulang. Dispute hanya dapat diajukan untuk klaim yang ditolak.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Textarea
            label="Alasan Dispute"
            placeholder="Jelaskan alasan Anda..."
            error={!!errors.reason}
            errorMessage={errors.reason?.message}
            rows={4}
            {...register('reason')}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" variant="solid" loading={disputeMutation.isPending}>
              Kirim Dispute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

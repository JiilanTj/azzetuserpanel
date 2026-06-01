import { useRef, useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useDocuments, useUploadDocument } from '@/hooks/use-documents'
import {
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { DocumentType, DocumentExtractionStatus } from '@/lib/api/types/document.types'
import {
  UploadIcon,
  FileTextIcon,
  CameraIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'

export const documentsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/documents',
  component: DocumentsPage,
})

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  RECEIPT: 'Struk / Receipt',
  INVOICE: 'Invoice',
  FAKTUR: 'Faktur Pajak',
  OTHER: 'Lainnya',
}

const EXTRACTION_LABELS: Record<DocumentExtractionStatus, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Memproses OCR...',
  COMPLETED: 'Selesai',
  FAILED: 'Gagal',
  SKIPPED: 'Dilewati',
}

function extractionVariant(status: DocumentExtractionStatus): 'gray' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'PENDING':
    case 'PROCESSING': return 'warning'
    case 'COMPLETED': return 'success'
    case 'FAILED': return 'error'
    default: return 'gray'
  }
}

function DocumentsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data, isLoading } = useDocuments(activeWorkspace?.entity_id)
  const uploadMutation = useUploadDocument(activeWorkspace?.entity_id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docType, setDocType] = useState<DocumentType>('RECEIPT')

  const documents = data?.documents ?? []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMutation.mutateAsync({ file, documentType: docType })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Dokumen &amp; OCR
          </h1>
          <p className="text-sm text-(--gray-10)">
            Unggah foto struk atau invoice — sistem akan mengekstrak data dan membuat transaksi otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DOC_TYPE_LABELS) as DocumentType[]).map((t) => (
                <SelectItem key={t} value={t}>{DOC_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="solid"
            className="gap-2"
            loading={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="w-4 h-4" />
            Unggah Dokumen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Upload hint */}
      <div className="rounded-xl border border-(--blue-6) bg-(--blue-2) px-4 py-3 flex items-start gap-3">
        <CameraIcon className="h-5 w-5 text-(--blue-11) shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-(--blue-12)">Tips OCR</p>
          <p className="text-xs text-(--blue-11) mt-0.5">
            Gunakan foto JPEG/PNG yang jelas. Fitur OCR memerlukan plan berbayar. Setelah upload, transaksi draft akan dibuat otomatis dari data yang diekstrak.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <FileTextIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">Belum ada dokumen</p>
            <p className="text-xs text-(--gray-9) mb-4 max-w-sm">
              Unggah foto struk belanja atau invoice untuk memulai OCR otomatis.
            </p>
            <Button variant="solid" size="2" onClick={() => fileInputRef.current?.click()}>
              Unggah Dokumen Pertama
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-(--gray-4)">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-(--gray-2) transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-xl shrink-0',
                    doc.extraction_status === 'COMPLETED' ? 'bg-(--green-3) text-(--green-11)' :
                    doc.extraction_status === 'FAILED' ? 'bg-(--red-3) text-(--red-11)' :
                    'bg-(--amber-3) text-(--amber-11)',
                  )}>
                    {doc.extraction_status === 'COMPLETED' ? (
                      <CheckCircledIcon className="h-5 w-5" />
                    ) : doc.extraction_status === 'FAILED' ? (
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    ) : (
                      <FileTextIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-(--gray-12) truncate">
                      {DOC_TYPE_LABELS[doc.document_type]} — {doc.file_name}
                    </p>
                    <p className="text-xs text-(--gray-9) mt-0.5">
                      {formatDate(doc.created_at)}
                      {doc.extracted_data?.vendor_name != null && (
                        <> · {String(doc.extracted_data.vendor_name)}</>
                      )}
                      {doc.extracted_data?.amount != null && (
                        <> · Rp {Number(doc.extracted_data.amount).toLocaleString('id-ID')}</>
                      )}
                    </p>
                    {doc.extraction_error && (
                      <p className="text-xs text-(--red-11) mt-0.5 truncate">{doc.extraction_error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={extractionVariant(doc.extraction_status)}>
                    {EXTRACTION_LABELS[doc.extraction_status]}
                  </Badge>
                  {doc.transaction_id && (
                    <Link
                      to="/accounting/transactions/$id"
                      params={{ id: doc.transaction_id }}
                      className="inline-flex items-center gap-1 text-xs text-(--blue-11) hover:text-(--blue-12) font-medium"
                    >
                      Lihat Transaksi
                      <ChevronRightIcon className="h-3 w-3" />
                    </Link>
                  )}
                  {doc.view_url && (
                    <a
                      href={doc.view_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-(--gray-10) hover:text-(--gray-12)"
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

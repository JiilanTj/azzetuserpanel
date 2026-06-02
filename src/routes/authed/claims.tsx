import { useState } from 'react'
import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { authedLayout } from './_authed'
import { useMyClaims, useCreateClaim } from '@/hooks/use-claims'
import { useFuzzySearch } from '@/hooks/use-identity'
import { useWorkspaceStore } from '@/stores/workspace.store'
import {
  Button,
  Badge,
  Input,
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
  claimStatusVariant,
} from '@/lib/constants/identity'
import type { FuzzyMatchResponse } from '@/lib/api/types/identity.types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircledIcon,
  ChevronRightIcon,
  FileTextIcon,
} from '@radix-ui/react-icons'

export const claimsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/claims',
  component: ClaimsPage,
})

function ClaimsPage() {
  const { data: claims, isLoading } = useMyClaims()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Klaim Entitas
          </h1>
          <p className="text-sm text-(--gray-10)">
            Klaim kepemilikan entitas bisnis yang terdaftar di Azzet dan unggah dokumen verifikasi.
          </p>
        </div>
        <Button variant="solid" className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="w-4 h-4" />
          Klaim Entitas Baru
        </Button>
      </div>

      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
          </div>
        ) : !claims || claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <CheckCircledIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">
              Belum ada klaim entitas
            </p>
            <p className="text-xs text-(--gray-9) mb-4 max-w-sm">
              Cari entitas bisnis yang sudah ada di Azzet (shadow entity) dan ajukan klaim kepemilikan dengan dokumen pendukung.
            </p>
            <Button variant="solid" size="2" onClick={() => setIsCreateOpen(true)}>
              Mulai Klaim Entitas
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-(--gray-4)">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                to="/claims/$claimId"
                params={{ claimId: claim.id }}
                className="flex items-center justify-between px-5 py-4 hover:bg-(--gray-2) transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-(--blue-3) text-(--blue-11) shrink-0">
                    <FileTextIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-(--gray-12) truncate">
                      {claim.entity_name}
                    </p>
                    <p className="text-xs text-(--gray-9) mt-0.5">
                      {claim.entity_type === 'BADAN_USAHA' ? 'Badan Usaha' : 'Orang Pribadi'}
                      {' · '}
                      {claim.document_count} dokumen
                      {' · '}
                      {formatDate(claim.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={claimStatusVariant(claim.status)}>
                    {CLAIM_STATUS_LABELS[claim.status]}
                  </Badge>
                  <ChevronRightIcon className="h-4 w-4 text-(--gray-8) group-hover:text-(--gray-11) transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateClaimDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

function CreateClaimDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const navigate = useNavigate()
  const createMutation = useCreateClaim()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FuzzyMatchResponse | null>(null)
  const [notes, setNotes] = useState('')

  const workspaceEntityId = useWorkspaceStore(s => s.activeWorkspace?.entity_id)
  const { data: matches, isFetching } = useFuzzySearch(workspaceEntityId, query, open)

  const handleClose = () => {
    setQuery('')
    setSelected(null)
    setNotes('')
    onOpenChange(false)
  }

  const handleCreate = async () => {
    if (!selected) return
    const claim = await createMutation.mutateAsync({
      entity_id: selected.id,
      notes: notes.trim() || undefined,
    })
    handleClose()
    navigate({ to: '/claims/$claimId', params: { claimId: claim.id } })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Klaim Entitas Baru</DialogTitle>
          <DialogDescription>
            Cari entitas bisnis yang ingin Anda klaim. Entitas shadow (belum memiliki pemilik) dapat diklaim dengan dokumen pendukung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--gray-9)" />
            <Input
              placeholder="Ketik nama entitas (min. 3 karakter)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(null)
              }}
              className="pl-9"
            />
          </div>

          {query.length >= 3 && (
            <div className="rounded-xl border border-(--gray-4) max-h-48 overflow-y-auto">
              {isFetching ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-(--blue-9) border-t-transparent" />
                </div>
              ) : !matches || matches.length === 0 ? (
                <p className="text-xs text-(--gray-9) text-center py-6">
                  Tidak ditemukan entitas yang cocok
                </p>
              ) : (
                matches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelected(m)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-(--gray-3) last:border-0',
                      selected?.id === m.id
                        ? 'bg-(--blue-3)'
                        : 'hover:bg-(--gray-2)',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-(--gray-12)">{m.nama_utama}</p>
                      <p className="text-xs text-(--gray-9)">
                        {m.entity_type === 'BADAN_USAHA' ? 'Badan Usaha' : 'Orang Pribadi'}
                        {m.is_shadow && ' · Shadow'}
                        {' · '}
                        {Math.round(m.match_score * 100)}% cocok
                      </p>
                    </div>
                    {selected?.id === m.id && (
                      <CheckCircledIcon className="h-4 w-4 text-(--blue-9) shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {selected && (
            <Textarea
              label="Catatan (opsional)"
              placeholder="Informasi tambahan untuk reviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleClose}>
              Batal
            </Button>
            <Button
              variant="solid"
              disabled={!selected}
              loading={createMutation.isPending}
              onClick={handleCreate}
            >
              Buat Klaim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

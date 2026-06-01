import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  legalIDSchema,
  aliasSchema,
  type LegalIDForm,
  type AliasForm,
} from '@/lib/validations'
import {
  useVerification,
  useLegalIDs,
  useAddLegalID,
  useDeleteLegalID,
  useAliases,
  useAddAlias,
  useDeleteAlias,
  useFindDuplicates,
} from '@/hooks/use-identity'
import {
  Button,
  Badge,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import {
  VERIFICATION_STATUS_LABELS,
  LEGAL_ID_LABELS,
  verificationStatusVariant,
} from '@/lib/constants/identity'
import type { LegalIDType } from '@/lib/api/types/identity.types'
import {
  IdCardIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'

interface EntityIdentitySectionProps {
  entityId: string
}

export function EntityIdentitySection({ entityId }: EntityIdentitySectionProps) {
  const { data: verification, isLoading: verLoading } = useVerification(entityId)
  const { data: legalIDs, isLoading: idsLoading } = useLegalIDs(entityId)
  const { data: aliases, isLoading: aliasLoading } = useAliases(entityId)
  const { data: duplicates } = useFindDuplicates(entityId)

  const addLegalID = useAddLegalID(entityId)
  const deleteLegalID = useDeleteLegalID(entityId)
  const addAlias = useAddAlias(entityId)
  const deleteAlias = useDeleteAlias(entityId)

  const [showLegalForm, setShowLegalForm] = useState(false)
  const [showAliasForm, setShowAliasForm] = useState(false)

  const legalForm = useForm<LegalIDForm>({
    resolver: zodResolver(legalIDSchema),
    defaultValues: { id_type: 'NPWP', id_value: '' },
  })

  const aliasForm = useForm<AliasForm>({
    resolver: zodResolver(aliasSchema),
    defaultValues: { alias: '' },
  })

  const onAddLegalID = legalForm.handleSubmit(async (data) => {
    await addLegalID.mutateAsync(data)
    legalForm.reset({ id_type: data.id_type, id_value: '' })
    setShowLegalForm(false)
  })

  const onAddAlias = aliasForm.handleSubmit(async (data) => {
    await addAlias.mutateAsync({ alias: data.alias, source: 'MANUAL' })
    aliasForm.reset()
    setShowAliasForm(false)
  })

  const isLoading = verLoading || idsLoading || aliasLoading

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    )
  }

  const usedTypes = new Set(legalIDs?.map((l) => l.id_type) ?? [])
  const availableTypes = (Object.keys(LEGAL_ID_LABELS) as LegalIDType[]).filter(
    (t) => !usedTypes.has(t),
  )

  return (
    <div className="rounded-2xl border border-(--gray-4) bg-surface p-6 space-y-6">
      <div className="flex items-center gap-3">
        <IdCardIcon className="h-4 w-4 text-(--gray-9)" />
        <h2 className="text-sm font-semibold text-(--gray-12)">
          Identitas Legal &amp; Verifikasi
        </h2>
      </div>

      {/* Verification status */}
      {verification && (
        <div className="flex items-center justify-between rounded-xl bg-(--gray-2) px-4 py-3">
          <div>
            <p className="text-xs text-(--gray-9)">Status Verifikasi Entitas</p>
            <p className="text-sm font-medium text-(--gray-12) mt-0.5">
              {VERIFICATION_STATUS_LABELS[verification.status]}
            </p>
            {verification.rejection_reason && (
              <p className="text-xs text-(--red-11) mt-1">{verification.rejection_reason}</p>
            )}
          </div>
          <Badge variant={verificationStatusVariant(verification.status)}>
            {verification.status}
          </Badge>
        </div>
      )}

      {/* Duplicates warning */}
      {duplicates && duplicates.length > 0 && (
        <div className="rounded-xl border border-(--amber-6) bg-(--amber-2) px-4 py-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-(--amber-11) shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-(--amber-11)">
                Entitas serupa ditemukan ({duplicates.length})
              </p>
              <ul className="mt-1 space-y-0.5">
                {duplicates.slice(0, 3).map((d) => (
                  <li key={d.id} className="text-xs text-(--amber-12)">
                    {d.nama_utama} — {Math.round(d.match_score * 100)}% cocok
                    {d.is_shadow && ' (shadow)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Legal IDs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-(--gray-11) uppercase tracking-wide">
            Nomor Identitas Legal
          </h3>
          {availableTypes.length > 0 && !showLegalForm && (
            <Button variant="ghost" size="1" className="gap-1" onClick={() => setShowLegalForm(true)}>
              <PlusIcon className="h-3 w-3" />
              Tambah
            </Button>
          )}
        </div>

        {!legalIDs || legalIDs.length === 0 ? (
          <p className="text-xs text-(--gray-9)">Belum ada identitas legal terdaftar.</p>
        ) : (
          <div className="space-y-2">
            {legalIDs.map((lid) => (
              <div
                key={lid.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-(--gray-3) bg-(--gray-1)"
              >
                <div>
                  <p className="text-xs text-(--gray-9)">{LEGAL_ID_LABELS[lid.id_type]}</p>
                  <p className="text-sm font-medium text-(--gray-12) font-mono">{lid.id_value}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lid.is_verified && (
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => {
                      if (confirm(`Hapus ${LEGAL_ID_LABELS[lid.id_type]}?`)) {
                        deleteLegalID.mutate(lid.id_type)
                      }
                    }}
                  >
                    <TrashIcon className="h-3.5 w-3.5 text-(--red-9)" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showLegalForm && (
          <form onSubmit={onAddLegalID} className="flex flex-col sm:flex-row gap-2 pt-1">
            <Select
              value={legalForm.watch('id_type')}
              onValueChange={(v) => legalForm.setValue('id_type', v as LegalIDType)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((t) => (
                  <SelectItem key={t} value={t}>{LEGAL_ID_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nomor identitas"
              error={!!legalForm.formState.errors.id_value}
              errorMessage={legalForm.formState.errors.id_value?.message}
              {...legalForm.register('id_value')}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="solid" size="2" loading={addLegalID.isPending}>
                Simpan
              </Button>
              <Button type="button" variant="ghost" size="2" onClick={() => setShowLegalForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Aliases */}
      <div className="space-y-3 border-t border-(--gray-4) pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-(--gray-11) uppercase tracking-wide">
            Alias / Nama Alternatif
          </h3>
          {!showAliasForm && (
            <Button variant="ghost" size="1" className="gap-1" onClick={() => setShowAliasForm(true)}>
              <PlusIcon className="h-3 w-3" />
              Tambah
            </Button>
          )}
        </div>

        {!aliases || aliases.length === 0 ? (
          <p className="text-xs text-(--gray-9)">Belum ada alias.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aliases.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--gray-5) bg-(--gray-2) px-3 py-1 text-xs text-(--gray-12)"
              >
                {a.alias}
                <span className="text-(--gray-8)">· {a.source.toLowerCase()}</span>
                <button
                  type="button"
                  onClick={() => deleteAlias.mutate(a.id)}
                  className="text-(--gray-9) hover:text-(--red-9) transition-colors cursor-pointer"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {showAliasForm && (
          <form onSubmit={onAddAlias} className="flex gap-2 pt-1">
            <Input
              placeholder="Nama alias..."
              error={!!aliasForm.formState.errors.alias}
              errorMessage={aliasForm.formState.errors.alias?.message}
              {...aliasForm.register('alias')}
              className="flex-1"
            />
            <Button type="submit" variant="solid" size="2" loading={addAlias.isPending}>
              Simpan
            </Button>
            <Button type="button" variant="ghost" size="2" onClick={() => setShowAliasForm(false)}>
              Batal
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

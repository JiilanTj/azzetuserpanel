import React, { useState, useMemo } from 'react'
import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAccounts } from '@/hooks/use-accounting'
import { useForm, Controller, type UseFormRegister, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormValues,
  type UpdateAccountFormValues,
} from '@/lib/validations'
import {
  ChevronDownIcon,
  PlusIcon,
  Pencil1Icon,
  EyeOpenIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons'
import type { AccountResponse, AccountType, CreateAccountRequest } from '@/lib/api/types/accounting.types'
import { useCreateAccount, useUpdateAccount } from '@/hooks/use-accounting'
import { cn } from '@/lib/utils'

// Types
type TreeNode = AccountResponse & { children: TreeNode[] }

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'ASSET', label: 'Harta (Aset)' },
  { value: 'LIABILITY', label: 'Kewajiban (Liabilitas)' },
  { value: 'EQUITY', label: 'Ekuitas (Modal)' },
  { value: 'REVENUE', label: 'Pendapatan' },
  { value: 'EXPENSE', label: 'Beban / Pengeluaran' },
]

export const accountsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/accounts',
  component: AccountsPage,
})

function buildTree(accounts: AccountResponse[]) {
  const map = new Map<string, TreeNode>()
  const roots: Record<AccountType, TreeNode[]> = {
    ASSET: [],
    LIABILITY: [],
    EQUITY: [],
    REVENUE: [],
    EXPENSE: [],
  }

  accounts.forEach(acc => {
    map.set(acc.id, { ...acc, children: [] })
  })

  accounts.forEach(acc => {
    const node = map.get(acc.id)!
    if (acc.parent_id && map.has(acc.parent_id)) {
      map.get(acc.parent_id)!.children.push(node)
    } else {
      roots[acc.account_type].push(node)
    }
  })

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.code.localeCompare(b.code))
    nodes.forEach(n => sortNodes(n.children))
  }

  Object.values(roots).forEach(sortNodes)
  return roots
}

function flattenNodes(nodes: TreeNode[], expandedIds: Set<string>): TreeNode[] {
  let result: TreeNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (expandedIds.has(node.id) && node.children.length > 0) {
      result = result.concat(flattenNodes(node.children, expandedIds))
    }
  }
  return result
}

function AccountsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: accountsData, isLoading } = useAccounts(activeWorkspace?.entity_id, true)
  const updateMutation = useUpdateAccount(activeWorkspace?.entity_id)

  const [expandedTypes, setExpandedTypes] = useState<Set<AccountType>>(
    new Set(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  )
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(null)

  // Confirmation Dialog State
  const [confirmTarget, setConfirmTarget] = useState<AccountResponse | null>(null)

  const handleOpenCreate = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (acc: AccountResponse) => {
    if (acc.is_system) return
    setEditingAccount(acc)
    setIsModalOpen(true)
  }

  const handleToggleActive = (acc: AccountResponse) => {
    if (acc.is_system) return
    setConfirmTarget(acc)
  }

  const handleConfirmToggle = () => {
    if (!confirmTarget) return
    updateMutation.mutate({
      id: confirmTarget.id,
      body: { is_active: !confirmTarget.is_active }
    })
    setConfirmTarget(null)
  }

  const roots = useMemo(() => buildTree(accountsData || []), [accountsData])

  const toggleType = (type: AccountType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const toggleNode = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedTypes(new Set(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']))
    setExpandedIds(new Set((accountsData || []).map(a => a.id)))
  }

  const collapseAll = () => {
    setExpandedTypes(new Set())
    setExpandedIds(new Set())
  }

  if (isLoading) {
    return <div className="p-6 text-center text-(--gray-11)">Memuat data Chart of Accounts...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Daftar Akun (COA)
          </h1>
          <p className="text-sm text-(--gray-10)">
            Kelola Chart of Accounts untuk pencatatan jurnal akuntansi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={collapseAll}>Collapse All</Button>
          <Button variant="outline" onClick={expandAll}>Expand All</Button>
          <Button variant="solid" onClick={handleOpenCreate}>
            <PlusIcon className="mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      <div className="border border-(--gray-6) rounded-xl overflow-hidden bg-white dark:bg-(--gray-2) shadow-sm">
        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-(--gray-2) dark:bg-(--gray-3)">
              <tr className="border-b-2 border-(--gray-7)">
                <th className="py-3 px-5 font-semibold text-(--gray-11) text-xs uppercase tracking-wider w-[280px]">Kode Akun</th>
                <th className="py-3 px-4 font-semibold text-(--gray-11) text-xs uppercase tracking-wider">Nama Akun</th>
                <th className="py-3 px-4 font-semibold text-(--gray-11) text-xs uppercase tracking-wider w-[120px]">Saldo</th>
                <th className="py-3 px-4 font-semibold text-(--gray-11) text-xs uppercase tracking-wider w-[110px] text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-(--gray-11) text-xs uppercase tracking-wider w-[80px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNT_TYPES.map(type => (
                <React.Fragment key={type.value}>
                  {/* Category header */}
                  <tr
                    className="cursor-pointer transition-colors border-b border-(--gray-6)"
                    onClick={() => toggleType(type.value)}
                  >
                    <td colSpan={5} className="py-2.5 px-5 bg-(--gray-3) dark:bg-(--gray-4)">
                      <div className="flex items-center gap-2.5">
                        <span className="text-(--gray-9) transition-transform duration-150" style={{ display: 'inline-flex', transform: expandedTypes.has(type.value) ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                          <ChevronDownIcon />
                        </span>
                        <span className="font-semibold text-(--gray-12) text-[13px] tracking-wide">
                          {type.label}
                        </span>
                        <span className="text-[11px] text-(--gray-9) font-normal ml-1">
                          {roots[type.value].length} akun
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Tree items */}
                  {expandedTypes.has(type.value) && flattenNodes(roots[type.value], expandedIds).map((node, idx) => {
                    const isEven = idx % 2 === 0
                    return (
                      <tr
                        key={node.id}
                        className={cn(
                          'transition-colors group',
                          isEven ? 'bg-transparent' : 'bg-(--gray-2) dark:bg-(--gray-3)'
                        )}
                      >
                        <td className="py-2 px-5">
                          <div className="flex items-center gap-1.5" style={{ paddingLeft: `${(node.level - 1) * 1.5}rem` }}>
                            {node.children.length > 0 ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                                className="p-0.5 rounded-md hover:bg-(--gray-6) text-(--gray-9) hover:text-(--gray-12) transition-all"
                              >
                                <ChevronDownIcon
                                  className={cn('h-3.5 w-3.5 transition-transform', !expandedIds.has(node.id) && '-rotate-90')}
                                />
                              </button>
                            ) : (
                              <span className="w-[22px]" />
                            )}
                            <span className="font-mono font-medium text-(--gray-12) text-[13px] tracking-tight">
                              {node.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-(--gray-12) text-[13px]">{node.name}</span>
                            {node.is_system && (
                              <Badge variant="gray" className="h-[18px] px-1.5 text-[10px] font-medium tracking-wide uppercase">
                                Sistem
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold',
                            node.normal_balance === 'DEBIT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                          )}>
                            {node.normal_balance === 'DEBIT' ? 'Debit' : 'Kredit'}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Badge
                            variant={node.is_active ? 'success' : 'gray'}
                            className="h-[18px] px-1.5 text-[10px] font-medium"
                          >
                            {node.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {!node.is_system ? (
                              <>
                                <Button
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-(--gray-9) hover:text-(--gray-12) hover:bg-(--gray-5)"
                                  onClick={(e) => { e.stopPropagation(); handleOpenEdit(node); }}
                                >
                                  <Pencil1Icon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    'h-7 w-7 p-0',
                                    node.is_active
                                      ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50'
                                      : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                  )}
                                  onClick={(e) => { e.stopPropagation(); handleToggleActive(node); }}
                                >
                                  {node.is_active ? <EyeNoneIcon className="h-3.5 w-3.5" /> : <EyeOpenIcon className="h-3.5 w-3.5" />}
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}

              {(!accountsData || accountsData.length === 0) && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-(--gray-9) text-sm">Belum ada akun yang terdaftar.</p>
                    <p className="text-(--gray-9) text-xs mt-1">Klik "Tambah Akun" untuk memulai.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Toggle Active Dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={() => setConfirmTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.is_active
                ? `Apakah Anda yakin ingin menonaktifkan akun "${confirmTarget?.code} - ${confirmTarget?.name}"? Akun ini tidak akan muncul di jurnal baru.`
                : `Apakah Anda yakin ingin mengaktifkan kembali akun "${confirmTarget?.code} - ${confirmTarget?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setConfirmTarget(null)}>Batal</Button>
            <Button
              variant="solid"
              onClick={handleConfirmToggle}
              loading={updateMutation.isPending}
            >
              {confirmTarget?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AccountFormModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingAccount={editingAccount}
        accounts={accountsData || []}
        workspaceId={activeWorkspace?.entity_id}
      />
    </div>
  )
}

function AccountFormModal({
  isOpen,
  onOpenChange,
  editingAccount,
  accounts,
  workspaceId,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingAccount: AccountResponse | null
  accounts: AccountResponse[]
  workspaceId?: string
}) {
  const isEditing = !!editingAccount
  const createMutation = useCreateAccount(workspaceId)
  const updateMutation = useUpdateAccount(workspaceId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateAccountFormValues | UpdateAccountFormValues>({
    resolver: zodResolver(isEditing ? updateAccountSchema : createAccountSchema),
    defaultValues: {
      account_type: 'ASSET',
      code: '',
      name: '',
      parent_id: '__none__',
    },
  })

  const formErrors = errors as Record<string, { message?: string }>
  const registerCreate = register as unknown as UseFormRegister<CreateAccountFormValues>
  const controlCreate = control as unknown as Control<CreateAccountFormValues>

  // Reset form when modal opens or editingAccount changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        reset({
          name: editingAccount.name,
          is_active: editingAccount.is_active,
          parent_id: editingAccount.parent_id || '__none__',
        })
      } else {
        reset({
          account_type: 'ASSET',
          code: '',
          name: '',
          parent_id: '__none__',
        })
      }
    }
  }, [isOpen, editingAccount, reset])

  const onSubmit = (data: CreateAccountFormValues | UpdateAccountFormValues) => {
    // If empty string, treat parent_id as undefined
    const payload = {
      ...data,
      parent_id: data.parent_id === '__none__' ? undefined : data.parent_id,
    }

    if (isEditing && editingAccount) {
      updateMutation.mutate(
        { id: editingAccount.id, body: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      createMutation.mutate(payload as CreateAccountRequest, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const parentOptions = accounts.filter(a => {
    if (isEditing && editingAccount && a.id === editingAccount.id) return false
    // Only level 1 or 2 accounts can be parents usually, but we allow any for flexibility
    return true
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Akun' : 'Tambah Akun Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Ubah rincian akun yang sudah ada.' 
              : 'Buat akun perkiraan (Chart of Accounts) baru untuk pencatatan jurnal.'}
          </DialogDescription>
        </DialogHeader>

        <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {!isEditing && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Tipe Akun</label>
                <Controller
                  name="account_type"
                  control={controlCreate}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value as string}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tipe akun" />
                      </SelectTrigger>
                      <SelectContent searchable searchPlaceholder="Cari tipe akun...">
                        {ACCOUNT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.account_type && (
                  <p className="text-xs text-red-500">{formErrors.account_type.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Kode Akun</label>
                <Input
                  placeholder="e.g. 1-1001"
                  {...registerCreate('code')}
                />
                {formErrors.code && (
                  <p className="text-xs text-red-500">{formErrors.code.message}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Nama Akun</label>
            <Input
              placeholder="e.g. Kas Utama"
              {...register('name')}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Induk Akun (Parent)</label>
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value as string}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Tanpa Induk (Root) --" />
                  </SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Cari akun induk...">
                    <SelectItem value="__none__">-- Tanpa Induk (Root) --</SelectItem>
                    {parentOptions.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--gray-12)">Status Aktif</label>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(val) => field.onChange(val === 'true')} 
                    value={field.value ? 'true' : 'false'}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="solid" 
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


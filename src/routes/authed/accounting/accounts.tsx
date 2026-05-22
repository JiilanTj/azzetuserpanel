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
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import type { AccountResponse, AccountType, CreateAccountRequest } from '@/lib/api/types/accounting.types'
import { useCreateAccount, useUpdateAccount } from '@/hooks/use-accounting'

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
  const { data: accountsData, isLoading } = useAccounts(activeWorkspace?.id)

  const [expandedTypes, setExpandedTypes] = useState<Set<AccountType>>(
    new Set(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  )
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(null)

  const handleOpenCreate = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (acc: AccountResponse) => {
    setEditingAccount(acc)
    setIsModalOpen(true)
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

      <div className="border border-(--gray-6) rounded-xl overflow-hidden bg-white dark:bg-(--gray-2)">
        <table className="w-full text-sm text-left">
          <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
            <tr>
              <th className="py-3 px-4 font-medium w-[250px]">Kode Akun</th>
              <th className="py-3 px-4 font-medium">Nama Akun</th>
              <th className="py-3 px-4 font-medium w-[150px]">Saldo Normal</th>
              <th className="py-3 px-4 font-medium w-[120px] text-center">Status</th>
              <th className="py-3 px-4 font-medium w-[100px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNT_TYPES.map(type => (
              <React.Fragment key={type.value}>
                <tr 
                  className="bg-(--gray-4) cursor-pointer hover:bg-(--gray-5) transition-colors border-b border-(--gray-6)"
                  onClick={() => toggleType(type.value)}
                >
                  <td colSpan={5} className="py-3 px-4 font-semibold text-(--gray-12)">
                    <div className="flex items-center gap-2">
                      {expandedTypes.has(type.value) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      {type.label}
                    </div>
                  </td>
                </tr>
                {expandedTypes.has(type.value) && flattenNodes(roots[type.value], expandedIds).map(node => (
                  <tr key={node.id} className="border-b border-(--gray-5) hover:bg-(--gray-3) transition-colors group">
                    <td className="py-2.5 px-4">
                      <div 
                        className="flex items-center gap-2" 
                        style={{ paddingLeft: `${(node.level - 1) * 1.5}rem` }}
                      >
                        {node.children.length > 0 ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            className="p-0.5 rounded-md hover:bg-(--gray-6) text-(--gray-11) transition-colors"
                          >
                            {expandedIds.has(node.id) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                          </button>
                        ) : (
                          <span className="w-[20px]" />
                        )}
                        <span className="font-medium text-(--gray-12)">{node.code}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-(--gray-11)">
                      {node.name}
                      {node.is_system && (
                        <Badge variant="gray" className="ml-2 h-5 px-1.5 text-[10px]">Sistem</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-(--gray-11)">
                      {node.normal_balance === 'DEBIT' ? 'Debit' : 'Kredit'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={node.is_active ? 'success' : 'gray'} className="h-5 text-[10px]">
                        {node.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-(--gray-11)"
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(node); }}
                        >
                          <Pencil1Icon className="h-3.5 w-3.5" />
                        </Button>
                        {!node.is_system && (
                          <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            
            {(!accountsData || accountsData.length === 0) && !isLoading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-(--gray-11)">
                  Belum ada akun yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AccountFormModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingAccount={editingAccount}
        accounts={accountsData || []}
        workspaceId={activeWorkspace?.id}
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
      parent_id: '',
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
          parent_id: editingAccount.parent_id || '',
        })
      } else {
        reset({
          account_type: 'ASSET',
          code: '',
          name: '',
          parent_id: '',
        })
      }
    }
  }, [isOpen, editingAccount, reset])

  const onSubmit = (data: CreateAccountFormValues | UpdateAccountFormValues) => {
    // If empty string, treat parent_id as undefined
    const payload = {
      ...data,
      parent_id: data.parent_id || undefined,
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
                      <SelectContent>
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
                  <SelectContent>
                    <SelectItem value="">-- Tanpa Induk (Root) --</SelectItem>
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


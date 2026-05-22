import React, { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useItems, useCreateItem, useUpdateItem, useAccounts } from '@/hooks/use-accounting'
import { useForm, Controller, type Control } from 'react-hook-form'
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import {
  createItemSchema,
  updateItemSchema,
  type CreateItemFormValues,
  type UpdateItemFormValues,
  ITEM_TYPES_TUPLE,
} from '@/lib/validations/accounting'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import type { ItemResponse, CreateItemRequest, AccountResponse } from '@/lib/api/types/accounting.types'

export const itemsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/items',
  component: ItemsPage,
})

function ItemsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: itemsData, isLoading } = useItems(activeWorkspace?.id)

  const [activeTab, setActiveTab] = useState<'ALL' | 'BARANG' | 'JASA' | 'PROYEK' | 'AHSP_RAKITAN'>('ALL')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemResponse | null>(null)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: ItemResponse) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const items = itemsData || []
  const filteredItems = items.filter((i: ItemResponse) => activeTab === 'ALL' ? true : i.item_type === activeTab)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Katalog Barang & Jasa
          </h1>
          <p className="text-sm text-(--gray-10)">
            Kelola daftar produk dan layanan untuk pencatatan transaksi pembelian maupun penjualan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="solid" onClick={handleOpenCreate}>
            <PlusIcon className="mr-2" />
            Tambah Item
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'ALL' | 'BARANG' | 'JASA' | 'PROYEK' | 'AHSP_RAKITAN')} className="w-full">
        <TabsList className="mb-4 flex overflow-x-auto">
          <TabsTrigger value="ALL">Semua</TabsTrigger>
          <TabsTrigger value="BARANG">Barang</TabsTrigger>
          <TabsTrigger value="JASA">Jasa / Layanan</TabsTrigger>
          <TabsTrigger value="PROYEK">Proyek</TabsTrigger>
          <TabsTrigger value="AHSP_RAKITAN">AHSP / Rakitan</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border border-(--gray-6) rounded-xl overflow-hidden bg-white dark:bg-(--gray-2)">
        <table className="w-full text-sm text-left">
          <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
            <tr>
              <th className="py-3 px-4 font-medium w-[250px]">Nama Item</th>
              <th className="py-3 px-4 font-medium w-[120px]">Tipe</th>
              <th className="py-3 px-4 font-medium w-[180px]">Harga Satuan</th>
              <th className="py-3 px-4 font-medium w-[100px]">Satuan</th>
              <th className="py-3 px-4 font-medium w-[120px] text-center">Status</th>
              <th className="py-3 px-4 font-medium w-[100px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-(--gray-11)">Memuat data items...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-(--gray-11)">Belum ada item yang terdaftar.</td>
              </tr>
            ) : (
              filteredItems.map((item: ItemResponse) => (
                <tr key={item.id} className="border-b border-(--gray-5) hover:bg-(--gray-3) transition-colors group">
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-(--gray-12)">{item.name}</span>
                    {item.description && (
                      <p className="text-xs text-(--gray-10) truncate max-w-[200px] mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant={item.item_type === 'BARANG' ? 'gray' : 'outline'} className="text-[10px]">
                      {item.item_type}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-(--gray-11)">
                    Rp {Number(item.unit_price).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-(--gray-11)">
                    {item.unit || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant={item.is_active ? 'success' : 'gray'} className="h-5 text-[10px]">
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        className="h-7 w-7 p-0 text-(--gray-11)"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil1Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ItemFormModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingItem={editingItem}
        workspaceId={activeWorkspace?.id}
      />
    </div>
  )
}

function ItemFormModal({
  isOpen,
  onOpenChange,
  editingItem,
  workspaceId,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingItem: ItemResponse | null
  workspaceId?: string
}) {
  const isEditing = !!editingItem
  const createMutation = useCreateItem(workspaceId)
  const updateMutation = useUpdateItem(workspaceId)
  
  // Fetch accounts to link items to an income/expense account
  const { data: accountsData } = useAccounts(workspaceId)
  const accounts = accountsData || []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateItemFormValues | UpdateItemFormValues>({
    resolver: zodResolver(isEditing ? updateItemSchema : createItemSchema),
    defaultValues: {
      item_type: 'BARANG',
      name: '',
      description: '',
      unit: '',
      unit_price: '',
      account_id: '',
    },
  })

  const formErrors = errors as Record<string, { message?: string }>

  React.useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          item_type: editingItem.item_type,
          name: editingItem.name,
          description: editingItem.description || '',
          unit: editingItem.unit || '',
          unit_price: Number(editingItem.unit_price).toString(), // Remove any decimal padding if present
          account_id: editingItem.account_id || '',
          is_active: editingItem.is_active,
        })
      } else {
        reset({
          item_type: 'BARANG',
          name: '',
          description: '',
          unit: '',
          unit_price: '',
          account_id: '',
        })
      }
    }
  }, [isOpen, editingItem, reset])

  const onSubmit = (data: CreateItemFormValues | UpdateItemFormValues) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      unit: data.unit || undefined,
      account_id: data.account_id || undefined,
    }

    if (isEditing && editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, body: payload },
        {
          onSuccess: () => onOpenChange(false)
        }
      )
    } else {
      createMutation.mutate(payload as CreateItemRequest, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }

  // Usually item should be linked to an INCOME or EXPENSE account
  // But we allow ALL level 2/3 accounts for flexibility in this view.
  const accountOptions = accounts.filter((a: AccountResponse) => !a.is_system && a.level > 1)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Tambah Item Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Ubah informasi produk atau layanan.' 
              : 'Tambahkan produk atau layanan baru ke dalam katalog.'}
          </DialogDescription>
        </DialogHeader>

        <form id="item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--gray-12)">Tipe Item</label>
              <Controller
                name="item_type"
                control={control as unknown as Control<CreateItemFormValues>}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value as string}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES_TUPLE.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'BARANG' ? 'Barang' : type === 'JASA' ? 'Jasa' : type === 'PROYEK' ? 'Proyek' : 'AHSP / Rakitan'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {formErrors.item_type && (
                <p className="text-xs text-red-500">{formErrors.item_type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--gray-12)">Satuan (Opsional)</label>
              <Input
                placeholder="e.g. Pcs, Jam"
                {...register('unit')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Nama Item</label>
            <Input
              placeholder="e.g. Jasa Konsultasi IT"
              {...register('name')}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Harga Satuan</label>
            <Input
              type="number"
              placeholder="e.g. 150000"
              {...register('unit_price' as keyof CreateItemFormValues)}
            />
            {formErrors.unit_price && (
              <p className="text-xs text-red-500">{formErrors.unit_price.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Akun Penjampung (Opsional)</label>
            <Controller
              name="account_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value as string}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Tanpa Akun Khusus --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Tanpa Akun Khusus --</SelectItem>
                    {accountOptions.map((acc: AccountResponse) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-(--gray-12)">Deskripsi (Opsional)</label>
            <Input
              placeholder="Keterangan singkat produk/layanan"
              {...register('description')}
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

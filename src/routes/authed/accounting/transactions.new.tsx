import { createRoute, useNavigate } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '@/lib/validations/accounting'
import {
  useCreateTransaction,
  useCategorizeTransaction,
  useAccounts,
} from '@/hooks/use-accounting'
import { useCounterparties } from '@/hooks/use-workspace'
import { useWorkspaceStore } from '@/stores/workspace.store'
import {
  Button,
  Input,
  CurrencyInput,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { MagicWandIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import type { AccountResponse, CounterpartyResponse, CreateTransactionRequest } from '@/lib/api/types'

export const newTransactionRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/transactions/new',
  component: NewTransactionPage,
})

function NewTransactionPage() {
  const navigate = useNavigate()
  const { activeWorkspace } = useWorkspaceStore()

  const createMutation = useCreateTransaction(activeWorkspace?.entity_id)
  const categorizeMutation = useCategorizeTransaction(activeWorkspace?.entity_id)

  const { data: accountsData } = useAccounts(activeWorkspace?.entity_id)
  const accounts = accountsData || []

  const { data: counterpartiesData } = useCounterparties(activeWorkspace?.entity_id)
  const counterparties = counterpartiesData || []

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      input_mode: 'SIMPLE',
      transaction_type: 'CASH_OUT',
      transaction_date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      journal_entries: [
        { account_code: undefined as string | undefined, debit: undefined as string | undefined, credit: undefined as string | undefined },
        { account_code: undefined as string | undefined, debit: undefined as string | undefined, credit: undefined as string | undefined },
      ],
    },
  })

  const formErrors = errors as Record<string, { message?: string }>

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'journal_entries',
  })

  const currentInputMode = useWatch({ control, name: 'input_mode' })
  const currentDesc = useWatch({ control, name: 'description' })
  const currentAmount = useWatch({ control, name: 'amount' })

  const currentType = useWatch({ control, name: 'transaction_type' })

  const handleCategorize = () => {
    if (!currentDesc) {
      toast.error('Masukkan deskripsi transaksi terlebih dahulu')
      return
    }
    categorizeMutation.mutate(
      {
        description: currentDesc,
        amount: Number(currentAmount || 0),
        transaction_type: currentType
      },
      {
        onSuccess: (data) => {
          if (data.category) {
            setValue('category', data.category)
            toast.success(`Saran kategori: ${data.category} (Akurasi: ${data.confidence}%)`)
          } else {
            toast.info('Tidak ada saran kategori yang relevan ditemukan.')
          }
        }
      }
    )
  }

  const onSubmit = (values: CreateTransactionFormValues) => {
    if (values.input_mode === 'ADVANCED') {
      values.transaction_type = 'JOURNAL'
      const totalDebit = values.journal_entries?.reduce((acc, curr) => acc + Number(curr.debit || 0), 0) || 0
      const totalCredit = values.journal_entries?.reduce((acc, curr) => acc + Number(curr.credit || 0), 0) || 0
      if (totalDebit !== totalCredit) {
        toast.error(`Jurnal tidak balance! Total Debit: ${totalDebit}, Total Kredit: ${totalCredit}`)
        return
      }
      if (totalDebit === 0) {
        toast.error('Nominal jurnal tidak boleh nol')
        return
      }
      values.amount = totalDebit.toString()
    }

    const journalEntries = values.input_mode === 'ADVANCED'
      ? (values.journal_entries || []).filter(e => e.account_code && (e.debit || e.credit))
          .map(e => ({ account_code: e.account_code!, debit: Number(e.debit), credit: Number(e.credit), description: e.description || undefined }))
      : undefined

    const payload = {
      transaction_date: values.transaction_date,
      transaction_type: values.transaction_type,
      input_mode: values.input_mode,
      payment_method: values.payment_method,
      counterparty_entity_id: values.counterparty_entity_id === '__none__' ? undefined : values.counterparty_entity_id,
      description: values.description,
      amount: Number(values.amount),
      tax_amount: values.tax_amount ? Number(values.tax_amount) : undefined,
      includes_tax: values.includes_tax,
      category: values.category,
      journal_entries: journalEntries,
      line_items: values.line_items,
    }

    createMutation.mutate(payload as CreateTransactionRequest,
      {
        onSuccess: () => {
          navigate({ to: '/accounting/transactions' })
        },
        onError: (err) => {
          toast.error('Gagal mencatat transaksi', { description: (err as Error)?.message || String(err) })
        },
      }
    )
  }

  const onValidationError = () => {
    const first = Object.keys(formErrors)[0]
    if (first) {
      const msg = formErrors[first]?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg || `Field "${first}" tidak valid`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Catat Transaksi Baru
        </h1>
        <p className="text-sm text-(--gray-10)">
          Catat transaksi menggunakan mode kasir (Simple) atau mode akuntan (Advanced/Jurnal Umum).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, e => { onValidationError(); console.error(e) })} className="space-y-8 bg-white dark:bg-(--gray-2) p-6 rounded-xl border border-(--gray-6)">
        <Controller
          name="input_mode"
          control={control}
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val)
                if (val === 'ADVANCED') setValue('transaction_type', 'JOURNAL')
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="SIMPLE">Mode Simple (Kasir)</TabsTrigger>
                <TabsTrigger value="ADVANCED">Mode Advanced (Jurnal)</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        {currentInputMode === 'SIMPLE' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Tanggal Transaksi</label>
                <Input type="date" {...register('transaction_date')} />
                {formErrors.transaction_date && <p className="text-xs text-red-500">{formErrors.transaction_date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Tipe Transaksi</label>
                <Controller
                  name="transaction_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe transaksi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH_IN">Uang Masuk / Penerimaan</SelectItem>
                        <SelectItem value="CASH_OUT">Uang Keluar / Pengeluaran</SelectItem>
                        <SelectItem value="SALES">Penjualan</SelectItem>
                        <SelectItem value="PURCHASE">Pembelian</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Total Nominal (IDR)</label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      placeholder="Contoh: 1.500.000"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Pihak Ketiga (Opsional)</label>
                <Controller
                  name="counterparty_entity_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Pelanggan / Vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- Tanpa Pihak Ketiga --</SelectItem>
                        {counterparties.map((cp: CounterpartyResponse) => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.custom_alias || cp.entity_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--gray-12)">Deskripsi / Keterangan</label>
              <Input placeholder="Contoh: Pembayaran internet bulan Mei" {...register('description')} />
            </div>

            <div className="p-4 bg-(--gray-3) rounded-lg border border-(--gray-5) space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-(--gray-12)">Kategori Akuntansi (Opsional)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="2"
                  onClick={handleCategorize}
                  loading={categorizeMutation.isPending}
                >
                  <MagicWandIcon className="mr-2" />
                  AI Auto-Categorize
                </Button>
              </div>
              <Input placeholder="Kategori otomatis akan terisi dari AI" {...register('category')} />
              <p className="text-xs text-(--gray-10)">
                Jika dibiarkan kosong, sistem akan menyimpan di akun sementara (Uncategorized) untuk direviu Akuntan.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Tanggal Jurnal</label>
                <Input type="date" {...register('transaction_date')} />
                {formErrors.transaction_date && <p className="text-xs text-red-500">{formErrors.transaction_date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--gray-12)">Deskripsi Jurnal</label>
                <Input placeholder="Referensi jurnal..." {...register('description')} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-(--gray-12)">Entri Jurnal Debit & Kredit</label>
              </div>

              <div className="border border-(--gray-6) rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
                    <tr>
                      <th className="py-2 px-3 font-medium">Akun Perkiraan</th>
                      <th className="py-2 px-3 font-medium w-[200px]">Debit (IDR)</th>
                      <th className="py-2 px-3 font-medium w-[200px]">Kredit (IDR)</th>
                      <th className="py-2 px-3 font-medium w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="border-b border-(--gray-5)">
                        <td className="p-2">
                          <Controller
                            name={`journal_entries.${index}.account_code`}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Select onValueChange={onChange} value={value}>
                                <SelectTrigger className="border-transparent bg-transparent hover:bg-(--gray-3)">
                                  <SelectValue placeholder="Pilih Akun" />
                                </SelectTrigger>
                                <SelectContent searchable searchPlaceholder="Cari akun...">
                                  {accounts.filter((a: AccountResponse) => a.level > 1).map((acc: AccountResponse) => (
                                    <SelectItem key={acc.code} value={acc.code}>
                                      {acc.code} - {acc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </td>
                        <td className="p-2">
                          <Controller
                            name={`journal_entries.${index}.debit`}
                            control={control}
                            render={({ field }) => (
                              <CurrencyInput
                                className="h-8 border-transparent bg-transparent hover:bg-(--gray-3) focus:bg-white dark:focus:bg-black"
                                placeholder="0"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                        </td>
                        <td className="p-2">
                          <Controller
                            name={`journal_entries.${index}.credit`}
                            control={control}
                            render={({ field }) => (
                              <CurrencyInput
                                className="h-8 border-transparent bg-transparent hover:bg-(--gray-3) focus:bg-white dark:focus:bg-black"
                                placeholder="0"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => remove(index)}
                          >
                            <TrashIcon />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="2"
                onClick={() => append({ account_code: undefined as string | undefined, debit: undefined as string | undefined, credit: undefined as string | undefined })}
              >
                <PlusIcon className="mr-2" />
                Tambah Baris Entri
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-(--gray-6)">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: '/accounting/transactions' })}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="solid"
            loading={createMutation.isPending}
          >
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </div>
  )
}

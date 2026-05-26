import { z } from 'zod'

export const ACCOUNT_TYPES_TUPLE = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export const createAccountSchema = z.object({
  account_type: z.enum(ACCOUNT_TYPES_TUPLE, {
    message: 'Tipe akun harus dipilih',
  }),
  code: z.string().min(1, 'Kode akun wajib diisi').max(20, 'Kode akun maksimal 20 karakter'),
  name: z.string().min(1, 'Nama akun wajib diisi').max(100, 'Nama akun maksimal 100 karakter'),
  parent_id: z.string().optional(),
})

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>

export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi').max(100, 'Nama akun maksimal 100 karakter').optional(),
  is_active: z.boolean().optional(),
  parent_id: z.string().optional(),
})

export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>

export const ITEM_TYPES_TUPLE = ['BARANG', 'JASA', 'PROYEK', 'AHSP_RAKITAN'] as const;

export const createItemSchema = z.object({
  item_type: z.enum(ITEM_TYPES_TUPLE, {
    message: 'Tipe item harus dipilih',
  }),
  name: z.string().min(1, 'Nama item wajib diisi').max(100, 'Nama item maksimal 100 karakter'),
  description: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional(),
  unit: z.string().max(20, 'Satuan maksimal 20 karakter').optional(),
  unit_price: z.string().min(1, 'Harga satuan wajib diisi'),
  account_id: z.string().optional(),
})

export type CreateItemFormValues = z.infer<typeof createItemSchema>

export const updateItemSchema = z.object({
  item_type: z.enum(ITEM_TYPES_TUPLE).optional(),
  name: z.string().min(1, 'Nama item wajib diisi').max(100, 'Nama item maksimal 100 karakter').optional(),
  description: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional(),
  unit: z.string().max(20, 'Satuan maksimal 20 karakter').optional(),
  unit_price: z.string().min(1, 'Harga satuan wajib diisi').optional(),
  account_id: z.string().optional(),
  is_active: z.boolean().optional(),
})

export type UpdateItemFormValues = z.infer<typeof updateItemSchema>

export const TRANSACTIONS_TYPES_TUPLE = ['CASH_IN', 'CASH_OUT', 'SALES', 'PURCHASE', 'JOURNAL', 'REVERSAL'] as const;

export const createTransactionSchema = z.object({
  transaction_date: z.string().min(1, 'Tanggal transaksi wajib diisi'),
  transaction_type: z.enum(TRANSACTIONS_TYPES_TUPLE),
  input_mode: z.enum(['SIMPLE', 'ADVANCED', 'OCR']),
  payment_method: z.enum(['TUNAI', 'KREDIT', 'TRANSFER']).optional(),
  counterparty_entity_id: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().min(1, 'Total nominal wajib diisi'),
  tax_amount: z.string().optional(),
  includes_tax: z.boolean().optional(),
  category: z.string().optional(),
  
  journal_entries: z.array(z.object({
    account_code: z.string().optional(),
    debit: z.string().optional(),
    credit: z.string().optional(),
    description: z.string().optional()
  })).optional(),
  
  line_items: z.array(z.object({
    item_id: z.string().optional(),
    description: z.string().min(1, 'Deskripsi wajib diisi'),
    quantity: z.string().min(1, 'Kuantitas wajib diisi'),
    unit: z.string().optional(),
    unit_price: z.string().min(1, 'Harga satuan wajib diisi'),
    discount_amount: z.string().optional()
  })).optional()
})

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>

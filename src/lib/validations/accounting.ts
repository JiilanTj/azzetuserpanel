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

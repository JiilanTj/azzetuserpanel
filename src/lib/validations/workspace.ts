import { z } from "zod/v4";

// counterparties.tsx
export const searchCounterpartySchema = z.object({
  relation_type: z.enum(["PELANGGAN", "VENDOR"], { message: "Pilih tipe relasi" }),
  entity_id: z.string().min(1, "Pilih entitas"),
  custom_alias: z.string().optional(),
});
export type SearchFormValues = z.infer<typeof searchCounterpartySchema>;

export const manualCounterpartySchema = z.object({
  relation_type: z.enum(["PELANGGAN", "VENDOR"], { message: "Pilih tipe relasi" }),
  entity_type: z.enum(["ORANG_PRIBADI", "BADAN_USAHA"], { message: "Pilih tipe entitas" }),
  nama_utama: z.string().min(1, "Nama wajib diisi"),
  nik_npwp: z.string().optional(),
  nomor_wa: z.string().optional(),
  custom_alias: z.string().optional(),
});
export type ManualFormValues = z.infer<typeof manualCounterpartySchema>;

// settings.tsx
export const entityProfileSchema = z.object({
  nama_utama: z.string().min(1, "Nama bisnis wajib diisi."),
  nomor_wa: z.string().optional(),
  nik_npwp: z.string().optional(),
  alamat_lengkap: z.string().optional(),
  bidang_usaha: z.string().optional(),
  email: z.string().email("Format email tidak valid.").or(z.literal("")),
  website: z.string().optional(),
  description: z.string().optional(),
});
export type EntityProfileForm = z.infer<typeof entityProfileSchema>;

// users.tsx
export const inviteSchema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  role_id: z.string().min(1, "Pilih role untuk anggota baru."),
});
export type InviteFormValues = z.infer<typeof inviteSchema>;

export const roleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi."),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Pilih minimal satu permission."),
});
export type RoleFormValues = z.infer<typeof roleSchema>;

// workspaces.new.tsx
export const workspaceSchema = z.object({
  nama_utama: z.string().min(3, "Nama badan usaha minimal 3 karakter."),
  nik_npwp: z
    .string()
    .min(15, "NIK / NPWP minimal 15 digit angka.")
    .regex(/^\d+$/, "Hanya angka."),
  nomor_wa: z
    .string()
    .regex(
      /^\+62\d{9,13}$/,
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
  alamat_lengkap: z.string().min(10, "Alamat lengkap minimal 10 karakter."),
});
export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

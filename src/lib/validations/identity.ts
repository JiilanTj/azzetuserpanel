import { z } from "zod/v4";

export const legalIDSchema = z.object({
  id_type: z.enum(["NPWP", "NIB", "SIUP", "KTP", "AKTA"], {
    message: "Pilih jenis identitas",
  }),
  id_value: z.string().min(1, "Nomor identitas wajib diisi"),
});
export type LegalIDForm = z.infer<typeof legalIDSchema>;

export const aliasSchema = z.object({
  alias: z.string().min(2, "Alias minimal 2 karakter"),
});
export type AliasForm = z.infer<typeof aliasSchema>;

export const createClaimSchema = z.object({
  entity_id: z.string().min(1, "Pilih entitas yang ingin diklaim"),
  notes: z.string().optional(),
});
export type CreateClaimForm = z.infer<typeof createClaimSchema>;

export const disputeClaimSchema = z.object({
  reason: z.string().min(10, "Alasan dispute minimal 10 karakter"),
});
export type DisputeClaimForm = z.infer<typeof disputeClaimSchema>;

export const counterpartyAliasSchema = z.object({
  custom_alias: z.string().min(1, "Alias wajib diisi"),
});
export type CounterpartyAliasForm = z.infer<typeof counterpartyAliasSchema>;

export const fuzzySearchSchema = z.object({
  q: z.string().min(3, "Ketik minimal 3 karakter untuk mencari"),
});
export type FuzzySearchForm = z.infer<typeof fuzzySearchSchema>;

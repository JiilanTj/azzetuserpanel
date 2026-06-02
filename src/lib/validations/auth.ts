import { z } from "zod/v4";

// login.tsx
export const loginEmailSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});
export type LoginEmailForm = z.infer<typeof loginEmailSchema>;

export const requestOtpSchema = z.object({
  whatsapp: z
    .string()
    .regex(
      /^\+62\d{9,13}$/,
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
});
export type RequestOtpForm = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier tidak boleh kosong"),
  otp: z
    .string()
    .length(6, "Kode OTP harus berisi 6 digit angka.")
    .regex(/^\d+$/, "Hanya angka."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

// register.tsx
export const registerSchema = z.object({
  name: z.string().min(2, "Nama harus berisi minimal 2 karakter."),
  method: z.enum(["email", "whatsapp"]),
  email: z
    .string()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Format email tidak valid.",
    }),
  whatsapp: z
    .string()
    .refine(
      (v) => v === "" || /^\+62\d{9,13}$/.test(v),
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
  password: z.string().min(8, "Password minimal 8 karakter."),
  confirm_password: z.string().min(1, "Konfirmasi password wajib diisi."),
});
export type RegisterForm = z.infer<typeof registerSchema>;

// forgot-password.tsx
export const requestSchema = z.object({
  identifier: z.string().min(1, "Email / WhatsApp wajib diisi"),
});
export type RequestForm = z.infer<typeof requestSchema>;

export const resetSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  new_password: z.string().min(8, "Password minimal 8 karakter"),
  confirm_password: z.string().min(1, "Konfirmasi wajib diisi"),
});
export type ResetForm = z.infer<typeof resetSchema>;

// verify-email.tsx / verify-whatsapp.tsx
export const verifySearchSchema = z.object({
  identifier: z.string().min(1, "Identifier tidak boleh kosong").catch(""),
});
export type VerifySearch = z.infer<typeof verifySearchSchema>;

// settings.tsx
export const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Password lama wajib diisi."),
    new_password: z.string().min(8, "Password baru minimal 8 karakter."),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm_password"],
  });
export type PasswordForm = z.infer<typeof passwordSchema>;

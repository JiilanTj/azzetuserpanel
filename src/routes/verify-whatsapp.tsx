import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRightIcon, MobileIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { rootRoute } from "./__root";
import { useVerifyOTP } from "@/hooks/use-auth";
import logoSvg from "@/assets/logo.svg";

const verifySearchSchema = z.object({
  identifier: z.string().default(""),
});

export const verifyWhatsappRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-whatsapp",
  validateSearch: verifySearchSchema,
  component: VerifyWhatsappPage,
});

const verifyOtpSchema = z.object({
  identifier: z
    .string()
    .regex(
      /^\+62\d{9,13}$/,
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
  otp: z
    .string()
    .length(6, "Kode OTP harus berisi 6 digit angka.")
    .regex(/^\d+$/, "Hanya angka."),
});

type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

function VerifyWhatsappPage() {
  const navigate = useNavigate();
  const search = verifyWhatsappRoute.useSearch();
  const verifyOtpMutation = useVerifyOTP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { identifier: search.identifier, otp: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    await verifyOtpMutation.mutateAsync(
      {
        identifier: data.identifier,
        otp: data.otp,
        purpose: "verify_whatsapp",
      },
      {
        onSuccess: () => {
          toast.success("Akun Anda berhasil diverifikasi! Silakan masuk.");
          navigate({ to: "/login" });
        },
      },
    );
  });

  const inputCls = (hasError: boolean) =>
    cn(
      "flex h-10 w-full rounded-lg border px-3 text-sm",
      "bg-(--gray-1) text-(--gray-12) placeholder:text-(--gray-9)",
      "transition-all duration-200 outline-none",
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-400/50"
        : "border-(--gray-6) hover:border-(--gray-8) focus:ring-2 focus:ring-(--blue-9) focus:border-(--blue-8)",
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-100 rounded-2xl border border-(--gray-5) bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-4" />
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
            <MobileIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
            Verifikasi WhatsApp
          </h2>
          <p className="text-sm text-(--gray-10)">
            Masukkan 6 digit kode OTP yang dikirimkan ke nomor WhatsApp Anda
            untuk mengaktifkan akun.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {/* WhatsApp Identifier */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="verify-whatsapp-input"
              className="text-sm font-medium text-(--gray-12)"
            >
              Nomor WhatsApp
            </label>
            <input
              id="verify-whatsapp-input"
              type="tel"
              placeholder="+628123456789"
              {...register("identifier")}
              className={inputCls(!!errors.identifier)}
            />
            {errors.identifier && (
              <p className="text-xs text-red-500">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* OTP Code */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="otp-input"
              className="text-sm font-medium text-(--gray-12)"
            >
              Kode Verifikasi OTP
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              {...register("otp")}
              className={cn(
                inputCls(!!errors.otp),
                "text-center text-xl font-bold tracking-[0.5em] h-12",
              )}
            />
            {errors.otp && (
              <p className="text-xs text-red-500">{errors.otp.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="solid"
            size="3"
            loading={verifyOtpMutation.isPending}
            className="w-full"
            rightIcon={
              !verifyOtpMutation.isPending ? <ArrowRightIcon /> : undefined
            }
          >
            {verifyOtpMutation.isPending ? "Verifikasi…" : "Verifikasi Akun"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-(--gray-9)">
          Kembali ke{" "}
          <Link
            to="/login"
            className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors"
          >
            Halaman Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

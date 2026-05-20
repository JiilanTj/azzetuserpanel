import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowRightIcon,
  MobileIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { rootRoute } from "./__root";
import { useRequestOTP, useResetPassword } from "@/hooks/use-auth";
import logoSvg from "@/assets/logo.svg";

export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

const requestSchema = z.object({
  whatsapp: z
    .string()
    .regex(
      /^\+62\d{9,13}$/,
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
});

const resetSchema = z.object({
  otp: z
    .string()
    .length(6, "Kode OTP harus berisi 6 digit angka.")
    .regex(/^\d+$/, "Hanya angka."),
  new_password: z.string().min(8, "Password baru minimal 8 karakter."),
});

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Step = "request" | "reset";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [savedWhatsapp, setSavedWhatsapp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const requestOtpMutation = useRequestOTP();
  const resetPasswordMutation = useResetPassword();

  const {
    register: regReq,
    handleSubmit: handleReqSubmit,
    formState: { errors: re },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { whatsapp: "" },
  });

  const {
    register: regReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: rse },
    reset: resetResetForm,
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", new_password: "" },
  });

  const onRequestSubmit = handleReqSubmit(async (data) => {
    await requestOtpMutation.mutateAsync(
      {
        whatsapp: data.whatsapp,
        purpose: "reset_password",
      },
      {
        onSuccess: () => {
          setSavedWhatsapp(data.whatsapp);
          setStep("reset");
          setTimeLeft(300); // 5 minutes
          resetResetForm();
        },
      },
    );
  });

  const onResetSubmit = handleResetSubmit(async (data) => {
    await resetPasswordMutation.mutateAsync(
      {
        identifier: savedWhatsapp,
        otp: data.otp,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    );
  });

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    await requestOtpMutation.mutateAsync(
      {
        whatsapp: savedWhatsapp,
        purpose: "reset_password",
      },
      {
        onSuccess: () => {
          setTimeLeft(300);
          toast.success("Kode OTP baru berhasil dikirim ke WhatsApp Anda.");
          resetResetForm();
        },
      },
    );
  };

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
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
            <MobileIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
            Lupa Password
          </h2>
          <p className="text-sm text-(--gray-10)">
            {step === "request"
              ? "Masukkan nomor WhatsApp terdaftar Anda untuk menerima kode OTP penyetelan ulang password."
              : `Masukkan kode OTP yang dikirimkan ke WhatsApp ${savedWhatsapp} serta password baru Anda.`}
          </p>
        </div>

        {step === "request" && (
          <form
            onSubmit={onRequestSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reset-whatsapp"
                className="text-sm font-medium text-(--gray-12)"
              >
                Nomor WhatsApp
              </label>
              <input
                id="reset-whatsapp"
                type="tel"
                placeholder="+628123456789"
                {...regReq("whatsapp")}
                className={inputCls(!!re.whatsapp)}
              />
              {re.whatsapp && (
                <p className="text-xs text-red-500">{re.whatsapp.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="solid"
              size="3"
              loading={requestOtpMutation.isPending}
              className="w-full"
              rightIcon={
                !requestOtpMutation.isPending ? <ArrowRightIcon /> : undefined
              }
            >
              {requestOtpMutation.isPending
                ? "Mengirim OTP…"
                : "Kirim Kode OTP"}
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form
            onSubmit={onResetSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* OTP Code */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reset-otp-input"
                className="text-sm font-medium text-(--gray-12)"
              >
                Kode OTP
              </label>
              <input
                id="reset-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                {...regReset("otp")}
                className={cn(
                  inputCls(!!rse.otp),
                  "text-center text-xl font-bold tracking-[0.5em] h-12",
                )}
              />
              {rse.otp && (
                <p className="text-xs text-red-500">{rse.otp.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-password-input"
                className="text-sm font-medium text-(--gray-12)"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="new-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...regReset("new_password")}
                  className={cn(inputCls(!!rse.new_password), "pr-10")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-9) hover:text-(--gray-12) transition-colors cursor-pointer"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeClosedIcon className="h-4 w-4" />
                  ) : (
                    <EyeOpenIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {rse.new_password && (
                <p className="text-xs text-red-500">
                  {rse.new_password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="solid"
              size="3"
              loading={resetPasswordMutation.isPending}
              className="w-full"
              rightIcon={
                !resetPasswordMutation.isPending ? (
                  <ArrowRightIcon />
                ) : undefined
              }
            >
              {resetPasswordMutation.isPending
                ? "Mengubah Password…"
                : "Setel Ulang Password"}
            </Button>

            <p className="text-center text-xs text-(--gray-9) mt-2">
              {timeLeft > 0 ? (
                `Kirim ulang kode dalam ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
              ) : (
                <span>
                  Tidak menerima kode?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resetPasswordMutation.isPending}
                    className="text-(--blue-11) hover:text-(--blue-9) font-semibold transition-colors cursor-pointer"
                  >
                    Kirim Ulang
                  </button>
                </span>
              )}
            </p>
          </form>
        )}

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

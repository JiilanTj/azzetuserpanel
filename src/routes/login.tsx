import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  EyeOpenIcon,
  EyeClosedIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  MobileIcon,
  EnvelopeClosedIcon,
  SunIcon,
  MoonIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui";
import { WhatsAppInput } from "@/components/ui/whatsapp-input";
import { cn } from "@/lib/utils";
import { rootRoute } from "./__root";
import { useLoginEmail, useLoginOTP, useRequestOTP } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { authMiddleware } from "@/middleware/auth.middleware";
import logoSvg from "@/assets/logo.svg";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: authMiddleware.requireGuest,
  component: LoginPage,
});

// ---- Zod schemas -----------------------------------------------

const loginEmailSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

const requestOtpSchema = z.object({
  whatsapp: z
    .string()
    .regex(
      /^\+62\d{9,13}$/,
      "Format nomor WhatsApp tidak valid. Harus diawali +62.",
    ),
});

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Kode OTP harus berisi 6 digit angka.")
    .regex(/^\d+$/, "Hanya angka."),
});

type LoginEmailForm = z.infer<typeof loginEmailSchema>;
type RequestOtpForm = z.infer<typeof requestOtpSchema>;
type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

type Method = "email" | "whatsapp";
type Step = "request-otp" | "verify-otp";

// ---- Left-panel metric card ------------------------------------

function MetricCard({
  label,
  value,
  change,
  positive = true,
  className,
}: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-2xl border border-white/10 px-4 py-3.5 shadow-xl w-48 transition-all duration-300 hover:scale-105",
        className,
      )}
      style={{
        backdropFilter: "blur(16px)",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-[11px] font-medium leading-none text-white/50 mb-2.5">
        {label}
      </p>
      <p className="text-[22px] font-bold leading-none text-white mb-2">
        {value}
      </p>
      <p
        className={cn(
          "text-[11px] font-medium leading-none",
          positive ? "text-emerald-400" : "text-red-400",
        )}
      >
        {change}
      </p>
    </div>
  );
}

const FEATURES = [
  "Kelola banyak entitas bisnis & workspace dengan mudah.",
  "Manajemen tagihan, invoice & rencana langganan otomatis.",
  "Kolaborasi tim dengan pembagian peran yang aman.",
];

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center h-10 w-10 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] text-[#6b7280] hover:text-[#1a1a1a] dark:text-[#9ca3af] dark:hover:text-white transition-colors cursor-pointer"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <SunIcon className="h-[18px] w-[18px]" />
      ) : (
        <MoonIcon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("email");
  const [otpStep, setOtpStep] = useState<Step>("request-otp");
  const [showPassword, setShowPassword] = useState(false);
  const [savedWhatsapp, setSavedWhatsapp] = useState("");

  // Countdown timer for OTP
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const loginEmailMutation = useLoginEmail();
  const requestOtpMutation = useRequestOTP();
  const loginOtpMutation = useLoginOTP();

  // ---- Forms ----
  const {
    register: regEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: ee },
  } = useForm<LoginEmailForm>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    handleSubmit: handleReqOtpSubmit,
    formState: { errors: we },
    watch: watchOtp,
    setValue: setOtpValue,
  } = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { whatsapp: "" },
  });

  const {
    register: regVerifyOtp,
    handleSubmit: handleVerifyOtpSubmit,
    formState: { errors: oe },
    reset: resetVerifyOtp,
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  // ---- Handlers ----

  const onEmailSubmit = handleEmailSubmit(async ({ email, password }) => {
    await loginEmailMutation.mutateAsync(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/setup" });
        },
      },
    );
  });

  const onReqOtpSubmit = handleReqOtpSubmit(async ({ whatsapp }) => {
    await requestOtpMutation.mutateAsync(
      { whatsapp, purpose: "login" },
      {
        onSuccess: () => {
          setSavedWhatsapp(whatsapp);
          setOtpStep("verify-otp");
          setTimeLeft(300); // 5 minutes
          resetVerifyOtp();
        },
      },
    );
  });

  const onVerifyOtpSubmit = handleVerifyOtpSubmit(async ({ otp }) => {
    await loginOtpMutation.mutateAsync(
      { whatsapp: savedWhatsapp, otp },
      {
        onSuccess: () => {
          navigate({ to: "/setup" });
        },
      },
    );
  });

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    await requestOtpMutation.mutateAsync(
      { whatsapp: savedWhatsapp, purpose: "login" },
      {
        onSuccess: () => {
          setTimeLeft(300);
          toast.success("Kode OTP berhasil dikirim ulang!");
          resetVerifyOtp();
        },
      },
    );
  };

  const isLoading =
    loginEmailMutation.isPending ||
    requestOtpMutation.isPending ||
    loginOtpMutation.isPending;

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
    <div className="min-h-screen flex bg-background">
      {/* ===================================================== */}
      {/* LEFT — branded panel                                   */}
      {/* ===================================================== */}
      <div
        className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col"
        style={{
          background:
            "linear-gradient(145deg, #0b1530 0%, #0f2060 45%, #1a3a8f 100%)",
        }}
      >
        <div
          className="absolute -top-32 -left-32 h-125 w-125 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-100 w-100 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <MetricCard
          label="Total Penjualan"
          value="Rp48,2Jt"
          change="↑ 18.2% vs bulan lalu"
          positive
          className="top-[22%] right-[8%]"
        />
        <MetricCard
          label="Workspace Aktif"
          value="3 Bisnis"
          change="Semua berjalan lancar"
          positive
          className="top-[43%] right-[8%]"
        />
        <MetricCard
          label="Pembayaran Berhasil"
          value="100%"
          change="0 Transaksi tertunda"
          positive
          className="top-[64%] right-[8%]"
        />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Azzet" className="h-9 w-9" />
            <span className="text-xl font-bold text-white tracking-tight">
              Azzet OS
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30 text-blue-300 mb-6 w-fit animate-pulse"
              style={{ background: "rgba(59,130,246,0.12)" }}
            >
              User Portal · Multi-Tenant
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Kelola Bisnis Anda
              <br />
              <span style={{ color: "#60a5fa" }}>Lebih Efisien</span> dalam
              <br />
              Satu Dasbor.
            </h1>
            <p className="text-white/55 text-base leading-relaxed mb-10">
              Sistem manajemen B2B finansial dan pembukuan SaaS modern yang
              disesuaikan untuk perkembangan bisnis Anda.
            </p>
            <ul className="flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircledIcon
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#34d399" }}
                  />
                  <span className="text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Azzet Technologies. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* ===================================================== */}
      {/* RIGHT — form panel                                      */}
      {/* ===================================================== */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Theme Switcher */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src={logoSvg} alt="Azzet" className="h-8 w-8" />
          <span className="text-lg font-bold text-(--gray-12)">Azzet OS</span>
        </div>

        <div className="w-full max-w-100">
          {/* Method Selector Tabs */}
          {method === "email" || otpStep === "request-otp" ? (
            <div className="flex p-1 bg-(--gray-3) rounded-xl mb-8">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  method === "email"
                    ? "bg-surface text-(--gray-12) shadow-sm"
                    : "text-(--gray-10) hover:text-(--gray-12)",
                )}
              >
                <EnvelopeClosedIcon className="h-3.5 w-3.5" />
                Login Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("whatsapp");
                  setOtpStep("request-otp");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  method === "whatsapp"
                    ? "bg-surface text-(--gray-12) shadow-sm"
                    : "text-(--gray-10) hover:text-(--gray-12)",
                )}
              >
                <MobileIcon className="h-3.5 w-3.5" />
                Login WhatsApp OTP
              </button>
            </div>
          ) : null}

          {/* ========================= METHOD 1: Email + Password ========================= */}
          {method === "email" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
                  Sign In
                </h2>
                <p className="text-sm text-(--gray-10)">
                  Masuk ke akun Azzet kamu menggunakan email dan password.
                </p>
              </div>

              <form
                onSubmit={onEmailSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-email"
                    className="text-sm font-medium text-(--gray-12)"
                  >
                    Alamat Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    {...regEmail("email")}
                    className={inputCls(!!ee.email)}
                  />
                  {ee.email && (
                    <p className="text-xs text-red-500">{ee.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium text-(--gray-12)"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-(--blue-11) hover:text-(--blue-9) transition-colors font-medium"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...regEmail("password")}
                      className={cn(inputCls(!!ee.password), "pr-10")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-9) hover:text-(--gray-12) transition-colors cursor-pointer"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeClosedIcon className="h-4 w-4" />
                      ) : (
                        <EyeOpenIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {ee.password && (
                    <p className="text-xs text-red-500">
                      {ee.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="solid"
                  size="3"
                  loading={isLoading}
                  className="w-full mt-1"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}
                >
                  {isLoading ? "Masuk…" : "Masuk"}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-(--gray-9)">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </>
          )}

          {/* ========================= METHOD 2a: Request WhatsApp OTP ========================= */}
          {method === "whatsapp" && otpStep === "request-otp" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
                  Login OTP WA
                </h2>
                <p className="text-sm text-(--gray-10)">
                  Gunakan nomor WhatsApp aktif untuk masuk secara instan tanpa
                  password.
                </p>
              </div>

              <form
                onSubmit={onReqOtpSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                <WhatsAppInput
                  id="login-whatsapp"
                  value={watchOtp("whatsapp")}
                  onChange={(val) => setOtpValue("whatsapp", val, { shouldValidate: true })}
                  error={!!we.whatsapp}
                  errorMessage={we.whatsapp?.message}
                  hint="Masukkan nomor setelah +62, contoh: 8123456789"
                />

                <Button
                  type="submit"
                  variant="solid"
                  size="3"
                  loading={isLoading}
                  className="w-full"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}
                >
                  {isLoading ? "Mengirim OTP…" : "Kirim Kode OTP"}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-(--gray-9)">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </>
          )}

          {/* ========================= METHOD 2b: Verify WhatsApp OTP ========================= */}
          {method === "whatsapp" && otpStep === "verify-otp" && (
            <>
              <button
                type="button"
                onClick={() => setOtpStep("request-otp")}
                className="flex items-center gap-1.5 text-xs text-(--gray-10) hover:text-(--gray-12) mb-8 transition-colors cursor-pointer"
              >
                ← Kembali ke ubah nomor
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 bg-(--blue-a3) border border-(--blue-a6)">
                  <MobileIcon className="h-5 w-5 text-(--blue-11)" />
                </div>
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
                  Verifikasi OTP
                </h2>
                <p className="text-sm text-(--gray-10)">
                  Masukkan 6 digit kode OTP yang telah kami kirimkan ke nomor{" "}
                  <strong className="text-(--gray-12)">{savedWhatsapp}</strong>{" "}
                  via WhatsApp.
                </p>
              </div>

              <form
                onSubmit={onVerifyOtpSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="otp-code"
                    className="text-sm font-medium text-(--gray-12)"
                  >
                    Kode OTP
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    {...regVerifyOtp("otp")}
                    className={cn(
                      inputCls(!!oe.otp),
                      "text-center text-xl font-bold tracking-[0.5em] h-12",
                    )}
                  />
                  {oe.otp && (
                    <p className="text-xs text-red-500">{oe.otp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="solid"
                  size="3"
                  loading={isLoading}
                  className="w-full"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}
                >
                  {isLoading ? "Verifikasi…" : "Verifikasi & Masuk"}
                </Button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-xs text-(--gray-9)">
                  {timeLeft > 0 ? (
                    `Kirim ulang kode dalam ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                  ) : (
                    <span>
                      Tidak menerima kode?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-(--blue-11) hover:text-(--blue-9) font-semibold transition-colors cursor-pointer"
                      >
                        Kirim Ulang
                      </button>
                    </span>
                  )}
                </p>

                <div className="w-full flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-(--gray-5)" />
                  <span className="text-[10px] text-(--gray-9) shrink-0">
                    atau
                  </span>
                  <div className="flex-1 h-px bg-(--gray-5)" />
                </div>

                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className="text-xs text-(--blue-11) hover:text-(--blue-9) font-semibold transition-colors cursor-pointer"
                >
                  Masuk dengan password saja
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

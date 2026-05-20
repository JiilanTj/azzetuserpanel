import { useState } from "react";
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
  EnvelopeClosedIcon,
  MobileIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { rootRoute } from "./__root";
import { useRegister } from "@/hooks/use-auth";
import { authMiddleware } from "@/middleware/auth.middleware";
import logoSvg from "@/assets/logo.svg";

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: authMiddleware.requireGuest,
  component: RegisterPage,
});

// ---- Zod schema -----------------------------------------------

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama harus berisi minimal 2 karakter."),
    method: z.enum(["email", "whatsapp"]),
    email: z.string().email("Format email tidak valid.").optional(),
    whatsapp: z
      .string()
      .regex(
        /^\+62\d{9,13}$/,
        "Format nomor WhatsApp tidak valid. Harus diawali +62.",
      )
      .optional(),
    password: z.string().min(8, "Password minimal 8 karakter."),
  })
  .refine(
    (data) => {
      if (data.method === "email" && !data.email) return false;
      if (data.method === "whatsapp" && !data.whatsapp) return false;
      return true;
    },
    {
      message: "Isian sesuai metode terpilih wajib diisi.",
      path: ["method"],
    },
  );

type RegisterForm = z.infer<typeof registerSchema>;

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

function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: regForm,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      method: "email",
      email: "",
      whatsapp: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      password: data.password,
      ...(data.method === "email"
        ? { email: data.email }
        : { whatsapp: data.whatsapp }),
    };

    await registerMutation.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Pendaftaran berhasil! Silakan verifikasi akun Anda.");
        if (data.method === "email") {
          navigate({ to: "/verify-email", search: { identifier: data.email } });
        } else {
          navigate({
            to: "/verify-whatsapp",
            search: { identifier: data.whatsapp },
          });
        }
      },
    });
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
              Mulai Langkah Baru
              <br />
              <span style={{ color: "#60a5fa" }}>Bisnis Anda</span> Sekarang.
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
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src={logoSvg} alt="Azzet" className="h-8 w-8" />
          <span className="text-lg font-bold text-(--gray-12)">Azzet OS</span>
        </div>

        <div className="w-full max-w-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">
              Buat Akun Baru
            </h2>
            <p className="text-sm text-(--gray-10)">
              Daftar sekarang untuk mulai mengelola bisnis Anda dengan mudah.
            </p>
          </div>

          {/* Registration Method Selector */}
          <div className="flex p-1 bg-(--gray-3) rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setValue("method", "email");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                method === "email"
                  ? "bg-surface text-(--gray-12) shadow-sm"
                  : "text-(--gray-10) hover:text-(--gray-12)",
              )}
            >
              <EnvelopeClosedIcon className="h-3.5 w-3.5" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("whatsapp");
                setValue("method", "whatsapp");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                method === "whatsapp"
                  ? "bg-surface text-(--gray-12) shadow-sm"
                  : "text-(--gray-10) hover:text-(--gray-12)",
              )}
            >
              <MobileIcon className="h-3.5 w-3.5" />
              WhatsApp
            </button>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-name"
                className="text-sm font-medium text-(--gray-12)"
              >
                Nama Lengkap
              </label>
              <input
                id="reg-name"
                type="text"
                placeholder="Jiilan Nashrulloh"
                {...regForm("name")}
                className={inputCls(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            {method === "email" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reg-email"
                  className="text-sm font-medium text-(--gray-12)"
                >
                  Alamat Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="nama@email.com"
                  {...regForm("email")}
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* WhatsApp Field */}
            {method === "whatsapp" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reg-whatsapp"
                  className="text-sm font-medium text-(--gray-12)"
                >
                  Nomor WhatsApp
                </label>
                <input
                  id="reg-whatsapp"
                  type="tel"
                  placeholder="+628123456789"
                  {...regForm("whatsapp")}
                  className={inputCls(!!errors.whatsapp)}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500">
                    {errors.whatsapp.message}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-password"
                className="text-sm font-medium text-(--gray-12)"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...regForm("password")}
                  className={cn(inputCls(!!errors.password), "pr-10")}
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
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="solid"
              size="3"
              loading={registerMutation.isPending}
              className="w-full mt-1"
              rightIcon={
                !registerMutation.isPending ? <ArrowRightIcon /> : undefined
              }
            >
              {registerMutation.isPending ? "Mendaftar…" : "Daftar Sekarang"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-(--gray-9)">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

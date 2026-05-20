import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createRoute } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  useMe,
  useSessions,
  useRevokeSession,
  useChangePassword,
  useLogoutAll,
} from "@/hooks/use-auth";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  LockClosedIcon,
  DesktopIcon,
  MobileIcon,
  TrashIcon,
  ExitIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

export const settingsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/settings",
  component: SettingsPage,
});

// ---- Password Change Schema ----
const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Password lama wajib diisi."),
    new_password: z.string().min(8, "Password baru minimal 8 karakter."),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm_password"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Pengaturan
        </h1>
        <p className="text-sm text-(--gray-10)">
          Kelola profil, keamanan, dan sesi aktif akun Anda.
        </p>
      </div>

      <ProfileSection />
      <PasswordSection />
      <SessionsSection />
    </div>
  );
}

// ---- Profile Section ----
function ProfileSection() {
  const { data: user } = useMe();

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <PersonIcon className="h-4 w-4 text-(--gray-9)" />
        <h2 className="text-sm font-semibold text-(--gray-12)">Profil Akun</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-(--gray-9) mb-0.5">Nama</p>
          <p className="text-sm font-medium text-(--gray-12)">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-(--gray-9) mb-0.5">Email</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-(--gray-12)">
              {user.email || "-"}
            </p>
            {user.email && (
              <Badge
                variant={user.email_verified ? "success" : "warning"}
                className="text-[10px]"
              >
                {user.email_verified ? "Terverifikasi" : "Belum Verifikasi"}
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-(--gray-9) mb-0.5">WhatsApp</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-(--gray-12)">
              {user.whatsapp || "-"}
            </p>
            {user.whatsapp && (
              <Badge
                variant={user.whatsapp_verified ? "success" : "warning"}
                className="text-[10px]"
              >
                {user.whatsapp_verified ? "Terverifikasi" : "Belum Verifikasi"}
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-(--gray-9) mb-0.5">Status Akun</p>
          <Badge variant={user.status === "ACTIVE" ? "success" : "warning"}>
            {user.status === "ACTIVE" ? "Aktif" : user.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ---- Password Section ----
function PasswordSection() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    await changePasswordMutation.mutateAsync(
      {
        old_password: data.old_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => reset(),
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
    <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <LockClosedIcon className="h-4 w-4 text-(--gray-9)" />
        <h2 className="text-sm font-semibold text-(--gray-12)">
          Ubah Password
        </h2>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4 max-w-md"
      >
        {/* Old Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="old-password"
            className="text-sm font-medium text-(--gray-12)"
          >
            Password Lama
          </label>
          <div className="relative">
            <input
              id="old-password"
              type={showOld ? "text" : "password"}
              placeholder="••••••••"
              {...register("old_password")}
              className={cn(inputCls(!!errors.old_password), "pr-10")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowOld((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-9) hover:text-(--gray-12) transition-colors cursor-pointer"
            >
              {showOld ? (
                <EyeClosedIcon className="h-4 w-4" />
              ) : (
                <EyeOpenIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.old_password && (
            <p className="text-xs text-red-500">
              {errors.old_password.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-(--gray-12)"
          >
            Password Baru
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              {...register("new_password")}
              className={cn(inputCls(!!errors.new_password), "pr-10")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-9) hover:text-(--gray-12) transition-colors cursor-pointer"
            >
              {showNew ? (
                <EyeClosedIcon className="h-4 w-4" />
              ) : (
                <EyeOpenIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-xs text-red-500">
              {errors.new_password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-(--gray-12)"
          >
            Konfirmasi Password Baru
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            {...register("confirm_password")}
            className={inputCls(!!errors.confirm_password)}
          />
          {errors.confirm_password && (
            <p className="text-xs text-red-500">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="solid"
          size="2"
          loading={changePasswordMutation.isPending}
          className="w-fit mt-2"
        >
          {changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
        </Button>
      </form>
    </div>
  );
}

// ---- Sessions Section ----
function SessionsSection() {
  const { data: sessions, isLoading } = useSessions();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();

  return (
    <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DesktopIcon className="h-4 w-4 text-(--gray-9)" />
          <h2 className="text-sm font-semibold text-(--gray-12)">Sesi Aktif</h2>
        </div>
        <Button
          variant="outline"
          size="1"
          loading={logoutAllMutation.isPending}
          onClick={() => logoutAllMutation.mutate()}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30"
        >
          <ExitIcon className="h-3 w-3 mr-1" />
          Keluar Semua
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <p className="text-sm text-(--gray-9) text-center py-8">
          Tidak ada sesi aktif.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl border border-(--gray-3) bg-(--gray-1) hover:bg-(--gray-2) transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-(--gray-3)">
                  {session.device_name?.toLowerCase().includes("mobile") ? (
                    <MobileIcon className="h-4 w-4 text-(--gray-11)" />
                  ) : (
                    <DesktopIcon className="h-4 w-4 text-(--gray-11)" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-(--gray-12)">
                    {session.device_name || "Perangkat Tidak Dikenal"}
                  </p>
                  <p className="text-xs text-(--gray-9)">
                    {session.ip_address}
                    {" · "}
                    Terakhir aktif:{" "}
                    {new Date(session.last_used_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="1"
                loading={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(session.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

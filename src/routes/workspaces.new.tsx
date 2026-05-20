import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authedLayout } from "./_authed";
import { useCreateEntity, useCreateWorkspace } from "@/hooks/use-business";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";

export const workspacesNewRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/workspaces/new",
  component: CreateWorkspacePage,
});

const workspaceSchema = z.object({
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

type WorkspaceForm = z.infer<typeof workspaceSchema>;

function CreateWorkspacePage() {
  const navigate = useNavigate();
  const createEntityMutation = useCreateEntity();
  const createWorkspaceMutation = useCreateWorkspace();
  const { setActiveWorkspace } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      nama_utama: "",
      nik_npwp: "",
      nomor_wa: "",
      alamat_lengkap: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    // 1. Create Business Entity
    const entity = await createEntityMutation.mutateAsync({
      entity_type: "BADAN_USAHA",
      nama_utama: data.nama_utama,
      nik_npwp: data.nik_npwp,
      nomor_wa: data.nomor_wa,
      alamat_lengkap: data.alamat_lengkap,
    });

    // 2. Create Workspace linking to Entity
    const workspace = await createWorkspaceMutation.mutateAsync({
      entity_id: entity.id,
    });

    // 3. Set Active Workspace & Navigate
    setActiveWorkspace(workspace);
    toast.success(`Workspace "${data.nama_utama}" berhasil dibuat!`);
    navigate({ to: "/plans" });
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

  const isLoading =
    createEntityMutation.isPending || createWorkspaceMutation.isPending;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Buat Workspace Bisnis
        </h1>
        <p className="text-sm text-(--gray-10)">
          Mulai kelola perusahaan baru Anda dengan mengisi detail informasi
          resmi entitas usaha berikut.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-6 p-6 rounded-2xl border border-(--gray-4) bg-surface"
      >
        {/* Company Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="company-name"
            className="text-sm font-medium text-(--gray-12)"
          >
            Nama Perusahaan / Persekutuan (PT, CV, UD)
          </label>
          <input
            id="company-name"
            placeholder="PT Maju Mundur Sejahtera"
            {...register("nama_utama")}
            className={inputCls(!!errors.nama_utama)}
          />
          {errors.nama_utama && (
            <p className="text-xs text-red-500">{errors.nama_utama.message}</p>
          )}
        </div>

        {/* NIK / NPWP */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="npwp"
            className="text-sm font-medium text-(--gray-12)"
          >
            Nomor NIK / NPWP Perusahaan (15-16 Digit Angka)
          </label>
          <input
            id="npwp"
            placeholder="012345678901000"
            {...register("nik_npwp")}
            className={inputCls(!!errors.nik_npwp)}
          />
          {errors.nik_npwp && (
            <p className="text-xs text-red-500">{errors.nik_npwp.message}</p>
          )}
        </div>

        {/* Whatsapp */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="whatsapp"
            className="text-sm font-medium text-(--gray-12)"
          >
            Nomor WhatsApp Resmi Perusahaan
          </label>
          <input
            id="whatsapp"
            placeholder="+628111222333"
            {...register("nomor_wa")}
            className={inputCls(!!errors.nomor_wa)}
          />
          {errors.nomor_wa && (
            <p className="text-xs text-red-500">{errors.nomor_wa.message}</p>
          )}
        </div>

        {/* Alamat Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="address"
            className="text-sm font-medium text-(--gray-12)"
          >
            Alamat Lengkap Perusahaan
          </label>
          <textarea
            id="address"
            rows={3}
            placeholder="Jl. Sudirman Kav 21, Jakarta Selatan, DKI Jakarta"
            {...register("alamat_lengkap")}
            className={cn(
              "flex w-full rounded-lg border p-3 text-sm resize-none",
              "bg-(--gray-1) text-(--gray-12) placeholder:text-(--gray-9)",
              "transition-all duration-200 outline-none",
              errors.alamat_lengkap
                ? "border-red-500 focus:ring-2 focus:ring-red-400/50"
                : "border-(--gray-6) hover:border-(--gray-8) focus:ring-2 focus:ring-(--blue-9) focus:border-(--blue-8)",
            )}
          />
          {errors.alamat_lengkap && (
            <p className="text-xs text-red-500">
              {errors.alamat_lengkap.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="solid"
          size="3"
          loading={isLoading}
          className="w-full mt-2"
          leftIcon={!isLoading ? <PlusIcon className="h-4 w-4" /> : undefined}
        >
          {isLoading ? "Membuat Workspace…" : "Buat Workspace"}
        </Button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createRoute, Link } from "@tanstack/react-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  searchCounterpartySchema,
  manualCounterpartySchema,
  type SearchFormValues,
  type ManualFormValues,
} from "@/lib/validations";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  useCounterparties,
  useAddCounterparty,
  useSearchEntities,
} from "@/hooks/use-workspace";
import { useSetCounterpartyAlias, useDeleteCounterpartyAlias } from "@/hooks/use-identity";
import { counterpartyAliasSchema, type CounterpartyAliasForm } from "@/lib/validations";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  PersonIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AvatarIcon,
  HomeIcon,
  CheckIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";

export const counterpartiesRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/counterparties",
  component: CounterpartiesPage,
});

import { authedLayout } from "./_authed";
// schemas imported from @/lib/validations

function CounterpartiesPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: counterparties, isLoading } = useCounterparties(
    activeWorkspace?.entity_id,
  );
  const [filterType, setFilterType] = useState<"ALL" | "PELANGGAN" | "VENDOR">(
    "ALL",
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAliasTarget, setEditAliasTarget] = useState<{
    entity_id: string;
    entity_name: string;
    custom_alias?: string;
  } | null>(null);

  const filteredData = counterparties?.filter(
    (c) => filterType === "ALL" || c.relation_type === filterType,
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Pihak Ketiga (Counterparties)
          </h1>
          <p className="text-sm text-(--gray-10)">
            Kelola daftar pelanggan dan vendor/pemasok untuk pencatatan transaksi Anda.
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="solid"
          className="gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Tambah Pihak Ketiga
        </Button>
      </div>

      <div className="flex gap-2 border-b border-(--gray-4) pb-4">
        {(["ALL", "PELANGGAN", "VENDOR"] as const).map((type) => (
          <Button
            key={type}
            variant={filterType === type ? "solid" : "ghost"}
            size="2"
            onClick={() => setFilterType(type)}
            className={cn(
              "rounded-full px-4",
              filterType !== type && "text-(--gray-11) hover:text-(--gray-12) hover:bg-(--gray-3)"
            )}
          >
            {type === "ALL"
              ? "Semua"
              : type === "PELANGGAN"
                ? "Pelanggan"
                : "Vendor / Pemasok"}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
          </div>
        ) : !filteredData || filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PersonIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">
              Belum ada data pihak ketiga
            </p>
            <p className="text-xs text-(--gray-9)">
              Klik Tambah Pihak Ketiga untuk mulai menambahkan pelanggan atau vendor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Nama / Alias
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Tipe Entitas
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Relasi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Ditambahkan
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((cp) => (
                  <tr
                    key={cp.id}
                    className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-(--gray-12)">
                          {cp.custom_alias || cp.entity_name}
                        </p>
                        {cp.custom_alias && (
                          <p className="text-xs text-(--gray-9)">
                            {cp.entity_name}
                          </p>
                        )}
                        {cp.is_shadow && (
                          <Badge variant="soft" className="mt-1 text-[10px] px-1 py-0">Shadow Entity</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-(--gray-10)">
                      <div className="flex items-center gap-1.5">
                        {cp.entity_type === "BADAN_USAHA" ? (
                          <HomeIcon className="w-3.5 h-3.5" />
                        ) : (
                          <AvatarIcon className="w-3.5 h-3.5" />
                        )}
                        {cp.entity_type === "ORANG_PRIBADI"
                          ? "Pribadi"
                          : "Badan Usaha"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="solid"
                        className={
                          cp.relation_type === "PELANGGAN"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-100 text-indigo-800"
                        }
                      >
                        {cp.relation_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cp.status === "ACTIVE" ? "success" : "gray"}>
                        {cp.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-(--gray-10) text-xs">
                      {new Date(cp.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="1"
                          title="Edit alias"
                          onClick={() =>
                            setEditAliasTarget({
                              entity_id: cp.entity_id,
                              entity_name: cp.entity_name,
                              custom_alias: cp.custom_alias,
                            })
                          }
                        >
                          <Pencil1Icon className="h-3.5 w-3.5" />
                        </Button>
                        {cp.is_shadow && (
                          <Link to="/claims">
                            <Button variant="ghost" size="1" title="Klaim entitas">
                              Klaim
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddCounterpartyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {editAliasTarget && activeWorkspace && (
        <EditAliasDialog
          open={!!editAliasTarget}
          onOpenChange={(open) => !open && setEditAliasTarget(null)}
          workspaceId={activeWorkspace.entity_id}
          target={editAliasTarget}
        />
      )}
    </div>
  );
}

function AddCounterpartyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeWorkspace } = useWorkspaceStore();
  const addMutation = useAddCounterparty(activeWorkspace?.entity_id);
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Pihak Ketiga</DialogTitle>
          <DialogDescription>
            Pilih atau buat profil pihak ketiga (pelanggan/vendor) baru untuk workspace Anda.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "search" | "manual")} className="mt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="search">Cari Entitas Azzet</TabsTrigger>
            <TabsTrigger value="manual">Buat Entitas Baru (Manual)</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="pt-4">
            <SearchCounterpartyForm
              onSuccess={() => onOpenChange(false)}
              mutation={addMutation}
            />
          </TabsContent>

          <TabsContent value="manual" className="pt-4">
            <ManualCounterpartyForm
              onSuccess={() => onOpenChange(false)}
              mutation={addMutation}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SearchCounterpartyForm({ onSuccess, mutation }: { onSuccess: () => void; mutation: ReturnType<typeof useAddCounterparty> }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Handle Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading: isSearching } = useSearchEntities(
    debouncedQuery,
    debouncedQuery.length > 2
  );

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchCounterpartySchema),
    defaultValues: {
      relation_type: "PELANGGAN",
      entity_id: "",
      custom_alias: "",
    }
  });

  const selectedEntityId = useWatch({ control, name: "entity_id" });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync({
        entity_id: data.entity_id,
        relation_type: data.relation_type,
        custom_alias: data.custom_alias || undefined,
      });
      onSuccess();
    } catch {
      // Handled in mutation
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Controller
            control={control}
            name="relation_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger label="Sebagai (Relasi)" error={!!errors.relation_type}>
                  <SelectValue placeholder="Pilih Relasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PELANGGAN">Pelanggan</SelectItem>
                  <SelectItem value="VENDOR">Vendor / Pemasok</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Input
            label="Alias / Nama Panggilan (Opsional)"
            placeholder="Contoh: PT Maju (Cab. Bandung)"
            {...register("custom_alias")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Cari Profil Entitas Terdaftar"
          placeholder="Ketik minimal 3 karakter nama profil..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4 text-(--gray-9)" />}
        />

        {/* Search Results Area */}
        <div className="border border-(--gray-4) rounded-xl h-64 overflow-y-auto bg-(--gray-2) p-2">
          {debouncedQuery.length < 3 ? (
            <div className="flex h-full items-center justify-center text-sm text-(--gray-9)">
              Ketik minimal 3 karakter untuk mencari
            </div>
          ) : isSearching ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
            </div>
          ) : !searchResults || searchResults.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-(--gray-9)">
              Tidak ada profil entitas yang cocok.
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => setValue("entity_id", entity.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedEntityId === entity.id
                      ? "border-(--blue-6) bg-(--blue-2)"
                      : "border-transparent bg-surface hover:border-(--gray-5)"
                  )}
                >
                  <div>
                    <p className="font-medium text-sm text-(--gray-12)">{entity.nama_utama}</p>
                    <p className="text-xs text-(--gray-10)">
                      {entity.entity_type === "BADAN_USAHA" ? "Badan Usaha" : "Orang Pribadi"}
                      {entity.nik_npwp && ` • ${entity.nik_npwp}`}
                    </p>
                  </div>
                  {selectedEntityId === entity.id && (
                    <CheckIcon className="h-5 w-5 text-(--blue-9)" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.entity_id && (
          <p className="text-xs text-red-500 mt-1">{errors.entity_id.message as string}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>
          Batal
        </Button>
        <Button type="submit" variant="solid" loading={mutation.isPending}>
          Simpan Pihak Ketiga
        </Button>
      </div>
    </form>
  );
}

function ManualCounterpartyForm({ onSuccess, mutation }: { onSuccess: () => void; mutation: ReturnType<typeof useAddCounterparty> }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ManualFormValues>({
    resolver: zodResolver(manualCounterpartySchema),
    defaultValues: {
      relation_type: "PELANGGAN",
      entity_type: "BADAN_USAHA",
      nama_utama: "",
      nik_npwp: "",
      nomor_wa: "",
      custom_alias: "",
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data);
      onSuccess();
    } catch {
      // Handled in mutation
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="relation_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger label="Sebagai (Relasi)" error={!!errors.relation_type}>
                <SelectValue placeholder="Pilih Relasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PELANGGAN">Pelanggan</SelectItem>
                <SelectItem value="VENDOR">Vendor / Pemasok</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          control={control}
          name="entity_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger label="Tipe Entitas" error={!!errors.entity_type}>
                <SelectValue placeholder="Pilih Tipe Entitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BADAN_USAHA">Badan Usaha (PT/CV)</SelectItem>
                <SelectItem value="ORANG_PRIBADI">Orang Pribadi</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Input
        label="Nama Utama (Sesuai Identitas)"
        placeholder="Contoh: PT Teknologi Terdepan"
        error={!!errors.nama_utama}
        errorMessage={errors.nama_utama?.message}
        {...register("nama_utama")}
      />

      <Input
        label="Alias / Nama Panggilan (Opsional)"
        placeholder="Nama panggilan agar mudah dicari di platform"
        {...register("custom_alias")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="NIK / NPWP (Opsional)"
          placeholder="Nomor identitas pajak atau KTP"
          {...register("nik_npwp")}
        />

        <Input
          label="Nomor WhatsApp (Opsional)"
          placeholder="+6281..."
          {...register("nomor_wa")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onSuccess}>
          Batal
        </Button>
        <Button type="submit" variant="solid" loading={mutation.isPending}>
          Simpan Pihak Ketiga
        </Button>
      </div>
    </form>
  );
}

function EditAliasDialog({
  open,
  onOpenChange,
  workspaceId,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  target: { entity_id: string; entity_name: string; custom_alias?: string };
}) {
  const setAliasMutation = useSetCounterpartyAlias(workspaceId);
  const deleteAliasMutation = useDeleteCounterpartyAlias(workspaceId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CounterpartyAliasForm>({
    resolver: zodResolver(counterpartyAliasSchema),
    defaultValues: { custom_alias: target.custom_alias || target.entity_name },
  });

  useEffect(() => {
    reset({ custom_alias: target.custom_alias || target.entity_name });
  }, [target, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await setAliasMutation.mutateAsync({
      entity_id: target.entity_id,
      custom_alias: data.custom_alias,
    });
    onOpenChange(false);
  });

  const handleDeleteAlias = async () => {
    if (!target.custom_alias) return;
    if (!confirm(`Hapus alias kustom untuk "${target.entity_name}"?`)) return;
    await deleteAliasMutation.mutateAsync(target.entity_id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Alias Pihak Ketiga</DialogTitle>
          <DialogDescription>
            Alias kustom untuk <strong>{target.entity_name}</strong> di workspace Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Input
            label="Alias Kustom"
            placeholder="Nama panggilan di workspace..."
            error={!!errors.custom_alias}
            errorMessage={errors.custom_alias?.message}
            {...register("custom_alias")}
          />
          <div className="flex justify-between gap-2">
            {target.custom_alias && (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                loading={deleteAliasMutation.isPending}
                onClick={handleDeleteAlias}
              >
                Hapus Alias
              </Button>
            )}
            <div className="flex justify-end gap-2 ml-auto">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="solid" loading={setAliasMutation.isPending}>
                Simpan Alias
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

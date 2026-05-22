import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inviteSchema,
  roleSchema,
  type InviteFormValues,
  type RoleFormValues,
} from "@/lib/validations";
import { createRoute } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  useMembers,
  useUpdateMember,
  useRemoveMember,
  useInvites,
  useCreateInvite,
  useRevokeInvite,
  useRoles,
  useCreateRole,
  useAssignRole,
  useDeleteRole,
  useUpdateRole,
} from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/lib/api/types";
import {
  PersonIcon,
  TrashIcon,
  InfoCircledIcon,
  EnvelopeClosedIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

export const usersRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/users",
  component: UsersPage,
});

const statusConfig: Record<
  MemberStatus,
  { label: string; variant: "success" | "warning" | "gray" }
> = {
  ACTIVE: { label: "Aktif", variant: "success" },
  INACTIVE: { label: "Nonaktif", variant: "gray" },
};

// schemas imported from @/lib/validations

const AVAILABLE_PERMISSIONS = [
  { value: "transaction:create", label: "Buat Transaksi" },
  { value: "transaction:read", label: "Lihat Transaksi" },
  { value: "report:read", label: "Lihat Laporan Keuangan" },
  { value: "contact:manage", label: "Kelola Kontak / Pihak Ketiga" },
  { value: "member:manage", label: "Kelola Anggota / Tim" },
  { value: "billing:manage", label: "Kelola Langganan & Billing" },
];

function UsersPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
          Tim &amp; Akses Kontrol
        </h1>
        <p className="text-sm text-(--gray-10)">
          Undang rekan tim, tentukan wewenang role, dan kelola anggota workspace Anda.
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Daftar Anggota</TabsTrigger>
          <TabsTrigger value="invites">Undangan Pending</TabsTrigger>
          <TabsTrigger value="roles">Roles / Wewenang</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTabContent />
        </TabsContent>

        <TabsContent value="invites">
          <InvitesSection />
        </TabsContent>

        <TabsContent value="roles">
          <RolesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MembersTabContent() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: members, isLoading } = useMembers(activeWorkspace?.entity_id);
  const { data: roles } = useRoles(activeWorkspace?.entity_id);
  const updateMutation = useUpdateMember(activeWorkspace?.entity_id);
  const removeMutation = useRemoveMember(activeWorkspace?.entity_id);
  const assignRoleMutation = useAssignRole(activeWorkspace?.entity_id);

  const [selectedMember, setSelectedMember] = useState<{ id: string; custom_alias?: string; entity_name?: string } | null>(null);
  const [roleId, setRoleId] = useState<string>("");

  const handleToggleStatus = async (memberId: string, currentStatus: MemberStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateMutation.mutateAsync({ memberId, body: { status: newStatus } });
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Yakin ingin menghapus anggota ini dari workspace?")) return;
    await removeMutation.mutateAsync(memberId);
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !roleId) return;
    try {
      await assignRoleMutation.mutateAsync({
        member_entity_id: selectedMember.id,
        role_id: roleId,
      });
      setSelectedMember(null);
      setRoleId("");
    } catch {
      // Handled in mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner about invite */}
      <div className="flex items-start gap-3 rounded-xl border border-(--blue-4) bg-(--blue-2) p-4">
        <InfoCircledIcon className="h-4 w-4 text-(--blue-9) mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-(--gray-12) font-medium mb-0.5">
            Undang anggota baru via email
          </p>
          <p className="text-xs text-(--gray-10)">
            Untuk mengundang anggota baru, gunakan fitur undangan di menu tab "Undangan Pending".
            Undangan dikirim via email dan berlaku selama 24 jam. Penerima harus sudah memiliki akun Azzet.
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-(--gray-4)">
          <div className="flex items-center gap-2">
            <PersonIcon className="h-4 w-4 text-(--gray-9)" />
            <h2 className="text-sm font-semibold text-(--gray-12)">
              Daftar Anggota {members ? `(${members.length})` : ""}
            </h2>
          </div>
        </div>

        {!members || members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PersonIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">
              Belum ada anggota
            </p>
            <p className="text-xs text-(--gray-9)">
              Undang anggota tim untuk mulai berkolaborasi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Relasi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const status =
                    statusConfig[member.status] ?? statusConfig.ACTIVE;
                  const isOwner = member.relation_type === "PEMILIK";

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-(--gray-12)">
                            {member.custom_alias || member.entity_name}
                          </p>
                          {member.custom_alias && (
                            <p className="text-xs text-(--gray-9)">
                              {member.entity_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-(--gray-10)">
                        {member.entity_type === "ORANG_PRIBADI"
                          ? "Pribadi"
                          : "Badan Usaha"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isOwner ? "solid" : "soft"}>
                          {member.relation_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-(--gray-10) text-xs">
                        {member.role ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-(--gray-10) text-xs">
                        {new Date(member.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isOwner && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={() => {
                                setSelectedMember(member);
                                setRoleId(roles?.find((r) => r.name === member.role)?.id || "");
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              Ubah Role
                            </Button>
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={() => handleToggleStatus(member.id, member.status)}
                              loading={updateMutation.isPending}
                              className={cn(
                                "text-xs",
                                member.status === "ACTIVE"
                                  ? "text-amber-600 hover:text-amber-700"
                                  : "text-emerald-600 hover:text-emerald-700"
                              )}
                            >
                              {member.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="1"
                              loading={removeMutation.isPending}
                              onClick={() => handleRemove(member.id)}
                              className="text-(--gray-9) hover:text-red-600 cursor-pointer"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Role Anggota</DialogTitle>
            <DialogDescription>
              Pilih wewenang baru untuk {selectedMember?.custom_alias || selectedMember?.entity_name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignRoleSubmit} className="space-y-4 mt-2">
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger label="Pilih Role">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setSelectedMember(null)}>
                Batal
              </Button>
              <Button type="submit" variant="solid" loading={assignRoleMutation.isPending}>
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvitesSection() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: invites, isLoading } = useInvites(activeWorkspace?.entity_id);
  const { data: roles } = useRoles(activeWorkspace?.entity_id);
  const createInviteMutation = useCreateInvite(activeWorkspace?.entity_id);
  const revokeInviteMutation = useRevokeInvite(activeWorkspace?.entity_id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role_id: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createInviteMutation.mutateAsync(data);
      reset();
    } catch {
      // Handled in mutation
    }
  });

  const handleRevoke = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan undangan ini?")) return;
    try {
      await revokeInviteMutation.mutateAsync(id);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Form Card */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface p-6">
        <h3 className="text-sm font-semibold text-(--gray-12) mb-4">
          Undang Anggota Baru
        </h3>
        <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 items-end max-w-3xl">
          <div className="flex-1 w-full">
            <Input
              label="Email Penerima"
              placeholder="nama@perusahaan.com"
              error={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div className="w-full md:w-64">
            <Controller
              control={control}
              name="role_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    label="Role / Wewenang"
                    error={!!errors.role_id}
                    errorMessage={errors.role_id?.message}
                  >
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button
            type="submit"
            variant="solid"
            loading={createInviteMutation.isPending}
            className="w-full md:w-auto h-10 px-6 cursor-pointer"
          >
            Kirim Undangan
          </Button>
        </form>
      </div>

      {/* Invites Pending List */}
      <div className="rounded-2xl border border-(--gray-4) bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-(--gray-4)">
          <div className="flex items-center gap-2">
            <EnvelopeClosedIcon className="h-4 w-4 text-(--gray-9)" />
            <h2 className="text-sm font-semibold text-(--gray-12)">
              Undangan Pending
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
          </div>
        ) : !invites || invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <EnvelopeClosedIcon className="h-10 w-10 text-(--gray-7) mb-3" />
            <p className="text-sm font-medium text-(--gray-11) mb-1">
              Tidak ada undangan pending
            </p>
            <p className="text-xs text-(--gray-9)">
              Semua undangan telah diterima atau kadaluwarsa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-4) bg-(--gray-2)">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Email Tujuan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Role Ditawarkan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Dikirim Pada
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Kedaluwarsa
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-(--gray-11) uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="border-b border-(--gray-3) last:border-b-0 hover:bg-(--gray-2) transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-(--gray-12)">
                      {invite.invited_email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="soft">{invite.role_name}</Badge>
                    </td>
                    <td className="px-6 py-4 text-(--gray-10) text-xs">
                      {new Date(invite.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-(--gray-10) text-xs">
                      {new Date(invite.expires_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="1"
                        loading={revokeInviteMutation.isPending}
                        onClick={() => handleRevoke(invite.id)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Batalkan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RolesSection() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: roles, isLoading } = useRoles(activeWorkspace?.entity_id);
  const createRoleMutation = useCreateRole(activeWorkspace?.entity_id);
  const deleteRoleMutation = useDeleteRole(activeWorkspace?.entity_id);
  const updateRoleMutation = useUpdateRole(activeWorkspace?.entity_id);
  const [isOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description?: string; permissions: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const selectedPermissions = useWatch({ control, name: "permissions" }) || [];

  const handleCheckboxChange = (perm: string, checked: boolean) => {
    if (checked) {
      setValue("permissions", [...selectedPermissions, perm], { shouldValidate: true });
    } else {
      setValue(
        "permissions",
        selectedPermissions.filter((p) => p !== perm),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          id: editingRole.id,
          body: data,
        });
      } else {
        await createRoleMutation.mutateAsync(data);
      }
      setIsOpen(false);
      setEditingRole(null);
      reset();
    } catch {
      // Handled in mutation
    }
  });

  const handleDelete = async (roleId: string) => {
    if (!confirm("Yakin ingin menghapus role kustom ini? Anggota yang memiliki role ini harus di-assign ke role lain.")) return;
    try {
      await deleteRoleMutation.mutateAsync(roleId);
    } catch {
      // Handled in mutation
    }
  };

  const handleEditClick = (role: { id: string; name: string; description?: string; permissions: string[] }) => {
    setEditingRole(role);
    reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingRole(null);
      reset({
        name: "",
        description: "",
        permissions: [],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Roles List Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-(--gray-12)">
            Roles &amp; Wewenang Workspace
          </h3>
          <p className="text-xs text-(--gray-10) mt-0.5">
            Daftar role bawaan sistem dan kustom untuk membatasi akses anggota.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} variant="solid" size="2" className="gap-1.5 cursor-pointer">
          <PlusIcon className="h-4 w-4" />
          Role Kustom Baru
        </Button>
      </div>

      {/* Roles Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-(--blue-9) border-t-transparent" />
        </div>
      ) : !roles || roles.length === 0 ? (
        <p className="text-sm text-(--gray-10) text-center py-6">
          Belum ada role di workspace ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-(--gray-4) bg-surface p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="solid">{role.name}</Badge>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="1"
                      onClick={() => handleEditClick(role)}
                      className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="1"
                      onClick={() => handleDelete(role.id)}
                      className="text-xs text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-(--gray-10)">
                  {role.description || "Tidak ada deskripsi."}
                </p>
              </div>
              <div className="space-y-1.5 border-t border-(--gray-3) pt-3">
                <p className="text-[11px] font-semibold text-(--gray-11) uppercase tracking-wider">
                  Daftar Izin (Permissions):
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="soft" className="text-[10px] py-0 px-1.5 font-mono">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role Kustom" : "Buat Role Kustom"}</DialogTitle>
            <DialogDescription>
              Tentukan nama, deskripsi, dan izin spesifik untuk role ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            <Input
              label="Nama Role"
              placeholder="Staf Keuangan / Kasir Toko"
              error={!!errors.name}
              errorMessage={errors.name?.message}
              {...register("name")}
            />
            <Textarea
              label="Deskripsi"
              placeholder="Role ini hanya diperbolehkan menginput transaksi saja..."
              error={!!errors.description}
              errorMessage={errors.description?.message}
              {...register("description")}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--gray-12)">
                Daftar Hak Akses (Izin)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-(--gray-4) rounded-xl p-3 bg-(--gray-1)">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label key={perm.value} className="flex items-center gap-2 text-xs text-(--gray-11) hover:text-(--gray-12) cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.value)}
                      onChange={(e) => handleCheckboxChange(perm.value, e.target.checked)}
                      className="rounded border-(--gray-6) text-(--blue-9) focus:ring-(--blue-9)"
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-xs text-red-500">{errors.permissions.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="solid" loading={createRoleMutation.isPending || updateRoleMutation.isPending}>
                Simpan Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}



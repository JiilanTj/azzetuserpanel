import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  useMembers,
  useInviteMember,
  useUpdateMember,
  useRemoveMember,
} from "@/hooks/use-business";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WorkspaceRole, MemberStatus } from "@/lib/api/types";
import {
  PersonIcon,
  PlusIcon,
  TrashIcon,
  Pencil1Icon,
  Cross2Icon,
} from "@radix-ui/react-icons";

export const usersRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: "/users",
  component: UsersPage,
});

const roleLabels: Record<WorkspaceRole, string> = {
  PEMILIK: "Pemilik",
  KASIR: "Kasir",
  AKUNTAN: "Akuntan",
  VIEWER: "Viewer",
};

const statusConfig: Record<
  MemberStatus,
  { label: string; variant: "success" | "warning" | "gray" }
> = {
  active: { label: "Aktif", variant: "success" },
  invited: { label: "Diundang", variant: "warning" },
  suspended: { label: "Ditangguhkan", variant: "gray" },
};

function UsersPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: members, isLoading } = useMembers(activeWorkspace?.id);
  const inviteMutation = useInviteMember(activeWorkspace?.id);
  const updateMutation = useUpdateMember(activeWorkspace?.id);
  const removeMutation = useRemoveMember(activeWorkspace?.id);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<WorkspaceRole>("VIEWER");

  // Invite form state
  const [inviteEntityId, setInviteEntityId] = useState("");
  const [inviteAlias, setInviteAlias] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("VIEWER");

  const handleInvite = async () => {
    if (!inviteEntityId.trim()) return;
    await inviteMutation.mutateAsync(
      {
        entity_id: inviteEntityId.trim(),
        custom_alias: inviteAlias.trim() || undefined,
        role: inviteRole,
      },
      {
        onSuccess: () => {
          setShowInviteForm(false);
          setInviteEntityId("");
          setInviteAlias("");
          setInviteRole("VIEWER");
        },
      },
    );
  };

  const handleUpdateRole = async (memberId: string) => {
    await updateMutation.mutateAsync(
      { memberId, body: { role: editRole } },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Yakin ingin menghapus anggota ini dari workspace?")) return;
    await removeMutation.mutateAsync(memberId);
  };

  const inputCls = cn(
    "flex h-9 w-full rounded-lg border px-3 text-sm",
    "bg-(--gray-1) text-(--gray-12) placeholder:text-(--gray-9)",
    "transition-all duration-200 outline-none",
    "border-(--gray-6) hover:border-(--gray-8) focus:ring-2 focus:ring-(--blue-9) focus:border-(--blue-8)",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Anggota Workspace
          </h1>
          <p className="text-sm text-(--gray-10)">
            Kelola tim dan atur peran akses untuk workspace ini.
          </p>
        </div>
        <Button
          variant="solid"
          size="2"
          onClick={() => setShowInviteForm(true)}
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          Tambah Anggota
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="rounded-2xl border border-(--blue-6) bg-(--blue-2) p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-(--gray-12)">
              Undang Anggota Baru
            </h3>
            <button
              onClick={() => setShowInviteForm(false)}
              className="text-(--gray-9) hover:text-(--gray-12) cursor-pointer"
            >
              <Cross2Icon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--gray-11)">
                Entity ID
              </label>
              <input
                type="text"
                placeholder="UUID entitas anggota"
                value={inviteEntityId}
                onChange={(e) => setInviteEntityId(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--gray-11)">
                Alias (opsional)
              </label>
              <input
                type="text"
                placeholder="Nama panggilan"
                value={inviteAlias}
                onChange={(e) => setInviteAlias(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--gray-11)">
                Peran
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                className={inputCls}
              >
                <option value="VIEWER">Viewer</option>
                <option value="KASIR">Kasir</option>
                <option value="AKUNTAN">Akuntan</option>
                <option value="PEMILIK">Pemilik</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="solid"
              size="2"
              loading={inviteMutation.isPending}
              onClick={handleInvite}
            >
              Undang
            </Button>
          </div>
        </div>
      )}

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
                    Peran
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
                    statusConfig[member.status] ?? statusConfig.active;
                  const isEditing = editingId === member.id;

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
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) =>
                                setEditRole(e.target.value as WorkspaceRole)
                              }
                              className="h-7 rounded border border-(--gray-6) bg-(--gray-1) text-xs px-2"
                            >
                              <option value="VIEWER">Viewer</option>
                              <option value="KASIR">Kasir</option>
                              <option value="AKUNTAN">Akuntan</option>
                              <option value="PEMILIK">Pemilik</option>
                            </select>
                            <Button
                              size="1"
                              variant="solid"
                              onClick={() => handleUpdateRole(member.id)}
                              loading={updateMutation.isPending}
                            >
                              Simpan
                            </Button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-(--gray-9) hover:text-(--gray-12) cursor-pointer"
                            >
                              <Cross2Icon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Badge variant="soft">
                            {roleLabels[member.role]}
                          </Badge>
                        )}
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
                        {member.role !== "PEMILIK" && !isEditing && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="1"
                              onClick={() => {
                                setEditingId(member.id);
                                setEditRole(member.role);
                              }}
                              className="text-(--gray-9) hover:text-(--blue-11)"
                            >
                              <Pencil1Icon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="1"
                              loading={removeMutation.isPending}
                              onClick={() => handleRemove(member.id)}
                              className="text-(--gray-9) hover:text-red-600"
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
    </div>
  );
}

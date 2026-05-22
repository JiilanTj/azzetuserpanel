import { createRoute } from "@tanstack/react-router";
import { authedLayout } from "./_authed";
import {
  useMembers,
  useUpdateMember,
  useRemoveMember,
} from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/lib/api/types";
import {
  PersonIcon,
  TrashIcon,
  InfoCircledIcon,
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

function UsersPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: members, isLoading } = useMembers(activeWorkspace?.entity_id);
  const updateMutation = useUpdateMember(activeWorkspace?.entity_id);
  const removeMutation = useRemoveMember(activeWorkspace?.entity_id);

  const handleToggleStatus = async (memberId: string, currentStatus: MemberStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateMutation.mutateAsync({ memberId, body: { status: newStatus } });
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Yakin ingin menghapus anggota ini dari workspace?")) return;
    await removeMutation.mutateAsync(memberId);
  };

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
            Kelola tim dan atur akses untuk workspace ini.
          </p>
        </div>
      </div>

      {/* Info banner about invite */}
      <div className="flex items-start gap-3 rounded-xl border border-(--blue-4) bg-(--blue-2) p-4">
        <InfoCircledIcon className="h-4 w-4 text-(--blue-9) mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-(--gray-12) font-medium mb-0.5">
            Undang anggota baru via email
          </p>
          <p className="text-xs text-(--gray-10)">
            Untuk mengundang anggota baru, gunakan fitur undangan di menu Roles &amp; Invites.
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

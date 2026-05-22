import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '@/lib/api/services'
import type {
  CreateEntityRequest,
  CreateWorkspaceRequest,
  UpdateMemberRequest,
} from '@/lib/api/types'

export const workspaceKeys = {
  all: ['workspace'] as const,
  workspaces: () => [...workspaceKeys.all, 'list'] as const,
  members: (workspaceId: string) => [...workspaceKeys.all, 'members', workspaceId] as const,
}

// -------------------------------------------------------
// Entity Hooks
// -------------------------------------------------------

export function useCreateEntity() {
  return useMutation({
    mutationFn: (body: CreateEntityRequest) => workspaceService.createEntity(body),
    onError: (err: unknown) => {
      toast.error('Gagal membuat entitas bisnis', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Workspace Hooks
// -------------------------------------------------------

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.workspaces(),
    queryFn: () => workspaceService.listWorkspaces(),
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkspaceRequest) => workspaceService.createWorkspace(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.workspaces() })
    },
    onError: (err: unknown) => {
      toast.error('Gagal membuat workspace', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

// -------------------------------------------------------
// Member Hooks
// -------------------------------------------------------

export function useMembers(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId ?? ''),
    queryFn: () => workspaceService.listMembers(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useUpdateMember(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, body }: { memberId: string; body: UpdateMemberRequest }) =>
      workspaceService.updateMember(workspaceId!, memberId, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      }
      toast.success('Data anggota berhasil diperbarui.')
    },
    onError: (err: unknown) => {
      toast.error('Gagal memperbarui anggota', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

export function useRemoveMember(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => workspaceService.removeMember(workspaceId!, memberId),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      }
      toast.success('Anggota berhasil dihapus dari workspace.')
    },
    onError: (err: unknown) => {
      toast.error('Gagal menghapus anggota', { description: err instanceof Error ? err.message : String(err) })
    },
  })
}

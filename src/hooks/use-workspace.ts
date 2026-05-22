import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '@/lib/api/services'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  CreateEntityRequest,
  CreateWorkspaceRequest,
  UpdateMemberRequest,
} from '@/lib/api/types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const workspaceKeys = {
  all: ['workspace'] as const,
  workspaces: () => [...workspaceKeys.all, 'list'] as const,
  members: (workspaceId: string) => [...workspaceKeys.all, 'members', workspaceId] as const,
}

// -------------------------------------------------------
// useCreateEntity — create a new business entity
// -------------------------------------------------------

export function useCreateEntity() {
  return useMutation({
    mutationFn: (body: CreateEntityRequest) => workspaceService.createEntity(body),
    onError: (err) => {
      toast.error('Gagal membuat entitas bisnis', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useWorkspaces — list all workspaces user has access to
// -------------------------------------------------------

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.workspaces(),
    queryFn: () => workspaceService.listWorkspaces(),
  })
}

// -------------------------------------------------------
// useCreateWorkspace — create workspace from entity
// -------------------------------------------------------

export function useCreateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkspaceRequest) => workspaceService.createWorkspace(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.workspaces() })
    },
    onError: (err) => {
      toast.error('Gagal membuat workspace', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useMembers — list all members of a workspace
// -------------------------------------------------------

export function useMembers(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId ?? ''),
    queryFn: () => workspaceService.listMembers(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 60_000, // 1 min
  })
}

// -------------------------------------------------------
// useUpdateMember — update member alias/status
// -------------------------------------------------------

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
    onError: (err) => {
      toast.error('Gagal memperbarui anggota', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useRemoveMember — remove member from workspace
// -------------------------------------------------------

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
    onError: (err) => {
      toast.error('Gagal menghapus anggota', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useAcceptInvite — accept workspace invite via token
// -------------------------------------------------------

export function useAcceptInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => workspaceService.acceptInvite(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.workspaces() })
      toast.success('Undangan berhasil diterima!')
    },
    onError: (err) => {
      toast.error('Gagal menerima undangan', { description: extractErrorMessage(err) })
    },
  })
}

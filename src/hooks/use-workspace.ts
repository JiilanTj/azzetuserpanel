import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '@/lib/api/services'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  CreateEntityRequest,
  CreateWorkspaceRequest,
  UpdateMemberRequest,
  UpdateEntityRequest,
  UpdateEntityMetaRequest,
  CreateInviteRequest,
  CreateRoleRequest,
  AssignRoleRequest,
  UpdateRoleRequest,
  AddCounterpartyRequest,
} from '@/lib/api/types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const workspaceKeys = {
  all: ['workspace'] as const,
  workspaces: () => [...workspaceKeys.all, 'list'] as const,
  members: (workspaceId: string) => [...workspaceKeys.all, 'members', workspaceId] as const,
  entities: () => [...workspaceKeys.all, 'entities'] as const,
  entityDetail: (id: string) => [...workspaceKeys.all, 'entity', id] as const,
  entitySearch: (q: string) => [...workspaceKeys.all, 'entities', 'search', q] as const,
  invites: (workspaceId: string) => [...workspaceKeys.all, 'invites', workspaceId] as const,
  roles: (workspaceId: string) => [...workspaceKeys.all, 'roles', workspaceId] as const,
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

// -------------------------------------------------------
// useEntities — list all entities belonging to user
// -------------------------------------------------------

export function useEntities() {
  return useQuery({
    queryKey: workspaceKeys.entities(),
    queryFn: () => workspaceService.listEntities(),
  })
}

// -------------------------------------------------------
// useEntity — get detail of a single entity
// -------------------------------------------------------

export function useEntity(id?: string) {
  return useQuery({
    queryKey: workspaceKeys.entityDetail(id ?? ''),
    queryFn: () => workspaceService.getEntity(id!),
    enabled: !!id,
  })
}

// -------------------------------------------------------
// useSearchEntities — search active entities by name query
// -------------------------------------------------------

export function useSearchEntities(q: string, enabled = true) {
  return useQuery({
    queryKey: workspaceKeys.entitySearch(q),
    queryFn: () => workspaceService.searchEntities(q),
    enabled: enabled && q.length >= 2,
    staleTime: 5000,
  })
}

// -------------------------------------------------------
// useUpdateEntity — update basic entity info
// -------------------------------------------------------

export function useUpdateEntity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEntityRequest }) =>
      workspaceService.updateEntity(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.entityDetail(variables.id) })
      qc.invalidateQueries({ queryKey: workspaceKeys.entities() })
      toast.success('Informasi profil entitas berhasil diperbarui.')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui profil entitas', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useUpdateEntityMeta — update entity compliance/meta
// -------------------------------------------------------

export function useUpdateEntityMeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEntityMetaRequest }) =>
      workspaceService.updateEntityMeta(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.entityDetail(variables.id) })
      qc.invalidateQueries({ queryKey: workspaceKeys.entities() })
      toast.success('Data compliance entitas berhasil diperbarui.')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui compliance entitas', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useInvites — list all pending invites in workspace
// -------------------------------------------------------

export function useInvites(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKeys.invites(workspaceId ?? ''),
    queryFn: () => workspaceService.listInvites(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 30_000,
  })
}

// -------------------------------------------------------
// useCreateInvite — invite user to workspace via email
// -------------------------------------------------------

export function useCreateInvite(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateInviteRequest) => workspaceService.createInvite(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.invites(workspaceId) })
      }
      toast.success('Undangan berhasil dikirim.')
    },
    onError: (err) => {
      toast.error('Gagal mengirim undangan', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useRevokeInvite — revoke a pending invite
// -------------------------------------------------------

export function useRevokeInvite(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => workspaceService.revokeInvite(workspaceId!, inviteId),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.invites(workspaceId) })
      }
      toast.success('Undangan berhasil dibatalkan.')
    },
    onError: (err) => {
      toast.error('Gagal membatalkan undangan', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useRoles — list roles in workspace
// -------------------------------------------------------

export function useRoles(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKeys.roles(workspaceId ?? ''),
    queryFn: () => workspaceService.listRoles(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 60_000,
  })
}

// -------------------------------------------------------
// useCreateRole — create custom workspace role
// -------------------------------------------------------

export function useCreateRole(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRoleRequest) => workspaceService.createRole(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.roles(workspaceId) })
      }
      toast.success('Role kustom berhasil dibuat.')
    },
    onError: (err) => {
      toast.error('Gagal membuat role', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useAssignRole — Assign role to member
// -------------------------------------------------------

export function useAssignRole(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AssignRoleRequest) => workspaceService.assignRole(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      }
      toast.success('Role berhasil dipasang ke anggota.')
    },
    onError: (err) => {
      toast.error('Gagal memasang role', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useUnassignRole — Remove role from member
// -------------------------------------------------------

export function useUnassignRole(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AssignRoleRequest) => workspaceService.unassignRole(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      }
      toast.success('Role berhasil dilepas dari anggota.')
    },
    onError: (err) => {
      toast.error('Gagal melepas role', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useDeleteRole — Delete custom workspace role
// -------------------------------------------------------

export function useDeleteRole(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => workspaceService.deleteRole(workspaceId!, roleId),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.roles(workspaceId) })
      }
      toast.success('Role kustom berhasil dihapus.')
    },
    onError: (err) => {
      toast.error('Gagal menghapus role', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// useUpdateRole — Update custom workspace role
// -------------------------------------------------------

export function useUpdateRole(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoleRequest }) =>
      workspaceService.updateRole(workspaceId!, id, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: workspaceKeys.roles(workspaceId) })
      }
      toast.success('Role kustom berhasil diperbarui.')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui role', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// Counterparties
// -------------------------------------------------------

export function useCounterparties(workspaceId?: string) {
  return useQuery({
    queryKey: [...workspaceKeys.all(workspaceId!), 'counterparties'],
    queryFn: () => workspaceService.listCounterparties(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useAddCounterparty(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AddCounterpartyRequest) => workspaceService.addCounterparty(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: [...workspaceKeys.all(workspaceId), 'counterparties'] })
      }
      toast.success('Pihak ketiga (Counterparty) berhasil ditambahkan.')
    },
    onError: (err) => {
      toast.error('Gagal menambahkan pihak ketiga', { description: extractErrorMessage(err) })
    },
  })
}




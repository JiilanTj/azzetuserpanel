import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import { useWorkspaces } from '@/hooks/use-business'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { cn } from '@/lib/utils'
import type { WorkspaceResponse } from '@/lib/api/types'
import {
  RocketIcon,
  PersonIcon,
  PlusIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'
import logoSvg from '@/assets/logo.svg'

export const workspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspaces',
  beforeLoad: authMiddleware.requireAuth,
  component: WorkspacePickerPage,
})

function WorkspacePickerPage() {
  const navigate = useNavigate()
  const { data: workspaces, isLoading } = useWorkspaces()
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()

  const handleSelect = (workspace: WorkspaceResponse) => {
    setActiveWorkspace(workspace)
    // After selecting, go through setup to check subscription
    navigate({ to: '/setup', replace: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-6" />
      <h1 className="text-2xl font-bold text-(--gray-12) mb-2">Pilih Workspace</h1>
      <p className="text-sm text-(--gray-10) mb-8 text-center max-w-md">
        Anda memiliki beberapa workspace. Pilih salah satu untuk melanjutkan.
      </p>

      <div className="w-full max-w-md space-y-3">
        {workspaces?.map((workspace) => {
          const isActive = activeWorkspace?.id === workspace.id
          const isPersonal = workspace.entity_type === 'ORANG_PRIBADI'

          return (
            <button
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer',
                isActive
                  ? 'border-(--blue-9) bg-(--blue-2) ring-2 ring-(--blue-9)/20'
                  : 'border-(--gray-4) bg-surface hover:border-(--gray-8) hover:bg-(--gray-2)'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                isPersonal
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
              )}>
                {isPersonal ? <PersonIcon className="h-5 w-5" /> : <RocketIcon className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--gray-12) truncate">{workspace.entity_name}</p>
                <p className="text-xs text-(--gray-9)">
                  {isPersonal ? 'Personal' : 'Badan Usaha'} · {workspace.role}
                </p>
              </div>
              {isActive && (
                <CheckCircledIcon className="h-5 w-5 text-(--blue-9) shrink-0" />
              )}
            </button>
          )
        })}

        {/* Create new workspace button */}
        <button
          onClick={() => navigate({ to: '/workspaces/new' })}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-(--gray-6) hover:border-(--gray-8) hover:bg-(--gray-2) transition-all text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-(--gray-3)">
            <PlusIcon className="h-5 w-5 text-(--gray-9)" />
          </div>
          <div>
            <p className="text-sm font-semibold text-(--gray-12)">Buat Workspace Baru</p>
            <p className="text-xs text-(--gray-9)">Tambah entitas bisnis baru</p>
          </div>
        </button>
      </div>
    </div>
  )
}

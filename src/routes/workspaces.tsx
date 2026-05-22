import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import { useWorkspaces } from '@/hooks/use-workspace'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { cn } from '@/lib/utils'
import type { WorkspaceResponse } from '@/lib/api/types'
import {
  RocketIcon,
  PersonIcon,
  PlusIcon,
  CheckCircledIcon,
  ArrowRightIcon,
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

    // If workspace already has an active/trial subscription → go to dashboard
    if (workspace.subscription_status === 'active' || workspace.subscription_status === 'trial') {
      navigate({ to: '/dashboard', replace: true })
    } else {
      // No subscription → go to plans page
      navigate({ to: '/plans', replace: true })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-6 py-12">
      <img src={logoSvg} alt="Azzet" className="h-10 w-10 mb-8" />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-(--gray-12) mb-2">Pilih Workspace</h1>
        <p className="text-sm text-(--gray-10) max-w-md">
          Pilih workspace untuk melanjutkan. Setiap workspace memiliki data dan langganan terpisah.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-3">
        {workspaces?.map((workspace) => {
          const isActive = activeWorkspace?.id === workspace.id
          const isPersonal = workspace.entity_type === 'ORANG_PRIBADI'
          const hasPlan = workspace.subscription_status === 'active' || workspace.subscription_status === 'trial'

          return (
            <button
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer group',
                isActive
                  ? 'border-(--blue-9) bg-(--blue-2) ring-2 ring-(--blue-9)/20'
                  : 'border-(--gray-4) bg-surface hover:border-(--gray-8) hover:bg-(--gray-2)'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
                isPersonal
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
              )}>
                {isPersonal ? <PersonIcon className="h-5 w-5" /> : <RocketIcon className="h-5 w-5" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--gray-12) truncate">{workspace.entity_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-(--gray-9)">
                    {isPersonal ? 'Personal' : 'Badan Usaha'}
                  </span>
                  {hasPlan && workspace.plan_name && (
                    <>
                      <span className="text-(--gray-6)">·</span>
                      <span className={cn(
                        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                        workspace.subscription_status === 'trial'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      )}>
                        {workspace.plan_name}
                        {workspace.subscription_status === 'trial' && ' (Trial)'}
                      </span>
                    </>
                  )}
                  {!hasPlan && (
                    <>
                      <span className="text-(--gray-6)">·</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        Belum ada plan
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right side */}
              {isActive ? (
                <CheckCircledIcon className="h-5 w-5 text-(--blue-9) shrink-0" />
              ) : (
                <ArrowRightIcon className="h-4 w-4 text-(--gray-8) shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          )
        })}

        {/* Create new workspace button */}
        <button
          onClick={() => navigate({ to: '/workspaces/new' })}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-(--gray-6) hover:border-(--gray-8) hover:bg-(--gray-2) transition-all text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-(--gray-3)">
            <PlusIcon className="h-5 w-5 text-(--gray-9)" />
          </div>
          <div>
            <p className="text-sm font-semibold text-(--gray-12)">Buat Workspace Baru</p>
            <p className="text-xs text-(--gray-9)">Tambah entitas bisnis baru untuk dikelola</p>
          </div>
        </button>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-(--gray-9) text-center max-w-sm">
        Workspace personal Anda otomatis dibuat saat registrasi. Buat workspace baru untuk mengelola bisnis atau organisasi.
      </p>
    </div>
  )
}

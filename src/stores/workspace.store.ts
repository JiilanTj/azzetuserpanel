import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WorkspaceResponse } from '@/lib/api/types'

interface WorkspaceState {
  /** Currently selected/active workspace */
  activeWorkspace: WorkspaceResponse | null
  
  /** Select active workspace */
  setActiveWorkspace: (workspace: WorkspaceResponse | null) => void
  /** Clear active workspace */
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,

      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
      clearWorkspace: () => set({ activeWorkspace: null }),
    }),
    {
      name: 'azzet-workspace-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

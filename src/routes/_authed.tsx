import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { authMiddleware } from '@/middleware/auth.middleware'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

// -------------------------------------------------------
// Auth guard — pathless layout route
// loader runs before any child route renders.
// -------------------------------------------------------

export const authedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authed',
  loader: authMiddleware.requireAuth,
  component: AuthedLayout,
})

// -------------------------------------------------------
// Shell layout — composes Sidebar + Header + page content
// -------------------------------------------------------

function AuthedLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { loginRoute } from './routes/login'
import { authedLayout } from './routes/_authed'
import { dashboardRoute } from './routes/dashboard'
import { uiOverviewRoute } from './routes/ui-overview'
import { usersRoute, billingRoute, plansRoute, settingsRoute } from './routes/_stubs'

const routeTree = rootRoute.addChildren([
  // Public routes
  indexRoute,
  loginRoute,

  // Protected routes — wrapped in authed layout (auth guard + sidebar/header)
  authedLayout.addChildren([
    dashboardRoute,
    uiOverviewRoute,
    usersRoute,
    billingRoute,
    plansRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({ routeTree })

// TypeScript module augmentation for type-safe routing
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

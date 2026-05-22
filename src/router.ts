import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { loginRoute } from './routes/login'
import { registerRoute } from './routes/register'
import { forgotPasswordRoute } from './routes/forgot-password'
import { verifyEmailRoute } from './routes/verify-email'
import { verifyWhatsappRoute } from './routes/verify-whatsapp'
import { setupRoute } from './routes/setup'
import { workspacesRoute } from './routes/workspaces'
import { inviteRoute } from './routes/invite.$token'
import { authedLayout } from './routes/_authed'
import { dashboardRoute } from './routes/dashboard'
import { uiOverviewRoute } from './routes/ui-overview'
import { plansRoute } from './routes/plans'
import { workspacesNewRoute } from './routes/workspaces.new'
import { usersRoute } from './routes/users'
import { billingRoute } from './routes/billing'
import { settingsRoute } from './routes/settings'

const routeTree = rootRoute.addChildren([
  // Public routes
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  verifyEmailRoute,
  verifyWhatsappRoute,

  // Onboarding routes — auth required but no app shell (sidebar/header)
  setupRoute,
  workspacesRoute,
  workspacesNewRoute,
  plansRoute,
  inviteRoute,

  // Protected routes — wrapped in authed layout (auth guard + sidebar/header)
  authedLayout.addChildren([
    dashboardRoute,
    uiOverviewRoute,
    usersRoute,
    billingRoute,
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

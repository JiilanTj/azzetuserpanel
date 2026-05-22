import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { loginRoute } from './routes/auth/login'
import { registerRoute } from './routes/auth/register'
import { forgotPasswordRoute } from './routes/auth/forgot-password'
import { verifyEmailRoute } from './routes/auth/verify-email'
import { verifyWhatsappRoute } from './routes/auth/verify-whatsapp'
import { setupRoute } from './routes/onboarding/setup'
import { workspacesRoute } from './routes/onboarding/workspaces'
import { inviteRoute } from './routes/onboarding/invite.$token'
import { paymentSuccessRoute } from './routes/onboarding/payment.success'
import { paymentFailedRoute } from './routes/onboarding/payment.failed'
import { authedLayout } from './routes/authed/_authed'
import { dashboardRoute } from './routes/authed/dashboard'
import { uiOverviewRoute } from './routes/authed/ui-overview'
import { plansRoute } from './routes/onboarding/plans'
import { workspacesNewRoute } from './routes/onboarding/workspaces.new'
import { usersRoute } from './routes/authed/users'
import { billingRoute } from './routes/authed/billing'
import { settingsRoute } from './routes/authed/settings'
import { counterpartiesRoute } from './routes/authed/counterparties'
import { subscriptionRoute } from './routes/authed/subscription'

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
  paymentSuccessRoute,
  paymentFailedRoute,

  // Protected routes — wrapped in authed layout (auth guard + sidebar/header)
  authedLayout.addChildren([
    dashboardRoute,
    uiOverviewRoute,
    usersRoute,
    billingRoute,
    settingsRoute,
    counterpartiesRoute,
    subscriptionRoute,
  ]),
])

export const router = createRouter({ routeTree })

// TypeScript module augmentation for type-safe routing
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

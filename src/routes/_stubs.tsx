import { createRoute } from '@tanstack/react-router'
import { authedLayout } from './_authed'

// Stub pages — to be implemented
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center flex-1 h-full p-12 text-center">
    <p className="text-4xl mb-4">🚧</p>
    <h2 className="text-xl font-semibold text-(--gray-12) mb-2">{title}</h2>
    <p className="text-sm text-(--gray-10)">This section is under construction.</p>
  </div>
)

export const usersRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/users',
  component: () => <ComingSoon title="User Management" />,
})

export const billingRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/billing',
  component: () => <ComingSoon title="Billing" />,
})

export const plansRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/plans',
  component: () => <ComingSoon title="Plans" />,
})

export const settingsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/settings',
  component: () => <ComingSoon title="Settings" />,
})

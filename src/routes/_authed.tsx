import { createRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { rootRoute } from "./__root";
import { authMiddleware } from "@/middleware/auth.middleware";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { businessService } from "@/lib/api/services";
import type { SubscriptionResponse } from "@/lib/api/types";
import { ExclamationTriangleIcon, Cross2Icon } from "@radix-ui/react-icons";

// -------------------------------------------------------
// Auth guard — pathless layout route
// loader runs before any child route renders.
// -------------------------------------------------------

export const authedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authed",
  loader: authMiddleware.requireAuth,
  component: AuthedLayout,
});

// -------------------------------------------------------
// Shell layout — composes Sidebar + Header + page content
// Auto-selects workspace + checks subscription.
// -------------------------------------------------------

function AuthedLayout() {
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [ready, setReady] = useState(!!activeWorkspace);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      setReady(true);
      checkSubscription(activeWorkspace.entity_id);
      return;
    }

    let cancelled = false;

    async function initWorkspace() {
      try {
        const workspaces = await businessService.listWorkspaces();
        if (cancelled) return;

        if (workspaces && workspaces.length > 0) {
          // Auto-select first workspace
          setActiveWorkspace(workspaces[0]);
          setReady(true);
          checkSubscription(workspaces[0].entity_id);
        } else {
          // No workspace at all — redirect to setup/onboarding
          navigate({ to: "/setup", replace: true });
        }
      } catch {
        // On error, still render (workspace-scoped features will show empty states)
        if (!cancelled) setReady(true);
      }
    }

    initWorkspace();
    return () => { cancelled = true; };
  }, [activeWorkspace, setActiveWorkspace, navigate]);

  async function checkSubscription(entityId: string) {
    try {
      const sub = await businessService.getSubscription(entityId);
      setSubscription(sub);

      // If subscription is expired or cancelled, redirect to plans
      if (sub.status === 'expired' || sub.status === 'cancelled') {
        navigate({ to: "/plans", replace: true });
      }
    } catch {
      // 404 = no subscription → redirect to plans
      // But allow /plans route itself to render
      const currentPath = window.location.pathname;
      if (currentPath !== '/plans' && currentPath !== '/workspaces/new') {
        navigate({ to: "/plans", replace: true });
      }
    }
  }

  // Calculate trial expiring soon (< 3 days)
  const isTrialExpiringSoon = subscription?.status === 'trial' && subscription.trial_ends_at
    ? (new Date(subscription.trial_ends_at).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
    : false;

  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--blue-9) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Trial expiring banner */}
        {isTrialExpiringSoon && showBanner && (
          <div className="flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Trial Anda berakhir dalam {trialDaysLeft} hari.{' '}
                <Link to="/plans" className="underline font-semibold hover:no-underline">
                  Upgrade sekarang
                </Link>
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer"
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

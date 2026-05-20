import { createRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  const [initialized, setInitialized] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [now] = useState(() => Date.now());

  // Effect: Initialize workspace if none is active
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (activeWorkspace) {
        // Workspace already set — mark initialized
        if (!cancelled) setInitialized(true);
        return;
      }

      try {
        const workspaces = await businessService.listWorkspaces();
        if (cancelled) return;

        if (workspaces && workspaces.length > 0) {
          setActiveWorkspace(workspaces[0]);
          setInitialized(true);
        } else {
          navigate({ to: "/setup", replace: true });
        }
      } catch {
        if (!cancelled) setInitialized(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [activeWorkspace, setActiveWorkspace, navigate]);

  // Effect: Check subscription whenever activeWorkspace changes
  useEffect(() => {
    if (!activeWorkspace) return;

    const workspace = activeWorkspace;
    let cancelled = false;

    async function fetchSubscription() {
      try {
        const sub = await businessService.getSubscription(workspace.entity_id);
        if (cancelled) return;
        setSubscription(sub);

        if (sub.status === 'expired' || sub.status === 'cancelled') {
          navigate({ to: "/plans", replace: true });
        }
      } catch {
        if (cancelled) return;
        const currentPath = window.location.pathname;
        if (currentPath !== '/plans' && currentPath !== '/workspaces/new') {
          navigate({ to: "/plans", replace: true });
        }
      }
    }

    fetchSubscription();
    return () => { cancelled = true; };
  }, [activeWorkspace, navigate]);

  // Calculate trial expiring soon (< 3 days)
  const isTrialExpiringSoon = useMemo(() => {
    if (subscription?.status === 'trial' && subscription.trial_ends_at) {
      return (new Date(subscription.trial_ends_at).getTime() - now) < 3 * 24 * 60 * 60 * 1000;
    }
    return false;
  }, [subscription, now]);

  const trialDaysLeft = useMemo(() => {
    if (subscription?.trial_ends_at) {
      return Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - now) / (24 * 60 * 60 * 1000)));
    }
    return 0;
  }, [subscription, now]);

  if (!initialized) {
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

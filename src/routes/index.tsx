import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { authMiddleware } from "@/middleware/auth.middleware";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: authMiddleware.smartRedirect,
});

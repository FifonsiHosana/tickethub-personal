import { Navigate } from "react-router";

import {
  DASHBOARD_ROLES,
  useAuthStorage,
} from "@/hooks/useAuthStorage";
import { navByRole, type Role } from "@/misc/dashboardData";

/**
 * Bounce to the first navByRole item depending on the user's active role.
 */
export default function Dashboard() {
  const { roles, activeRole } = useAuthStorage();

  const activeDashboardRole =
    activeRole && DASHBOARD_ROLES.includes(activeRole)
      ? activeRole
      : ((roles as Role[]).find((role) => DASHBOARD_ROLES.includes(role)) ??
        undefined);

  const items = navByRole[activeDashboardRole as Role] ?? [];
  const landingUrl = items[0]?.url ?? "/";

  return <Navigate to={landingUrl} replace />;
}
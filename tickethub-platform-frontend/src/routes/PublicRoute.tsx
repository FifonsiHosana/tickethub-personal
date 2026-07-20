import { Navigate } from "react-router";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";
import { logger } from "@/utils/logger";

const DASHBOARD_ROLES: Role[] = ["admin", "organizer", "event_staff"];

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role } = useAuthStorage();
  logger.info(`This is the role ${role}`);

  if (token) {
    if (DASHBOARD_ROLES.includes(role as Role)) {
      return <Navigate to="/dashboard" replace />;
    }
    // Regular users go to home
    return <Navigate to="/" replace />;
  }

  return children;
}
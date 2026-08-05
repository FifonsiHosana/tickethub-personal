import { Navigate, useLocation } from "react-router";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";

const DASHBOARD_ROLES: Role[] = ["admin", "organizer", "event_staff"];
const AUTH_PATHS = ["/login", "/signup", "/verify-email"];

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role } = useAuthStorage();
  const { pathname } = useLocation();

  if (token) {
    if (DASHBOARD_ROLES.includes(role as Role)) {
      return <Navigate to="/dashboard" replace />;
    }
    // Logged-in non-dashboard users (e.g. attendees) can browse public
    // content, but should be bounced off the auth pages.
    if (AUTH_PATHS.includes(pathname)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
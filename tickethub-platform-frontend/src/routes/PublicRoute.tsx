import { Navigate, useLocation } from "react-router";

import { DASHBOARD_ROLES, useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";

const AUTH_PATHS = ["/login", "/signup", "/verify-email"];

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, roles } = useAuthStorage();
  const { pathname } = useLocation();

  if (token) {
    // Logged-in users are bounced off the auth pages to their home route.
    if (AUTH_PATHS.includes(pathname)) {
      const isDashboardUser = (roles as Role[]).some((role) =>
        DASHBOARD_ROLES.includes(role),
      );

      return (
        <Navigate
          to={isDashboardUser ? "/dashboard" : "/ticket-order-history"}
          replace
        />
      );
    }
  }

  return children;
}
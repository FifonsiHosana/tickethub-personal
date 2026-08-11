import { Navigate } from "react-router";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";

type Props = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, roles } = useAuthStorage();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Redirect ONLY if the user's roles do not intersect the allowedRoles array
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some((role) =>
      (roles as Role[]).includes(role),
    );

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
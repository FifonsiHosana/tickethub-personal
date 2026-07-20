import { Navigate } from "react-router";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import type { Role } from "@/misc/dashboardData";

type Props = {
  children: React.ReactNode;
  allowedRoles: Role[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, role } = useAuthStorage();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Redirect ONLY if the user's role is NOT in the allowedRoles array
  if (allowedRoles && role && !allowedRoles.includes(role as Role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

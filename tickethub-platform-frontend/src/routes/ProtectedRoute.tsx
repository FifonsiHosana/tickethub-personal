import { Navigate } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, role } = useAuthStorage();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect ONLY if the user's role is NOT in the allowedRoles array
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

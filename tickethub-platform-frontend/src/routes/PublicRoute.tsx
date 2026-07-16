import { Navigate } from "react-router";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { logger } from "@/utils/logger";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, role } = useAuthStorage();
  logger.info(`This is the role ${role}`);

  if (token) {
    // Admins and organizers go to dashboard
    if (role === "admin" || role === "organizer") {
      return <Navigate to="/dashboard" replace />;
    }
    // Regular users goes to home
    return <Navigate to="/" replace />;
  }

  return children;
}

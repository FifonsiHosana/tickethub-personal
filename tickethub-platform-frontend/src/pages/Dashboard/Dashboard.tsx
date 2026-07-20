import { Navigate } from "react-router";

import { useAuthStorage } from "@/hooks/useAuthStorage";
import { navByRole, type Role } from "@/misc/dashboardData";

/**
 * E just go bounce you to the first navByRole item depending on the role
 */
export default function Dashboard() {
  const { role } = useAuthStorage();
  const items = navByRole[role as Role] ?? [];
  const landingUrl = items[0]?.url ?? "/";

  return <Navigate to={landingUrl} replace />;
}

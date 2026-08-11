import useLocalStorage from "@/hooks/useLocalStorage";
import useSessionStorage from "@/hooks/useSessionStorage";
import { decodeToken } from "@/utils/token";
import { toast } from "sonner";
import { type User } from "@/types";
import { removeItem } from "@/utils/storage/localStorage";
import { removeSessionItem } from "@/utils/storage/sessionStorage";
import type { Role } from "@/misc/dashboardData";

export const DASHBOARD_ROLES: Role[] = ["admin", "organizer", "event_staff"];

export function useAuthStorage() {
  const [token, setToken, clearToken] = useLocalStorage<string | null>(
    "auth_token",
    null,
  );
  const [sessionToken, setSessionToken, clearSessionToken] =
    useSessionStorage<string | null>("auth_token", null);
  const [user, setUser, clearUser] = useLocalStorage<User | null>(
    "auth_user",
    null,
  );
  const [sessionUser, setSessionUser, clearSessionUser] =
    useSessionStorage<User | null>("auth_user", null);
  const [activeRole, setActiveRoleState, clearActiveRole] =
    useLocalStorage<Role | null>("active_role", null);
  const [sessionActiveRole, setSessionActiveRole, clearSessionActiveRole] =
    useSessionStorage<Role | null>("active_role", null);

  const authToken = token ?? sessionToken;
  const authUser = user ?? sessionUser;
  const roles = authToken ? decodeToken(authToken).roles : [];
  const userId = authToken ? decodeToken(authToken).sub : null;

  const rememberedRole = activeRole ?? sessionActiveRole;
  const resolvedActiveRole =
    rememberedRole && roles.includes(rememberedRole) ? rememberedRole : null;

  // Writes only ever touch one store: persistent localStorage when the user
  // chose "Remember me", sessionStorage otherwise. The opposite store is
  // cleared so reads via `??` can never surface stale data.
  function setAuth(data: {
    token: string;
    user: User;
    activeRole?: Role;
    rememberMe?: boolean;
  }) {
    const remember = data.rememberMe ?? true;
    const tokenRoles = decodeToken(data.token).roles as Role[];
    const role = data.activeRole ?? tokenRoles[0] ?? null;

    if (remember) {
      setToken(data.token);
      removeSessionItem("auth_token");
      setUser(data.user);
      removeSessionItem("auth_user");
      setActiveRoleState(role);
      removeSessionItem("active_role");
    } else {
      setSessionToken(data.token);
      removeItem("auth_token");
      setSessionUser(data.user);
      removeItem("auth_user");
      setSessionActiveRole(role);
      removeItem("active_role");
    }
  }

  function setActiveRole(role: Role) {
    if (sessionToken) {
      setSessionActiveRole(role);
      removeItem("active_role");
    } else {
      setActiveRoleState(role);
      removeSessionItem("active_role");
    }
  }

  function logout() {
    clearToken();
    clearUser();
    clearActiveRole();
    clearSessionToken();
    clearSessionUser();
    clearSessionActiveRole();
    toast.success("Logged out successfully");
    removeItem("vite-ui-theme-dashboard");
  }

  return {
    user: authUser,
    token: authToken,
    roles,
    activeRole: resolvedActiveRole,
    userId,
    setToken,
    setAuth,
    setActiveRole,
    logout,
  };
}
import useLocalStorage from "@/hooks/useLocalStorage";
import { decodeToken } from "@/utils/token";
import { toast } from "sonner";
import { type User } from "@/types";
import { removeItem } from "@/utils/storage/localStorage";

export function useAuthStorage() {
  const [token, setToken, clearToken] = useLocalStorage<string | null>(
    "auth_token",
    null,
  );
  const [user, setUser, clearUser] = useLocalStorage<User | null>(
    "auth_user",
    null,
  );

  const role = token ? decodeToken(token).role : null;
  const userId = token ? decodeToken(token).sub : null;

  function logout() {
    clearToken();
    clearUser();
    toast.success("Logged out successfully");
    removeItem("vite-ui-theme");
  }

  function setAuth(data: { token: string; user: User }) {
    setToken(data.token);
    setUser(data.user);
  }

  return {
    user,
    token,
    role,
    userId,
    setToken,
    setAuth,
    logout,
  };
}

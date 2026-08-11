import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: number;
  role?: string;
  roles?: string[];
}

export function decodeToken(token: string) {
  const decoded = jwtDecode<TokenPayload>(token);

  return {
    sub: decoded.sub,
    roles: decoded.roles ?? (decoded.role ? [decoded.role] : []),
  };
}
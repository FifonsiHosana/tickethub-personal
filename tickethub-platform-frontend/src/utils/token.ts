import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: number;
  role: string;
}

export function decodeToken(token: string): TokenPayload {
  return jwtDecode<TokenPayload>(token);
}

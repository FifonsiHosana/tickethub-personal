import { type Request } from 'express';
export function getOrganizerId(req: Request) {
  return req.user.id;
}

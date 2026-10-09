import type { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { roles, userRoles, users } from '@/db/schema/index.js';

interface JwtPayload {
  id: number;
}

async function loadActiveUser(userId: number) {
  const [user] = await db
    .select({ id: users.id, email: users.email, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isActive) return null;

  const userRoleRows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));

  return {
    id: user.id,
    email: user.email,
    roles: userRoleRows.map((role) => role.name),
  };
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) return null;

  return token;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, config.auth.jwt_secret) as JwtPayload;
    const user = await loadActiveUser(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Sets `req.user` when a valid Bearer token belongs to an active user, and
 * continues as a guest when the header is missing or invalid.
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);
    if (!token) return next();

    const decoded = jwt.verify(token, config.auth.jwt_secret) as JwtPayload;
    const user = await loadActiveUser(decoded.id);
    if (user) req.user = user;
  } catch (error) {
    // Invalid or expired token: continue as a guest.
  }

  next();
}

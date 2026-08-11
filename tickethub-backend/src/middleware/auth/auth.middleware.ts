import type { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import config from '@/config/config.js';

interface JwtPayload {
  id: number;
  role?: string;
  roles?: string[];
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });
    }

    const decoded = jwt.verify(token, config.auth.jwt_secret) as JwtPayload;

    req.user = {
      id: decoded.id,
      roles: decoded.roles ?? (decoded.role ? [decoded.role] : []),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Like `authenticate`, but never rejects.
 *
 * Sets `req.user` when a valid Bearer token is present, and continues as a
 * guest (no `req.user`) when the header is missing or the token is invalid.
 * Used on public routes that want to optionally attribute requests to a
 * signed-in user without requiring auth (e.g. ticket purchases).
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');

      if (bearer === 'Bearer' && token) {
        const decoded = jwt.verify(token, config.auth.jwt_secret) as JwtPayload;

        req.user = {
          id: decoded.id,
          roles: decoded.roles ?? (decoded.role ? [decoded.role] : []),
        };
      }
    }
  } catch (error) {
    // Invalid or expired token — treat as guest
  }

  next();
}

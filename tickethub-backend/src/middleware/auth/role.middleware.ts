import type { Request, Response, NextFunction } from 'express';

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

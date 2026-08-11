import type { Request, Response, NextFunction } from 'express';
import { DrizzleQueryError } from 'drizzle-orm';
import logger from '@/utils/logger/index.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler which should be mounted AFTER all routes
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Global error handler - must be last app.use() call
// Express identifies error-handling middleware by its 4-argument signature.
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Structured log — pino serialises the `err` key with stack trace automatically
  logger.error(
    {
      err,
      req: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      },
    },
    isOperational ? 'Operational error' : 'Unexpected error',
  );

  // Don't leak internal details for DB/query failures or in production for
  // non-operational errors.
  let message: string;

  if (err instanceof DrizzleQueryError) {
    message = 'Something went wrong';
  } else {
    message =
      isOperational || process.env.NODE_ENV !== 'production'
        ? err.message
        : 'Internal Server Error';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
}

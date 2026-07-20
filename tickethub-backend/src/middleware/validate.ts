import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      next(error);
    }
  };

// addded a query variant, I'll use this later 
export const validateQuery =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any; // coerced values written back
      next();
    } catch (error) {
      next(error);
    }
  };

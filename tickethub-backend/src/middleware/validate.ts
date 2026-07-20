import validateSafe from 'express-zod-safe';
import type { ZodType } from 'zod';

export const validate = (schema: ZodType) =>
  validateSafe({ body: schema });

export const validateQuery = (schema: ZodType) =>
  validateSafe({ query: schema });

export const validateParams = (schema: ZodType) =>
  validateSafe({ params: schema });
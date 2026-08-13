import validateSafe from 'express-zod-safe';
import { z, type ZodType } from 'zod';

const passthrough = z.record(z.string(), z.unknown());

export const validate = (schema: ZodType) =>
  validateSafe({ body: schema, query: passthrough, params: passthrough });

export const validateQuery = (schema: ZodType) =>
  validateSafe({ query: schema, body: passthrough, params: passthrough });

export const validateParams = (schema: ZodType) =>
  validateSafe({ params: schema, body: passthrough, query: passthrough });

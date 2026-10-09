import { z } from 'zod';

export const orderHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  period: z.enum(['upcoming', 'past']).optional(),
});

export const orderHistoryDetailParamsSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

export const orderFromReferenceQuerySchema = z.object({
  reference: z.string(),
});

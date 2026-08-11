import { z } from 'zod';

// query
export const getSalesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),

  pageSize: z.coerce.number().int().positive().max(100).optional(),

  eventId: z.coerce.number().int().positive().optional(),

  status: z.enum(['Completed', 'Failed']).optional(),

  from: z.iso.date().or(z.iso.datetime()).optional(),

  to: z.iso.date().or(z.iso.datetime()).optional(),

  search: z.string().trim().optional(),
});

// params
export const getSaleByIdSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

// params
export const getEventSalesSchema = z.object({
  eventId: z.coerce.number().int().positive(),
});

// query
export const getRevenueBreakdownSchema = z.object({
  from: z.iso.date(),

  to: z.iso.date(),
});

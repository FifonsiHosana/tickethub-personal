import { z } from 'zod';

export const getSalesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    pageSize: z.coerce.number().int().positive().max(100).optional(),

    eventId: z.coerce.number().int().positive().optional(),

    status: z.enum(['Completed', 'Failed']).optional(),

    from: z.iso.datetime().optional(),

    to: z.iso.datetime().optional(),

    search: z.string().trim().optional(),
  }),
});

export const getSaleByIdSchema = z.object({
  params: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
});

export const getEventSalesSchema = z.object({
  params: z.object({
    eventId: z.coerce.number().int().positive(),
  }),
});

export const getRevenueBreakdownSchema = z.object({
  query: z.object({
    from: z.iso.datetime(),

    to: z.iso.datetime(),
  }),
});

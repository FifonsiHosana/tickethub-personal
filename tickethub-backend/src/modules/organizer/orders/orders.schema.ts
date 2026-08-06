import { z } from 'zod';

// query
export const getOrdersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),

  pageSize: z.coerce.number().int().positive().max(100).optional(),

  eventId: z.coerce.number().int().positive().optional(),

  status: z.enum(['Pending', 'Completed']).optional(),

  search: z.string().trim().optional(),
});

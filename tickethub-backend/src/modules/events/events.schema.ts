import { z } from 'zod';

export const getPublishedEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().default(9),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['date', 'title']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type GetPublishedEventsQuery = z.infer<typeof getPublishedEventsQuerySchema>;

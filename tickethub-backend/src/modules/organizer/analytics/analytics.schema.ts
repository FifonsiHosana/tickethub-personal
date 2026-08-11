import { z } from 'zod';

// query
export const revenueTrendSchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export type RevenueTrendQuery = z.infer<typeof revenueTrendSchema>;

export const paginatedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => Number(value ?? 1)),
  pageSize: z
    .string()
    .optional()
    .transform((value) => Number(value ?? 10)),
  search: z.string().optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;

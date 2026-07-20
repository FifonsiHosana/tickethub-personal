import { z } from 'zod';

export const salesReportQuerySchema = z.object({
  format: z.enum(['pdf', 'excel']),
  eventId: z.coerce.number().int().positive().optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

export type SalesReportQuery = z.infer<typeof salesReportQuerySchema>;

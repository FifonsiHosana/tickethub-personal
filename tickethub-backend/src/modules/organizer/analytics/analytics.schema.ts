import { z } from 'zod';

// query
export const revenueTrendSchema = z.object({
  from: z.iso.date().optional(),

  to: z.iso.date().optional(),
});

export type RevenueTrendQuery = z.infer<typeof revenueTrendSchema>;

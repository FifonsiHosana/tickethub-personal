import { z } from 'zod';

export const revenueTrendSchema = z.object({
  query: z.object({
    from: z.iso.datetime().optional(),

    to: z.iso.datetime().optional(),
  }),
});


export type RevenueTrendQuery = z.infer<typeof revenueTrendSchema>;
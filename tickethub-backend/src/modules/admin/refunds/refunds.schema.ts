import { z } from 'zod';

export const rejectRefundSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

import { z } from 'zod';

export const listAdminEventsQuerySchema = z.object({
  page: z.string().optional().transform((v) => Number(v ?? 1)),
  pageSize: z.string().optional().transform((v) => Number(v ?? 10)),
  search: z.string().optional(),
  approvalStatus: z
    .enum(['Pending', 'Approved', 'Rejected'])
    .optional(),
  status: z
    .enum(['Draft', 'Published', 'Completed', 'Cancelled'])
    .optional(),
  organizerId: z.string().optional().transform((v) => Number(v)),
});

export const rejectEventSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export type ListAdminEventsQueryType = z.infer<typeof listAdminEventsQuerySchema>;

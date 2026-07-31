import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.string().optional().transform((v) => Number(v ?? 1)),
  pageSize: z.string().optional().transform((v) => Number(v ?? 10)),
  search: z.string().optional(),
  role: z.enum(['attendee', 'organizer', 'event_staff', 'admin']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  isVerified: z.enum(['true', 'false']).optional(),
});

export const suspendUserSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const resetUserPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verificationQueueQuerySchema = z.object({
  page: z.string().optional().transform((v) => Number(v ?? 1)),
  pageSize: z.string().optional().transform((v) => Number(v ?? 10)),
  search: z.string().optional(),
});

export type ListUsersQueryType = z.infer<typeof listUsersQuerySchema>;

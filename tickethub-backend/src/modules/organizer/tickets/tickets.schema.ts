import { z } from 'zod';

export const createTicketTypeSchema = z.object({
  name: z.string().trim().min(2, 'Ticket type must be at least 2 characters'),
  description: z.string().max(255).optional(),
});

export type CreateTicketTypeType = z.infer<typeof createTicketTypeSchema>;

export const createTicketSchema = z.object({
  name: z.string().trim().min(3).optional(),
  ticketTypeId: z.number().int().positive().optional(),
  ticketTypeName: z.string().trim().min(2).optional(),
  price: z.number().positive(),
  totalCount: z.number().int().positive().optional(),
  salesStartDate: z.iso.datetime().optional(),
  salesEndDate: z.iso.datetime().optional(),
  benefits: z.string().max(5000).optional(),
  isVisible: z.boolean().optional(),
});

export type CreateTicketType = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z.object({
  ticketTypeName: z.string().trim().min(2).optional(),
  price: z.number().positive().optional(),
  totalCount: z.number().int().positive().optional(),
  salesStartDate: z.iso.datetime().optional(),
  salesEndDate: z.iso.datetime().optional(),
  benefits: z.string().max(5000).optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateTicketType = z.infer<typeof updateTicketSchema>;

export const invalidateTicketItemSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type InvalidateTicketItemType = z.infer<typeof invalidateTicketItemSchema>;

export const swapTicketItemSchema = z.object({
  targetEventTicketId: z.coerce.number().int().positive(),
  reason: z.string().trim().max(500).optional(),
});

export type SwapTicketItemType = z.infer<typeof swapTicketItemSchema>;

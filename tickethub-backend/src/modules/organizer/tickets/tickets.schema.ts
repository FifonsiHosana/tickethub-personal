import { z } from 'zod';

export const createTicketSchema = z.object({
  name: z.string().trim().min(3, 'Ticket name must be at least 3 characters'),
  ticketTypeName: z.string().trim().min(2, 'Ticket type is required'),
  ticketTypeDescription: z.string().max(255),
  price: z.number().positive(),
  totalCount: z.number().int().positive(),
  salesStartDate: z.iso.datetime(),
  salesEndDate: z.iso.datetime(),
  benefits: z.string().max(5000),


});

export const updateTicketSchema = z.object({
  price: z.number().positive().optional(),
  totalCount: z.number().int().positive().optional(),
  salesStartDate: z.iso.datetime().optional(),
  salesEndDate: z.iso.datetime().optional(),
  benefits: z.string().max(5000).optional(),


});



export type CreateTicketType = z.infer<typeof createTicketSchema>;
export type UpdateTicketType = z.infer<typeof updateTicketSchema>;


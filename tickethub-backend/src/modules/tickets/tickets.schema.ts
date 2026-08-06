import { z } from 'zod';

export const purchaseTicketSchema = z.object({
  items: z
    .array(
      z.object({
        eventTicketId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'At least one ticket is required.'),
  attendee: z.object({
    firstName: z.string().trim().min(2).max(255),
    lastName: z.string().trim().min(2).max(255),
    email: z.email().transform((email) => email.toLowerCase()),
    phoneNumber: z.string().min(7).max(20),
  }),
});

export const checkInTicketSchema = z.object({
  ticketIdentifier: z.string().min(5).max(500),
});

export type PurchaseTicketType = z.infer<typeof purchaseTicketSchema>;

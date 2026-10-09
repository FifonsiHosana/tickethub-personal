import { z } from 'zod';

export const checkoutV2ItemSchema = z.object({
  eventTicketId: z.number().int().positive(),
  quantity: z.number().int().positive().max(10),
});

export const checkoutV2Schema = z.object({
  items: z.array(checkoutV2ItemSchema).min(1),
  attendee: z.object({
    firstName: z.string().trim().min(2).max(255),
    lastName: z.string().trim().max(255).optional().default(''),
    email: z.email().transform((email) => email.toLowerCase()),
    phoneNumber: z.string().min(7).max(20),
  }),
});

export type CheckoutV2Input = z.infer<typeof checkoutV2Schema>;

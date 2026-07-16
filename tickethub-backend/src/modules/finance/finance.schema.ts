import { z } from 'zod';

export const purchaseTicketPaymentSchema = z.object({
  orderId: z.number(),
  totalAmount: z.number(),
  email: z.email(),
  phoneNumber: z.string().min(10),
});

export type purchaseTicketPaymentInput = z.infer<
  typeof purchaseTicketPaymentSchema
>;

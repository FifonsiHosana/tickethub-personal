import { z } from 'zod';

export const purchaseTicketPaymentSchema = z.object({
  orderId: z.number(),
  totalAmount: z.number(),
  email: z.email(),
  phoneNumber: z.string().min(10),
  totalQuantity: z.number().min(1),
  reference: z.string().min(1),
});

export type purchaseTicketPaymentInput = z.infer<
  typeof purchaseTicketPaymentSchema
>;

import axios from 'axios';
import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { makeReference } from '@/modules/finance/finance.utils.js';
import {
  ticketOrders,
  ticketOrderUserDetails,
  ticketOrderIntents,
} from '@/db/schema/index.js';
import type { CheckoutV2Input } from './checkout-v2.schema.js';
import { buildCheckoutLines } from './checkout-v2.lines.js';
import { calculateTotals } from './checkout-v2.types.js';

export class CheckoutV2Service {
  async initiateCheckout(payload: CheckoutV2Input, userId: number | null) {
    const reference = makeReference();
    const result = await db.transaction(async (tx) => {
      const lines = await buildCheckoutLines(payload, tx);
      const totals = calculateTotals(lines);
      const [order] = await tx
        .insert(ticketOrders)
        .values({ userId, status: 'Pending', quantity: totals.totalQuantity, reference })
        .$returningId();

      if (!order) throw new Error('Unable to create checkout order.');

      await tx.insert(ticketOrderUserDetails).values({
        orderId: order.id,
        firstName: payload.attendee.firstName,
        lastName: payload.attendee.lastName ?? '',
        email: payload.attendee.email,
        phoneNumber: payload.attendee.phoneNumber,
      });

      await tx.insert(ticketOrderIntents).values(
        lines.map((line) => ({
          orderId: order.id,
          eventTicketId: line.eventTicketId,
          quantity: line.quantity,
          unitPrice: line.unitPrice.toFixed(2),
        })),
      );

      return { orderId: order.id, lines, totals };
    });

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: payload.attendee.email,
        amount: Math.round(result.totals.totalAmount * 100),
        reference,
        metadata: {
          flow: 'ticket_checkout_v2',
          orderId: result.orderId,
          totalQuantity: result.totals.totalQuantity,
        },
      },
      { headers: { Authorization: `Bearer ${config.payment.paystack_api_key}` } },
    );

    if (!response.data?.status) throw new Error('Paystack initialization failed');

    return {
      orderId: result.orderId,
      reference,
      checkoutUrl: response.data.data.authorization_url as string,
      access_code: response.data.data.access_code as string,
      subtotal: result.totals.subtotal,
      feeAmount: result.totals.feeAmount,
      totalAmount: result.totals.totalAmount,
    };
  }
}

export default new CheckoutV2Service();

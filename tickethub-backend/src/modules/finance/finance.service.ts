import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { eq } from 'drizzle-orm';
import {
  payments,
  ticketOrders,
  ticketConfigurations,
  ticketOrderItems,
  eventTickets,
  tickets,
  events,
  ticketTypes,
} from '@/db/schema/index.js';
import { sendMail } from '@/modules/emails/emails.service.js';
import axios from 'axios';
import type { purchaseTicketPaymentInput } from './finance.schema.js';
import { now } from '@/utils/timeDatehelpers.js';
import { buildPurchaseConfirmationEmail } from '../emails/templates/ticketPurchase.template.js';

// eventually have a settings table, that would have the current provider
// on the admin dashboard
// right now i use a default value paystack
const PROVIDER = 'paystack';

export class FinanceService {
  async switchToPaymentMethod(payload: purchaseTicketPaymentInput) {
    if (PROVIDER === 'paystack') {
      return this.handlePayStackPayment(payload);
    }

    return this.handleHubtelPayment();
  }

  private async handlePayStackPayment(data: purchaseTicketPaymentInput) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      JSON.stringify({
        email: data.email,
        amount: Math.round(data.totalAmount * 100),

        metadata: {
          orderId: data.orderId,
          phoneNumber: data.phoneNumber,
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${config.payment.paystack_api_key}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = response.data;

    if (!result.status) {
      throw new Error('Paystack initialization failed');
    }

    return {
      checkoutUrl: result.data.authorization_url as string,
      reference: result.data.reference as string,
      access_code: result.data.access_code as string,
    };
  }

  private async handleHubtelPayment() {}

  async isTransactionProcessed(reference: string): Promise<boolean> {
    const [existingPayment] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.reference, reference))
      .limit(1);

    return !!existingPayment;
  }

  async processPurchase(
    orderId: number,
    paymentReference: string,
    amount: number,
    currency: string,
    provider: string,
    customerEmail: string,
  ) {
    const amountToString = amount.toString();
    await db.transaction(async (tx) => {
      /**
       * Ensure order exists
       */
      const [order] = await tx
        .select()
        .from(ticketOrders)
        .where(eq(ticketOrders.id, orderId))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      /**
       * Create payment record
       */
      await tx.insert(payments).values({
        orderId: orderId,
        provider,
        reference: paymentReference,
        amount: amountToString,
        currency,
        status: 'Completed',
        paidAt: now(),
      } as typeof payments.$inferInsert);

      /**
       * Mark order completed
       */
      await tx
        .update(ticketOrders)
        .set({
          status: 'Completed',
        })
        .where(eq(ticketOrders.id, orderId));

      /**
       * Get purchased tickets
       */
      const purchasedTickets = await tx
        .select({
          eventTicketId: ticketOrderItems.eventTicketId,
        })
        .from(ticketOrderItems)
        .where(eq(ticketOrderItems.orderId, orderId));

      /**
       * Reduce inventory
       */
      for (const ticket of purchasedTickets) {
        const [configuration] = await tx
          .select({
            id: ticketConfigurations.id,
            totalSold: ticketConfigurations.totalSold,
            totalRemaining: ticketConfigurations.totalRemaining,
          })
          .from(eventTickets)
          .innerJoin(
            ticketConfigurations,
            eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
          )
          .where(eq(eventTickets.id, ticket.eventTicketId as number));

        if (!configuration) {
          continue;
        }

        await tx
          .update(ticketConfigurations)
          .set({
            totalSold: configuration.totalSold + 1,
            totalRemaining: configuration.totalRemaining - 1,
          })
          .where(eq(ticketConfigurations.id, configuration.id));
      }

      /**
       * Fetch complete order details
       * (for email)
       */
      const orderItems = await tx
        .select({
          ticketIdentifier: ticketOrderItems.ticketIdentifier,
          ticketType: ticketTypes.name,
          price: ticketConfigurations.price,
          eventName: events.title,
          eventDate: events.dateAndTime,
        })
        .from(ticketOrderItems)
        .innerJoin(
          eventTickets,
          eq(ticketOrderItems.eventTicketId, eventTickets.id),
        )
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(events, eq(tickets.eventId, events.id))
        .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
        .innerJoin(
          ticketConfigurations,
          eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
        )
        .where(eq(ticketOrderItems.orderId, orderId));

      /**
       * Send email
       */
      await sendMail(
        customerEmail,
        'Your TicketHub Tickets',
        'Your ticket purchase has been confirmed',
        buildPurchaseConfirmationEmail({
          orderId,
          items: orderItems,
          total: amount,
        }),
      );
    });
  }

  async handlePaystackWebhook(payload: any) {
    if (payload.event !== 'charge.success') return;

    console.log(
      `This is the payload from the paystack hoook ${JSON.stringify(payload)}`,
    );

    const orderId = Number(payload.data.metadata.orderId);
    // const phoneNumber = payload.data.metadata.phoneNumber; // later on would send SMS to this number
    const paymentRef = payload.data.reference;
    const currency = payload.data.currency;
    const email = payload.data.customer.email;
    const amount = payload.data.amount / 100;

    if (!orderId) {
      throw new Error('Missing orderId in Paystack Webhook Metadata');
    }
    const alreadyProcessed = await this.isTransactionProcessed(paymentRef);
    if (alreadyProcessed) return;

    await this.processPurchase(
      orderId,
      paymentRef,
      amount,
      currency,
      PROVIDER,
      email,
    );
  }
}

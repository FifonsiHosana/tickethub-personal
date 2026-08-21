import { db } from '@/db/client.js';
import {
  events,
  eventsVenues,
  eventTickets,
  payments,
  ticketConfigurations,
  ticketOrderItems,
  ticketOrders,
  ticketOrderUserDetails,
  ticketTypes,
} from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { TicketItem } from '../emails/templates/ticketPurchase.template.js';
import { AppError } from '@/middleware/errorHandler.js';

export async function getOrderForResend(orderId: number) {
  // 1. Order + purchaser contact details (guest checkout email lives here,
  //    not on Users, so this is the correct source for customerEmail)
  const [order] = await db
    .select({
      orderId: ticketOrders.id,
      status: ticketOrders.status,
      quantity: ticketOrders.quantity,
      customerEmail: ticketOrderUserDetails.email,
      firstName: ticketOrderUserDetails.firstName,
      lastName: ticketOrderUserDetails.lastName,
    })
    .from(ticketOrders)
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrderUserDetails.orderId, ticketOrders.id),
    )
    .where(eq(ticketOrders.id, orderId))
    .limit(1);

  if (!order) {
    throw new AppError(
      409,
      'Order not found confirm payment was completed and try again in a minute.',
    );
  }

  // 2. Line items: each ticket sold, with its type/price and the event it belongs to
  const orderItems: TicketItem[] = await db
    .select({
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      qrCodeUrl: ticketOrderItems.qrCodeUrl,
      ticketType: ticketTypes.name,
      price: ticketConfigurations.price,
      eventName: events.title,
      venueName: eventsVenues.venue_name,
      eventDate: events.dateAndTime,
    })
    .from(ticketOrderItems)
    .innerJoin(
      eventTickets,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )
    .innerJoin(ticketTypes, eq(ticketTypes.id, eventTickets.ticketTypeId))
    .innerJoin(
      ticketConfigurations,
      eq(ticketConfigurations.id, eventTickets.ticketConfigurationId),
    )
    .innerJoin(events, eq(events.id, eventTickets.id))
    .leftJoin(eventsVenues, eq(eventsVenues.id, events.eventVenueId))
    .where(eq(ticketOrderItems.orderId, orderId));

  // 3. Amount actually charged (Payments.amount is the authoritative total,
  //    not a sum of ticket prices, since it reflects fees/subtotal handling)
  const [payment] = await db
    .select({ amount: payments.amount })
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (!payment) {
    throw new Error(`No payment record found for order ${orderId}`);
  }

  return {
    orderId: order.orderId,
    orderItems,
    amount: payment.amount,
    customerEmail: order.customerEmail,
    accountCreated: false,
  };
}

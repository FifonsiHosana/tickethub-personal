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
  tickets,
  ticketTypes,
} from '@/db/schema/index.js';
import { and, desc, eq } from 'drizzle-orm';
import type { TicketItem } from '../emails/templates/ticketPurchase.template.js';
import { AppError } from '@/middleware/errorHandler.js';

export interface ResendTicketItem extends TicketItem {
  ticketName: string;
}

export async function getOrderForResend(orderId: number) {
  const [order] = await db
    .select({
      orderId: ticketOrders.id,
      status: ticketOrders.status,
      quantity: ticketOrders.quantity,
      customerEmail: ticketOrderUserDetails.email,
      customerPhoneNumber: ticketOrderUserDetails.phoneNumber,
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
    throw new AppError(404, 'Order not found.');
  }

  if (!order.customerEmail || !order.customerPhoneNumber) {
    throw new AppError(409, 'Order buyer contact details are incomplete.');
  }

  const orderItems: ResendTicketItem[] = await db
    .select({
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      qrCodeUrl: ticketOrderItems.qrCodeUrl,
      ticketName: ticketTypes.name,
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
    .innerJoin(tickets, eq(tickets.id, eventTickets.ticketId))
    .innerJoin(events, eq(events.id, tickets.eventId))
    .innerJoin(ticketTypes, eq(ticketTypes.id, eventTickets.ticketTypeId))
    .innerJoin(
      ticketConfigurations,
      eq(ticketConfigurations.id, eventTickets.ticketConfigurationId),
    )
    .leftJoin(eventsVenues, eq(eventsVenues.id, events.eventVenueId))
    .where(eq(ticketOrderItems.orderId, orderId));

  if (orderItems.length === 0) {
    throw new AppError(409, 'This order has no tickets to resend.');
  }

  const [payment] = await db
    .select({ amount: payments.amount })
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'Completed')))
    .orderBy(desc(payments.id))
    .limit(1);

  if (!payment) {
    throw new AppError(409, `No completed payment record found for order ${orderId}.`);
  }

  return {
    orderId: order.orderId,
    orderItems,
    amount: payment.amount,
    customerEmail: order.customerEmail,
    customerPhoneNumber: order.customerPhoneNumber,
    attendeeName: `${order.firstName} ${order.lastName}`.trim(),
    accountCreated: false,
  };
}


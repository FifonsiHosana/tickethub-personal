import { db } from '@/db/client.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  tickets,
  ticketTypes,
  eventTickets,
  events,
} from '@/db/schema/index.js';

import { and, between, desc, eq, like, sql } from 'drizzle-orm';

import {
  getSalesSummary as getSharedSalesSummary,
  getRevenueTrend,
  getTicketSalesBreakdown as getSharedTicketSalesBreakdown,
} from '../queries/index.js';

export interface GetOrganizerSalesOptions {
  organizerId: number;

  page?: number;

  pageSize?: number;

  eventId?: number;

  status?: 'Completed' | 'Failed';

  from?: string;

  to?: string;

  search?: string;
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function buildFilters({
  organizerId,
  eventId,
  status,
  from,
  to,
  search,
}: GetOrganizerSalesOptions) {
  const filters = [eq(events.organizerId, organizerId)];

  if (eventId) {
    filters.push(eq(events.id, eventId));
  }

  if (status) {
    filters.push(eq(payments.status, status));
  }

  if (from && to) {
    filters.push(between(payments.paidAt, from, to));
  }

  if (search) {
    filters.push(like(ticketOrderUserDetails.email, `%${search}%`));
  }

  return filters;
}

/* -----------------------------------------------------------------------------
 * Services
 * -------------------------------------------------------------------------- */

export async function getOrganizerSales(options: GetOrganizerSalesOptions) {
  const { page = 1, pageSize = 10 } = options;

  const offset = (page - 1) * pageSize;

  const filters = buildFilters(options);

  const sales = await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      phoneNumber: ticketOrderUserDetails.phoneNumber,

      eventId: events.id,

       eventTitle: events.title,

       ticketType: sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`,

       ticketSummary: sql<string>`GROUP_CONCAT(DISTINCT ${tickets.name} SEPARATOR ', ')`,

       quantity: sql<number>`MAX(${ticketOrders.quantity})`,

       amount: payments.amount,

       currency: payments.currency,

       provider: payments.provider,

       paymentStatus: payments.status,

       reference: payments.reference,

       purchasedAt: payments.paidAt,

       totalTickets: sql<number>`COUNT(${ticketOrderItems.id})`,

       checkedInCount:
         sql<number>`COUNT(CASE WHEN ${ticketOrderItems.checkedIn} = 1 THEN 1 END)`,
     })

     .from(payments)

     .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

     .innerJoin(
       ticketOrderUserDetails,
       eq(ticketOrders.id, ticketOrderUserDetails.orderId),
     )

     .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

     .innerJoin(
       eventTickets,
       eq(ticketOrderItems.eventTicketId, eventTickets.id),
     )
     .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

     .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))

     .innerJoin(events, eq(tickets.eventId, events.id))

     .where(and(...filters))

     .groupBy(ticketOrders.id, payments.id, ticketOrderUserDetails.id, events.id)

     .orderBy(desc(payments.paidAt))

     .limit(pageSize)

     .offset(offset);

  const total = await db
    .select({
      total: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .where(and(...filters));

  return {
    data: sales,

    pagination: {
      page,

      pageSize,

      total: Number(total[0]?.total ?? 0),

      totalPages: Math.ceil(Number(total[0]?.total ?? 0) / pageSize),
    },
  };
}

export async function getSaleById(organizerId: number, orderId: number) {
  const sale = await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      paymentReference: payments.reference,

      paymentProvider: payments.provider,

      paymentStatus: payments.status,

      amount: payments.amount,

      currency: payments.currency,

      paidAt: payments.paidAt,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      customerPhone: ticketOrderUserDetails.phoneNumber,

      eventId: events.id,

      eventTitle: events.title,

      eventDate: events.dateAndTime,

      ticketName: tickets.name,

      ticketIdentifier: ticketOrderItems.ticketIdentifier,

      qrCodeUrl: ticketOrderItems.qrCodeUrl,

      checkedIn: ticketOrderItems.checkedIn,

      checkedInAt: ticketOrderItems.checkedInAt,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(ticketOrders.id, orderId),

        eq(events.organizerId, organizerId),
      ),
    );

  if (!sale.length) {
    throw new Error('Sale not found.');
  }

  return sale;
}

export async function getEventSales(organizerId: number, eventId: number) {
  return await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      ticketName: tickets.name,

      quantity: ticketOrders.quantity,

      amount: payments.amount,

      paymentStatus: payments.status,

      provider: payments.provider,

      purchasedAt: payments.paidAt,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(events.id, eventId),

        eq(events.organizerId, organizerId),
      ),
    )

    .orderBy(desc(payments.paidAt));
}

/**
 * Get organizer sales summary
 *
 * Used for dashboard cards:
 * - total revenue
 * - completed orders
 * - failed payments
 * - tickets sold
 */
export async function getSalesSummary(organizerId: number) {
  return getSharedSalesSummary(organizerId);
}

/**
 * Revenue breakdown over time — delegates to shared query
 */
export async function getRevenueBreakdown(
  organizerId: number,
  from: string,
  to: string,
) {
  return getRevenueTrend(organizerId, { from, to });
}

/**
 * Sales by ticket type — delegates to shared query
 */
export async function getTicketSalesBreakdown(organizerId: number) {
  return getSharedTicketSalesBreakdown(organizerId);
}

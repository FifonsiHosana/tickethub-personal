import { db } from '@/db/client.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  tickets,
  eventTickets,
  events,
} from '@/db/schema/index.js';

import { and, between, count, desc, eq, like, sql } from 'drizzle-orm';

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

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

      ticketName: tickets.name,

      quantity: ticketOrders.quantity,

      amount: payments.amount,

      currency: payments.currency,

      provider: payments.provider,

      paymentStatus: payments.status,

      reference: payments.reference,

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

    .where(and(...filters))

    .orderBy(desc(payments.paidAt))

    .limit(pageSize)

    .offset(offset);

  const total = await db
    .select({
      total: count(),
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
  const result = await db
    .select({
      totalRevenue: sql<string>`
            COALESCE(
              SUM(
                ${payments.amount}
              ),
              0
            )
          `,

      completedOrders: sql<number>`
            COUNT(
              DISTINCT ${ticketOrders.id}
            )
          `,

      ticketsSold: sql<number>`
            COUNT(
              ${ticketOrderItems.id}
            )
          `,

      successfulPayments: sql<number>`
            SUM(
              CASE
                WHEN ${payments.status} = 'Completed'
                THEN 1
                ELSE 0
              END
            )
          `,

      failedPayments: sql<number>`
            SUM(
              CASE
                WHEN ${payments.status} = 'Failed'
                THEN 1
                ELSE 0
              END
            `,
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

    .where(eq(events.organizerId, organizerId));

  return {
    totalRevenue: Number(result[0]?.totalRevenue ?? 0),

    completedOrders: Number(result[0]?.completedOrders ?? 0),

    ticketsSold: Number(result[0]?.ticketsSold ?? 0),

    successfulPayments: Number(result[0]?.successfulPayments ?? 0),

    failedPayments: Number(result[0]?.failedPayments ?? 0),
  };
}

/**
 * Revenue breakdown over time
 *
 * Used for:
 * - line charts
 * - bar charts
 *
 * Example:
 *
 * [
 *   {
 *      date:"2026-07-01",
 *      revenue:5000
 *   }
 * ]
 */
export async function getRevenueBreakdown(
  organizerId: number,
  from: string,
  to: string,
) {
  return await db
    .select({
      date: sql<string>`
          DATE(
            ${payments.paidAt}
          )
        `,

      revenue: sql<string>`
          COALESCE(
            SUM(
              ${payments.amount}
            ),
            0
          )
        `,

      transactions: sql<number>`
          COUNT(
            ${payments.id}
          )
        `,
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

    .where(
      and(
        eq(events.organizerId, organizerId),

        eq(payments.status, 'Completed'),

        between(payments.paidAt, from, to),
      ),
    )

    .groupBy(
      sql`
        DATE(
          ${payments.paidAt}
        )
      `,
    )

    .orderBy(
      sql`
        DATE(
          ${payments.paidAt}
        )
      `,
    );
}

/**
 * Sales by ticket type
 *
 * Example:
 *
 * VIP        200 sold
 * Regular    450 sold
 */
export async function getTicketSalesBreakdown(organizerId: number) {
  return await db

    .select({
      ticketName: tickets.name,

      sold: sql<number>`
          COUNT(
            ${ticketOrderItems.id}
          )
        `,

      revenue: sql<string>`
          COALESCE(
            SUM(
              ${payments.amount}
            ),
            0
          )
        `,
    })

    .from(ticketOrderItems)

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))

    .innerJoin(payments, eq(ticketOrders.id, payments.orderId))

    .where(
      and(
        eq(events.organizerId, organizerId),

        eq(payments.status, 'Completed'),
      ),
    )

    .groupBy(tickets.id);
}

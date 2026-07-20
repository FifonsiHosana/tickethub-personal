import { db } from '@/db/client.js';

import {
  events,
  tickets,
  eventTickets,
  ticketOrders,
  ticketOrderItems,
} from '@/db/schema/index.js';

import { payments } from '@/db/schema/finance.js';

import { and, eq, sql, between } from 'drizzle-orm';

export interface AnalyticsDateRange {
  from?: string | undefined;

  to?: string | undefined;
}

/**
 * Organizer dashboard overview cards
 */
export async function getOverviewAnalytics(organizerId: number) {
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

      totalOrders: sql<number>`
            COUNT(
              DISTINCT ${ticketOrders.id}
            )
          `,

      ticketsSold: sql<number>`
            COUNT(
              ${ticketOrderItems.id}
            )
          `,

      totalEvents: sql<number>`
            COUNT(
              DISTINCT ${events.id}
            )
          `,
    })

    .from(events)

    .leftJoin(tickets, eq(events.id, tickets.eventId))

    .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))

    .leftJoin(
      ticketOrderItems,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )

    .leftJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))

    .leftJoin(payments, eq(ticketOrders.id, payments.orderId))

    .where(eq(events.organizerId, organizerId));

  return {
    totalRevenue: Number(result[0]?.totalRevenue ?? 0),

    totalOrders: Number(result[0]?.totalOrders ?? 0),

    ticketsSold: Number(result[0]?.ticketsSold ?? 0),

    totalEvents: Number(result[0]?.totalEvents ?? 0),
  };
}

export async function getRevenueTrend(
  organizerId: number,
  range: AnalyticsDateRange,
) {
  const filters = [
    eq(events.organizerId, organizerId),

    eq(payments.status, 'Completed'),
  ];

  if (range.from && range.to) {
    filters.push(between(payments.paidAt, range.from, range.to));
  }

  return await db

    .select({
      date: sql<string>`
          DATE(
            ${payments.paidAt}
          )
        `,

      revenue: sql<string>`
          SUM(
            ${payments.amount}
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

    .where(and(...filters))

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

export async function getEventPerformance(organizerId: number) {
  const result = await db

    .select({
      eventId: events.id,

      eventName: events.title,

      capacity: events.capacity,

      ticketsSold: sql<number>`
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

    .from(events)

    .leftJoin(tickets, eq(events.id, tickets.eventId))

    .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))

    .leftJoin(
      ticketOrderItems,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )

    .leftJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))

    .leftJoin(payments, eq(ticketOrders.id, payments.orderId))

    .where(eq(events.organizerId, organizerId))

    .groupBy(events.id);

  return result.map((event) => ({
    eventId: event.eventId,

    eventName: event.eventName,

    capacity: event.capacity,

    ticketsSold: Number(event.ticketsSold ?? 0),

    revenue: Number(event.revenue ?? 0),

    occupancyRate: event.capacity
      ? Number(
          ((Number(event.ticketsSold ?? 0) / event.capacity) * 100).toFixed(2),
        )
      : 0,
  }));
}

export async function getTicketPerformance(organizerId: number) {
  const result = await db

    .select({
      ticketId: tickets.id,

      ticketName: tickets.name,

      eventName: events.title,

      ticketsSold: sql<number>`
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

    .from(tickets)

    .innerJoin(events, eq(tickets.eventId, events.id))

    .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))

    .leftJoin(
      ticketOrderItems,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )

    .leftJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))

    .leftJoin(payments, eq(ticketOrders.id, payments.orderId))

    .where(eq(events.organizerId, organizerId))

    .groupBy(tickets.id);

  return result.map((ticket) => ({
    ticketId: ticket.ticketId,

    ticketName: ticket.ticketName,

    eventName: ticket.eventName,

    ticketsSold: Number(ticket.ticketsSold ?? 0),

    revenue: Number(ticket.revenue ?? 0),
  }));
}

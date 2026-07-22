import { db } from '@/db/client.js';
import { and, eq, sql, desc, gte, like, count } from 'drizzle-orm';

import {
  events,
  tickets,
  eventTickets,
  ticketOrderItems,
  ticketOrders,
  payments,
} from '@/db/schema/index.js';

/**
 * Event counts broken down by status
 */
export async function getEventCountsByStatus(organizerId: number) {
  const [result] = await db
    .select({
      totalEvents: sql<number>`COUNT(*)`,
      publishedEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Published' THEN 1 ELSE 0 END)`,
      draftEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Draft' THEN 1 ELSE 0 END)`,
      completedEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Completed' THEN 1 ELSE 0 END)`,
      cancelledEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Cancelled' THEN 1 ELSE 0 END)`,
    })
    .from(events)
    .where(eq(events.organizerId, organizerId));

  return {
    totalEvents: Number(result?.totalEvents ?? 0),
    publishedEvents: Number(result?.publishedEvents ?? 0),
    draftEvents: Number(result?.draftEvents ?? 0),
    completedEvents: Number(result?.completedEvents ?? 0),
    cancelledEvents: Number(result?.cancelledEvents ?? 0),
  };
}

/**
 * Upcoming events sorted by date
 */
export async function getUpcomingEvents(organizerId: number, limit = 5) {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.organizerId, organizerId),
        gte(events.dateAndTime, new Date().toISOString()),
      ),
    )
    .orderBy(events.dateAndTime)
    .limit(limit);
}

/**
 * Top selling events by ticket count
 */
export async function getTopSellingEvents(organizerId: number, limit = 5) {
  return db
    .select({
      eventId: events.id,
      eventTitle: events.title,
      ticketsSold: sql<number>`COUNT(${ticketOrderItems.id})`,
    })
    .from(events)
    .innerJoin(tickets, eq(tickets.eventId, events.id))
    .innerJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(
      ticketOrderItems,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .where(
      and(
        eq(events.organizerId, organizerId),
        eq(ticketOrders.status, 'Completed'),
      ),
    )
    .groupBy(events.id)
    .orderBy(desc(sql`COUNT(${ticketOrderItems.id})`))
    .limit(limit);
}

export interface EventPerformanceParams {
  organizerId: number;
  page?: number;
  pageSize?: number;
  search?: string | undefined;
}

/**
 * Per-event performance with occupancy rate (for analytics table)
 *
 * Uses a correlated subquery for revenue to avoid doubling payments
 * when an order contains items for multiple ticket types.
 */
export async function getEventPerformance(params: EventPerformanceParams) {
  const { organizerId, page = 1, pageSize = 10, search } = params;
  const offset = (page - 1) * pageSize;
  const filters = [eq(events.organizerId, organizerId)];

  if (search) {
    filters.push(like(events.title, `%${search}%`));
  }

  const data = await db
    .select({
      eventId: events.id,
      eventName: events.title,
      capacity: events.capacity,

      ticketsSold: sql<number>`COUNT(${ticketOrders.id})`,

      revenue: sql<string>`
        COALESCE((
          SELECT COALESCE(SUM(${payments.amount}), 0)
          FROM ${payments}
          INNER JOIN ${ticketOrders} ON ${payments.orderId} = ${ticketOrders.id}
          WHERE ${payments.status} = 'Completed'
            AND ${ticketOrders.id} IN (
              SELECT ${ticketOrderItems.orderId}
              FROM ${ticketOrderItems}
              INNER JOIN ${eventTickets} ON ${ticketOrderItems.eventTicketId} = ${eventTickets.id}
              INNER JOIN ${tickets} ON ${eventTickets.ticketId} = ${tickets.id}
              WHERE ${tickets.eventId} = ${events.id}
            )
        ), 0)
      `,
    })
    .from(events)
    .leftJoin(tickets, eq(events.id, tickets.eventId))
    .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))
    .leftJoin(
      ticketOrderItems,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )
    .leftJoin(ticketOrders, and(eq(ticketOrderItems.orderId, ticketOrders.id), eq(ticketOrders.status, 'Completed')))
    .where(and(...filters))
    .groupBy(events.id)
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(events)
    .where(and(...filters));

  const total = Number(totalResult?.total ?? 0);

  const mapped = data.map((event) => ({
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

  return {
    data: mapped,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

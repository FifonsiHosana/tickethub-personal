import { db } from '@/db/client.js';
import { and, eq, sql, desc, gte, like, count, type SQL } from 'drizzle-orm';
import { toUpperBound, type DateRange } from '@/utils/dateRange.js';

import {
  events,
  tickets,
  eventTickets,
  ticketOrderItems,
  ticketOrders,
  payments,
  ticketConfigurations,
} from '@/db/schema/index.js';

type EventFilter = { eventId?: number | undefined };

export async function getEventCountsByStatus(
  organizerId: number,
  options?: EventFilter,
) {
  const filters: any[] = [eq(events.organizerId, organizerId)];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));

  const [result] = await db
    .select({
      totalEvents: sql<number>`COUNT(*)`,
      publishedEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Published' THEN 1 ELSE 0 END)`,
      draftEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Draft' THEN 1 ELSE 0 END)`,
      completedEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Completed' THEN 1 ELSE 0 END)`,
      cancelledEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Cancelled' THEN 1 ELSE 0 END)`,
    })
    .from(events)
    .where(and(...filters));

  return {
    totalEvents: Number(result?.totalEvents ?? 0),
    publishedEvents: Number(result?.publishedEvents ?? 0),
    draftEvents: Number(result?.draftEvents ?? 0),
    completedEvents: Number(result?.completedEvents ?? 0),
    cancelledEvents: Number(result?.cancelledEvents ?? 0),
  };
}

export async function getUpcomingEvents(
  organizerId: number,
  page = 1,
  pageSize = 5,
  options?: EventFilter,
) {
  const offset = (page - 1) * pageSize;
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    gte(events.dateAndTime, new Date().toISOString()),
  ];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));

  const data = await db
    .select()
    .from(events)
    .where(and(...filters))
    .orderBy(events.dateAndTime)
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(events)
    .where(and(...filters));

  const total = Number(totalResult?.total ?? 0);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

function paymentDateClause(range?: DateRange) {
  const parts: SQL[] = [];
  if (range?.from) parts.push(sql`${payments.paidAt} >= ${range.from}`);
  if (range?.to) parts.push(sql`${payments.paidAt} <= ${toUpperBound(range.to)}`);
  return parts.length ? sql`AND ${sql.join(parts, sql` AND `)}` : sql``;
}

function paidTicketItemCountForEvent(range?: DateRange) {
  return sql<number>`(
    SELECT COUNT(${ticketOrderItems.id})
    FROM ${ticketOrderItems}
    INNER JOIN ${ticketOrders}
      ON ${ticketOrderItems.orderId} = ${ticketOrders.id}
    INNER JOIN ${payments}
      ON ${payments.orderId} = ${ticketOrders.id}
     AND ${payments.status} = 'Completed'
    INNER JOIN ${eventTickets}
      ON ${ticketOrderItems.eventTicketId} = ${eventTickets.id}
    INNER JOIN ${tickets}
      ON ${eventTickets.ticketId} = ${tickets.id}
    WHERE ${tickets.eventId} = ${events.id}
      AND ${ticketOrderItems.status} = 'Valid'
    ${paymentDateClause(range)}
  )`;
}

function paidTicketRevenueForEvent(range?: DateRange) {
  return sql<string>`(
    SELECT COALESCE(SUM(${ticketConfigurations.price}), 0)
    FROM ${ticketOrderItems}
    INNER JOIN ${ticketOrders}
      ON ${ticketOrderItems.orderId} = ${ticketOrders.id}
    INNER JOIN ${payments}
      ON ${payments.orderId} = ${ticketOrders.id}
     AND ${payments.status} = 'Completed'
    INNER JOIN ${eventTickets}
      ON ${ticketOrderItems.eventTicketId} = ${eventTickets.id}
    INNER JOIN ${tickets}
      ON ${eventTickets.ticketId} = ${tickets.id}
    INNER JOIN ${ticketConfigurations}
      ON ${eventTickets.ticketConfigurationId} = ${ticketConfigurations.id}
    WHERE ${tickets.eventId} = ${events.id}
      AND ${ticketOrderItems.status} = 'Valid'
    ${paymentDateClause(range)}
  )`;
}

export async function getTopSellingEvents(
  organizerId: number,
  page = 1,
  pageSize = 5,
  range?: DateRange,
  options?: EventFilter,
) {
  const offset = (page - 1) * pageSize;
  const filters: any[] = [eq(events.organizerId, organizerId)];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));
  const ticketsSoldExpr = paidTicketItemCountForEvent(range);

  const data = await db
    .select({
      eventId: events.id,
      eventTitle: events.title,
      ticketsSold: ticketsSoldExpr,
    })
    .from(events)
    .where(and(...filters))
    .orderBy(desc(ticketsSoldExpr))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(events)
    .where(and(...filters));

  const total = Number(totalResult?.total ?? 0);

  return {
    data: data.filter((event) => Number(event.ticketsSold ?? 0) > 0),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export interface EventPerformanceParams {
  organizerId: number;
  page?: number;
  pageSize?: number;
  search?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  eventId?: number | undefined;
}

export async function getEventPerformance(params: EventPerformanceParams) {
  const { organizerId, page = 1, pageSize = 10, search, from, to } = params;
  const offset = (page - 1) * pageSize;
  const filters = [eq(events.organizerId, organizerId)];

  if (search) filters.push(like(events.title, `%${search}%`));
  if (params.eventId) filters.push(eq(events.id, params.eventId));

  const range = { from, to };
  const ticketsSoldExpr = paidTicketItemCountForEvent(range);
  const revenueExpr = paidTicketRevenueForEvent(range);

  const data = await db
    .select({
      eventId: events.id,
      eventName: events.title,
      capacity: events.capacity,
      ticketsSold: ticketsSoldExpr,
      revenue: revenueExpr,
    })
    .from(events)
    .where(and(...filters))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(events)
    .where(and(...filters));

  const total = Number(totalResult?.total ?? 0);

  return {
    data: data.map((event) => ({
      eventId: event.eventId,
      eventName: event.eventName,
      capacity: event.capacity,
      ticketsSold: Number(event.ticketsSold ?? 0),
      revenue: Number(event.revenue ?? 0),
      occupancyRate: event.capacity
        ? Number(((Number(event.ticketsSold ?? 0) / event.capacity) * 100).toFixed(2))
        : 0,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
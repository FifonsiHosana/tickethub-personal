import { db } from '@/db/client.js';
import { and, eq, sql, desc, count } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

import {
  events,
  tickets,
  eventTickets,
  ticketOrderItems,
  ticketOrders,
  ticketConfigurations,
} from '@/db/schema/index.js';

/**
 * Total tickets sold (completed orders only)
 */
export async function getTicketsSold(organizerId: number, range?: DateRange) {
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    eq(ticketOrders.status, 'Completed'),
  ];
  applyDateRange(filters, ticketOrders.createdAt, range);

  const [result] = await db
    .select({
      count: sql<number>`COUNT(${ticketOrderItems.id})`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters));

  return Number(result?.count ?? 0);
}

/**
 * Total completed check-ins for an organizer
 */
export async function getCheckInCount(
  organizerId: number,
  range?: DateRange,
) {
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    eq(ticketOrders.status, 'Completed'),
    eq(ticketOrderItems.checkedIn, true),
  ];
  applyDateRange(filters, ticketOrderItems.checkedInAt, range);

  const [result] = await db
    .select({
      count: sql<number>`COUNT(${ticketOrderItems.id})`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters));

  return Number(result?.count ?? 0);
}

/**
 * Total tickets remaining across all event ticket configurations
 */
export async function getTicketsRemaining(organizerId: number) {
  const [result] = await db
    .select({
      remaining:
        sql<number>`COALESCE(SUM(${ticketConfigurations.totalRemaining}), 0)`,
    })
    .from(ticketConfigurations)
    .innerJoin(
      eventTickets,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(eq(events.organizerId, organizerId));

  return Number(result?.remaining ?? 0);
}

/**
 * Sales breakdown by ticket type (for charts)
 */
export async function getTicketSalesBreakdown(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const filtersList: any[] = [
    eq(events.organizerId, organizerId),
    eq(ticketOrders.status, 'Completed'),
  ];

  if (filters?.eventId) {
    filtersList.push(eq(events.id, filters.eventId));
  }

  if (filters?.ticketId) {
    filtersList.push(eq(tickets.id, filters.ticketId));
  }

  applyDateRange(filtersList, ticketOrders.createdAt, range);

  return db
    .select({
      ticketName: tickets.name,
      sold: sql<number>`COUNT(${ticketOrderItems.id})`,
      revenue:
        sql<string>`COALESCE(COUNT(${ticketOrderItems.id}) * MAX(${ticketConfigurations.price}), 0)`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filtersList))
    .groupBy(tickets.id);
}

export interface TicketPerformanceParams {
  organizerId: number;
  page?: number;
  pageSize?: number;
  search?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

/**
 * Per-ticket performance (for analytics table)
 */
export async function getTicketPerformance(params: TicketPerformanceParams) {
  const { organizerId, page = 1, pageSize = 10, search, from, to } = params;
  const offset = (page - 1) * pageSize;
  const filters = [eq(events.organizerId, organizerId)];
  applyDateRange(filters, ticketOrders.createdAt, { from, to });

  if (search) {
    filters.push(
      sql`(${tickets.name} LIKE ${`%${search}%`} OR ${events.title} LIKE ${`%${search}%`})` as any,
    );
  }

  const data = await db
    .select({
      ticketId: tickets.id,
      ticketName: tickets.name,
      eventName: events.title,
      ticketsSold: sql<number>`COUNT(${ticketOrders.id})`,
      revenue:
        sql<string>`COALESCE(COUNT(${ticketOrders.id}) * MAX(${ticketConfigurations.price}), 0)`,
    })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))
    .leftJoin(
      ticketOrderItems,
      eq(eventTickets.id, ticketOrderItems.eventTicketId),
    )
    .leftJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .leftJoin(ticketOrders, and(eq(ticketOrderItems.orderId, ticketOrders.id), eq(ticketOrders.status, 'Completed')))
    .where(and(...filters))
    .groupBy(tickets.id)
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters));

  const total = Number(totalResult?.total ?? 0);

  const mapped = data.map((t) => ({
    ticketId: t.ticketId,
    ticketName: t.ticketName,
    eventName: t.eventName,
    ticketsSold: Number(t.ticketsSold ?? 0),
    revenue: Number(t.revenue ?? 0),
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

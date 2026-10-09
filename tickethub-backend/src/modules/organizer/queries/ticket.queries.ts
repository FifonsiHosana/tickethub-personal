import { db } from '@/db/client.js';
import { and, eq, sql, count } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

import {
  events,
  tickets,
  eventTickets,
  ticketOrderItems,
  ticketOrders,
  ticketConfigurations,
  payments,
} from '@/db/schema/index.js';

const completedPayment = eq(payments.status, 'Completed');

type EventFilter = { eventId?: number | undefined };

export async function getTicketsSold(
  organizerId: number,
  range?: DateRange,
  options?: EventFilter,
) {
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    completedPayment,
    eq(ticketOrderItems.status, 'Valid'),
  ];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));
  applyDateRange(filters, payments.paidAt, range);

  const [result] = await db
    .select({ count: sql<number>`COUNT(${ticketOrderItems.id})` })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters));

  return Number(result?.count ?? 0);
}

export async function getCheckInCount(
  organizerId: number,
  range?: DateRange,
  options?: EventFilter,
) {
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    completedPayment,
    eq(ticketOrderItems.checkedIn, true),
    eq(ticketOrderItems.status, 'Valid'),
  ];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));
  applyDateRange(filters, ticketOrderItems.checkedInAt, range);

  const [result] = await db
    .select({ count: sql<number>`COUNT(${ticketOrderItems.id})` })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters));

  return Number(result?.count ?? 0);
}

export async function getTicketCapacityStats(
  organizerId: number,
  options?: EventFilter,
) {
  const filters: any[] = [eq(events.organizerId, organizerId)];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));

  const [result] = await db
    .select({
      totalAvailable: sql<number>`COALESCE(SUM(${ticketConfigurations.totalCount}), 0)`,
      ticketsSold: sql<number>`COALESCE(SUM(issued.sold), 0)`,
      ticketsRemaining: sql<number>`GREATEST(COALESCE(SUM(${ticketConfigurations.totalCount}), 0) - COALESCE(SUM(issued.sold), 0), 0)`,
    })
    .from(ticketConfigurations)
    .innerJoin(eventTickets, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(
      sql`(
        SELECT ${eventTickets.ticketConfigurationId} AS configId,
               COUNT(${ticketOrderItems.id}) AS sold
        FROM ${ticketOrderItems}
        INNER JOIN ${ticketOrders}
          ON ${ticketOrderItems.orderId} = ${ticketOrders.id}
        INNER JOIN ${payments}
          ON ${payments.orderId} = ${ticketOrders.id}
         AND ${payments.status} = 'Completed'
        INNER JOIN ${eventTickets}
          ON ${ticketOrderItems.eventTicketId} = ${eventTickets.id}
        WHERE ${ticketOrderItems.status} = 'Valid'
        GROUP BY ${eventTickets.ticketConfigurationId}
      ) issued`,
      sql`issued.configId = ${ticketConfigurations.id}`,
    )
    .where(and(...filters));

  return {
    totalTicketsAvailable: Number(result?.totalAvailable ?? 0),
    totalTicketsSold: Number(result?.ticketsSold ?? 0),
    totalTicketsRemaining: Number(result?.ticketsRemaining ?? 0),
  };
}

export async function getTicketsRemaining(
  organizerId: number,
  options?: EventFilter,
) {
  const stats = await getTicketCapacityStats(organizerId, options);
  return stats.totalTicketsRemaining;
}

export async function getTicketSalesBreakdown(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const filtersList: any[] = [
    eq(events.organizerId, organizerId),
    completedPayment,
    eq(ticketOrderItems.status, 'Valid'),
  ];

  if (filters?.eventId) filtersList.push(eq(events.id, filters.eventId));
  if (filters?.ticketId) filtersList.push(eq(tickets.id, filters.ticketId));

  applyDateRange(filtersList, payments.paidAt, range);

  return db
    .select({
      ticketName: tickets.name,
      sold: sql<number>`COUNT(${ticketOrderItems.id})`,
      revenue: sql<string>`COALESCE(SUM(${ticketConfigurations.price}), 0)`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
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
  eventId?: number | undefined;
}

function paidTicketDateSql(from?: string, to?: string) {
  if (from && to) return sql`AND p.paidAt BETWEEN ${from} AND ${to}`;
  if (from) return sql`AND p.paidAt >= ${from}`;
  if (to) return sql`AND p.paidAt <= ${to}`;
  return sql``;
}

export async function getTicketPerformance(params: TicketPerformanceParams) {
  const { organizerId, page = 1, pageSize = 10, search, from, to } = params;
  const offset = (page - 1) * pageSize;
  const ticketFilters: any[] = [eq(events.organizerId, organizerId)];
  if (params.eventId) ticketFilters.push(eq(events.id, params.eventId));

  if (search) {
    const pattern = `%${search}%`;
    ticketFilters.push(
      sql`(${tickets.name} LIKE ${pattern} OR ${events.title} LIKE ${pattern})` as any,
    );
  }

  const paidDateFilter = paidTicketDateSql(from, to);

  const data = await db
    .select({
      ticketId: tickets.id,
      ticketName: tickets.name,
      eventName: events.title,
      ticketsSold: sql<number>`(
        SELECT COUNT(toi.id)
        FROM ${ticketOrderItems} toi
        INNER JOIN ${ticketOrders} o ON o.id = toi.orderId
        INNER JOIN ${payments} p ON p.orderId = o.id AND p.status = 'Completed'
        INNER JOIN ${eventTickets} et ON et.id = toi.eventTicketId
        WHERE et.ticketId = ${tickets.id}
          AND toi.status = 'Valid'
        ${paidDateFilter}
      )`,
      revenue: sql<string>`COALESCE((
        SELECT SUM(tc.price)
        FROM ${ticketOrderItems} toi
        INNER JOIN ${ticketOrders} o ON o.id = toi.orderId
        INNER JOIN ${payments} p ON p.orderId = o.id AND p.status = 'Completed'
        INNER JOIN ${eventTickets} et ON et.id = toi.eventTicketId
        INNER JOIN ${ticketConfigurations} tc ON tc.id = et.ticketConfigurationId
        WHERE et.ticketId = ${tickets.id}
          AND toi.status = 'Valid'
        ${paidDateFilter}
      ), 0)`,
    })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...ticketFilters))
    .groupBy(tickets.id)
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ total: count() })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...ticketFilters));

  const total = Number(totalResult?.total ?? 0);

  return {
    data: data.map((t) => ({
      ticketId: t.ticketId,
      ticketName: t.ticketName,
      eventName: t.eventName,
      ticketsSold: Number(t.ticketsSold ?? 0),
      revenue: Number(t.revenue ?? 0),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
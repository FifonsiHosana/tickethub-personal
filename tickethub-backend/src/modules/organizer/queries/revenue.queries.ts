import { db } from '@/db/client.js';
import { and, eq, sql } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  eventTickets,
  ticketConfigurations,
  tickets,
  events,
} from '@/db/schema/index.js';

export type { DateRange };

export async function getTotalRevenue(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const queryFilters: any[] = [
    eq(events.organizerId, organizerId),
    eq(payments.status, 'Completed'),
    eq(ticketOrderItems.status, 'Valid'),
  ];

  if (filters?.eventId) queryFilters.push(eq(events.id, filters.eventId));
  if (filters?.ticketId) queryFilters.push(eq(tickets.id, filters.ticketId));

  applyDateRange(queryFilters, payments.paidAt, range);

  const [result] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${ticketConfigurations.price}), 0)`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...queryFilters));

  return Number(result?.totalRevenue ?? 0);
}

export async function getRevenueTrend(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const queryFilters: any[] = [
    eq(events.organizerId, organizerId),
    eq(payments.status, 'Completed'),
    eq(ticketOrderItems.status, 'Valid'),
  ];

  if (filters?.eventId) queryFilters.push(eq(events.id, filters.eventId));
  if (filters?.ticketId) queryFilters.push(eq(tickets.id, filters.ticketId));

  applyDateRange(queryFilters, payments.paidAt, range);

  return db
    .select({
      date: sql<string>`DATE(${payments.paidAt})`,
      revenue: sql<string>`COALESCE(SUM(${ticketConfigurations.price}), 0)`,
      transactions: sql<number>`COUNT(DISTINCT ${payments.id})`,
      ticketsSold: sql<number>`COUNT(${ticketOrderItems.id})`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...queryFilters))
    .groupBy(sql`DATE(${payments.paidAt})`)
    .orderBy(sql`DATE(${payments.paidAt})`);
}
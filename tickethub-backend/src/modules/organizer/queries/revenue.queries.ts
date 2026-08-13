import { db } from '@/db/client.js';
import { and, eq, sql, inArray } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  eventTickets,
  tickets,
  events,
} from '@/db/schema/index.js';

export type { DateRange };

/**
 * Total completed revenue for an organizer
 */
export async function getTotalRevenue(
  organizerId: number,
  range?: DateRange,
) {
  const filters: any[] = [
    eq(payments.status, 'Completed'),
    inArray(
      ticketOrders.id,
      db
        .select({ id: ticketOrders.id })
        .from(ticketOrders)
        .innerJoin(
          ticketOrderItems,
          eq(ticketOrderItems.orderId, ticketOrders.id),
        )
        .innerJoin(
          eventTickets,
          eq(ticketOrderItems.eventTicketId, eventTickets.id),
        )
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(events, eq(tickets.eventId, events.id))
        .where(eq(events.organizerId, organizerId)),
    ),
  ];
  applyDateRange(filters, payments.paidAt, range);

  const [result] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${payments.subtotal}), 0)`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...filters));

  return Number(result?.totalRevenue ?? 0);
}

/**
 * Daily revenue trend within an optional date range.
 *
 * `ticketsSold` is computed via a correlated subquery (instead of a join) so
 * the payment row count is never inflated and SUM(subtotal) stays correct.
 */
export async function getRevenueTrend(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const scopes = [eq(events.organizerId, organizerId)];

  if (filters?.eventId) {
    scopes.push(eq(events.id, filters.eventId));
  }

  const dateFilters: any[] = [
    eq(payments.status, 'Completed'),
    inArray(
      ticketOrders.id,
      db
        .select({ id: ticketOrders.id })
        .from(ticketOrders)
        .innerJoin(
          ticketOrderItems,
          eq(ticketOrderItems.orderId, ticketOrders.id),
        )
        .innerJoin(
          eventTickets,
          eq(ticketOrderItems.eventTicketId, eventTickets.id),
        )
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(events, eq(tickets.eventId, events.id))
        .where(and(...scopes)),
    ),
  ];

  applyDateRange(dateFilters, payments.paidAt, range);

  return db
    .select({
      date: sql<string>`DATE(${payments.paidAt})`,
      revenue: sql<string>`SUM(${payments.subtotal})`,
      transactions: sql<number>`COUNT(${payments.id})`,
      ticketsSold: sql<number>`COALESCE(SUM(
        (SELECT COUNT(${ticketOrderItems.id})
           FROM ${ticketOrderItems}
           INNER JOIN ${eventTickets} et2 ON et2.id = ${ticketOrderItems.eventTicketId}
           INNER JOIN ${tickets} t2 ON t2.id = et2.ticketId
           INNER JOIN ${events} e2 ON e2.id = t2.eventId
           WHERE ${ticketOrderItems.orderId} = ${ticketOrders.id}
             AND e2.organizerId = ${organizerId}
             ${filters?.eventId ? sql`AND e2.id = ${filters.eventId}` : sql``}
             ${filters?.ticketId ? sql`AND t2.id = ${filters.ticketId}` : sql``})
      ), 0)`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...dateFilters))
    .groupBy(sql`DATE(${payments.paidAt})`)
    .orderBy(sql`DATE(${payments.paidAt})`);
}

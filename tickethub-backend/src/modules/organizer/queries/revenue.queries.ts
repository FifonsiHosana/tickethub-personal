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
 * Daily revenue trend within an optional date range
 */
export async function getRevenueTrend(
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

  return db
    .select({
      date: sql<string>`DATE(${payments.paidAt})`,
      revenue: sql<string>`SUM(${payments.subtotal})`,
      transactions: sql<number>`COUNT(${payments.id})`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...filters))
    .groupBy(sql`DATE(${payments.paidAt})`)
    .orderBy(sql`DATE(${payments.paidAt})`);
}

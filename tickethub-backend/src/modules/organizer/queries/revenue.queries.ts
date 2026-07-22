import { db } from '@/db/client.js';
import { and, eq, sql, between, inArray } from 'drizzle-orm';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  eventTickets,
  tickets,
  events,
} from '@/db/schema/index.js';

export interface DateRange {
  from?: string | undefined;
  to?: string | undefined;
}

/**
 * Total completed revenue for an organizer
 */
export async function getTotalRevenue(organizerId: number) {
  const [result] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(
      and(
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
      ),
    );

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

  if (range?.from && range?.to) {
    filters.push(between(payments.paidAt, range.from, range.to));
  }

  return db
    .select({
      date: sql<string>`DATE(${payments.paidAt})`,
      revenue: sql<string>`SUM(${payments.amount})`,
      transactions: sql<number>`COUNT(${payments.id})`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...filters))
    .groupBy(sql`DATE(${payments.paidAt})`)
    .orderBy(sql`DATE(${payments.paidAt})`);
}

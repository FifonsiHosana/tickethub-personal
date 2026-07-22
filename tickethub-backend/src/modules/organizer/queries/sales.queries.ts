import { db } from '@/db/client.js';
import { and, eq, sql, desc, inArray } from 'drizzle-orm';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  eventTickets,
  tickets,
  events,
} from '@/db/schema/index.js';

export interface ConversionRateResult {
  completedOrders: number;
  totalOrders: number;
  conversionRate: number;
}

/**
 * Order conversion rate for an organizer
 */
export async function getConversionRate(
  organizerId: number,
): Promise<ConversionRateResult> {
  const [result] = await db
    .select({
      completedOrders:
        sql<number>`SUM(CASE WHEN ${ticketOrders.status} = 'Completed' THEN 1 ELSE 0 END)`,
      totalOrders: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
    })
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
    .where(eq(events.organizerId, organizerId));

  const completed = Number(result?.completedOrders ?? 0);
  const total = Number(result?.totalOrders ?? 0);

  return {
    completedOrders: completed,
    totalOrders: total,
    conversionRate: total > 0
      ? Number(((completed / total) * 100).toFixed(2))
      : 0,
  };
}

/**
 * Sales summary card data
 */
export async function getSalesSummary(organizerId: number) {
  const result = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      completedOrders: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
      ticketsSold: sql<number>`(SELECT COALESCE(COUNT(${ticketOrderItems.id}), 0) FROM ${ticketOrderItems} INNER JOIN ${eventTickets} ON ${ticketOrderItems.eventTicketId} = ${eventTickets.id} INNER JOIN ${tickets} ON ${eventTickets.ticketId} = ${tickets.id} WHERE ${tickets.eventId} IN (SELECT ${events.id} FROM ${events} WHERE ${events.organizerId} = ${organizerId}))`,
      successfulPayments:
        sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Completed' THEN 1 ELSE 0 END), 0)`,
      failedPayments:
        sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Failed' THEN 1 ELSE 0 END), 0)`,
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

  return {
    totalRevenue: Number(result[0]?.totalRevenue ?? 0),
    completedOrders: Number(result[0]?.completedOrders ?? 0),
    ticketsSold: Number(result[0]?.ticketsSold ?? 0),
    successfulPayments: Number(result[0]?.successfulPayments ?? 0),
    failedPayments: Number(result[0]?.failedPayments ?? 0),
  };
}

/**
 * Recent sales transactions
 */
export async function getRecentSales(organizerId: number, limit = 5) {
  return db
    .select({
      orderId: ticketOrders.id,
      customerId: ticketOrders.userId,
      status: ticketOrders.status,
      purchasedAt: ticketOrders.createdAt,
    })
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
    .where(eq(events.organizerId, organizerId))
    .groupBy(ticketOrders.id)
    .orderBy(desc(ticketOrders.createdAt))
    .limit(limit);
}

import { db } from '@/db/client.js';
import { and, eq, sql, desc, inArray } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

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
  range?: DateRange,
): Promise<ConversionRateResult> {
  const filters: any[] = [eq(events.organizerId, organizerId)];
  applyDateRange(filters, ticketOrders.createdAt, range);

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
    .where(and(...filters));

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
export async function getSalesSummary(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const orderScopes = [eq(events.organizerId, organizerId)];

  if (filters?.eventId) {
    orderScopes.push(eq(events.id, filters.eventId));
  }

  if (filters?.ticketId) {
    orderScopes.push(eq(tickets.id, filters.ticketId));
  }

  const orderScope = db
    .select({ id: ticketOrders.id })
    .from(ticketOrders)
    .innerJoin(
      ticketOrderItems,
      eq(ticketOrderItems.orderId, ticketOrders.id),
    )
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...orderScopes));

  const paymentFilters: any[] = [
    eq(payments.status, 'Completed'),
    inArray(ticketOrders.id, orderScope),
  ];
  applyDateRange(paymentFilters, payments.paidAt, range);

  const [result] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${payments.subtotal}), 0)`,
      completedOrders: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
      successfulPayments:
        sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Completed' THEN 1 ELSE 0 END), 0)`,
      failedPayments:
        sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Failed' THEN 1 ELSE 0 END), 0)`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...paymentFilters));

  const ticketFilters: any[] = [...orderScopes];
  applyDateRange(ticketFilters, ticketOrders.createdAt, range);

  const [ticketsSoldResult] = await db
    .select({
      count: sql<number>`COUNT(${ticketOrderItems.id})`,
    })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(payments, eq(ticketOrderItems.orderId, payments.orderId))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...ticketFilters));

  return {
    totalRevenue: Number(result?.totalRevenue ?? 0),
    completedOrders: Number(result?.completedOrders ?? 0),
    ticketsSold: Number(ticketsSoldResult?.count ?? 0),
    successfulPayments: Number(result?.successfulPayments ?? 0),
    failedPayments: Number(result?.failedPayments ?? 0),
  };
}

/**
 * Recent sales transactions
 */
export async function getRecentSales(
  organizerId: number,
  limit = 5,
  range?: DateRange,
) {
  const filters: any[] = [eq(events.organizerId, organizerId)];
  applyDateRange(filters, ticketOrders.createdAt, range);

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
    .where(and(...filters))
    .groupBy(ticketOrders.id)
    .orderBy(desc(ticketOrders.createdAt))
    .limit(limit);
}

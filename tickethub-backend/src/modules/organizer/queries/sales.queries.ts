import { db } from '@/db/client.js';
import { and, eq, sql, desc, inArray } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';
import { organizerOrderScopeSql } from './order-scope.js';
import { getTotalRevenue } from './revenue.queries.js';

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

export async function getConversionRate(
  organizerId: number,
  range?: DateRange,
  options?: { eventId?: number | undefined },
): Promise<ConversionRateResult> {
  const scope = options?.eventId
    ? organizerOrderScopeSql({ organizerId, eventId: options.eventId })
    : organizerOrderScopeSql({ organizerId });
  const filters: any[] = [scope];
  applyDateRange(filters, ticketOrders.createdAt, range);

  const [result] = await db
    .select({
      completedOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${payments.status} = 'Completed' THEN ${ticketOrders.id} END)`,
      totalOrders: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
    })
    .from(ticketOrders)
    .leftJoin(payments, eq(payments.orderId, ticketOrders.id))
    .where(and(...filters));

  const completed = Number(result?.completedOrders ?? 0);
  const total = Number(result?.totalOrders ?? 0);

  return {
    completedOrders: completed,
    totalOrders: total,
    conversionRate: total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0,
  };
}

export async function getSalesSummary(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  const orderScopes = [eq(events.organizerId, organizerId)];

  if (filters?.eventId) orderScopes.push(eq(events.id, filters.eventId));
  if (filters?.ticketId) orderScopes.push(eq(tickets.id, filters.ticketId));

  const paidOrderScope = db
    .select({ id: ticketOrders.id })
    .from(ticketOrders)
    .innerJoin(ticketOrderItems, and(eq(ticketOrderItems.orderId, ticketOrders.id), eq(ticketOrderItems.status, 'Valid')))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...orderScopes));

  const completedPaymentFilters: any[] = [
    eq(payments.status, 'Completed'),
    inArray(ticketOrders.id, paidOrderScope),
  ];
  applyDateRange(completedPaymentFilters, payments.paidAt, range);

  const [completed] = await db
    .select({
      completedOrders: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
      successfulPayments: sql<number>`COUNT(${payments.id})`,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...completedPaymentFilters));

  const failedPaymentFilters: any[] = [
    eq(payments.status, 'Failed'),
    inArray(ticketOrders.id, paidOrderScope),
  ];
  applyDateRange(failedPaymentFilters, payments.paidAt, range);

  const [failed] = await db
    .select({ failedPayments: sql<number>`COUNT(${payments.id})` })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .where(and(...failedPaymentFilters));

  const ticketFilters: any[] = [
    ...orderScopes,
    eq(payments.status, 'Completed'),
    eq(ticketOrderItems.status, 'Valid'),
  ];
  applyDateRange(ticketFilters, payments.paidAt, range);

  const [ticketsSoldResult] = await db
    .select({ count: sql<number>`COUNT(${ticketOrderItems.id})` })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(payments, eq(ticketOrderItems.orderId, payments.orderId))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...ticketFilters));

  const totalRevenue = await getTotalRevenue(organizerId, range, filters);

  return {
    totalRevenue,
    completedOrders: Number(completed?.completedOrders ?? 0),
    ticketsSold: Number(ticketsSoldResult?.count ?? 0),
    successfulPayments: Number(completed?.successfulPayments ?? 0),
    failedPayments: Number(failed?.failedPayments ?? 0),
  };
}

export async function getRecentSales(
  organizerId: number,
  limit = 5,
  range?: DateRange,
  options?: { eventId?: number | undefined },
) {
  const filters: any[] = [
    eq(events.organizerId, organizerId),
    eq(payments.status, 'Completed'),
  ];
  if (options?.eventId) filters.push(eq(events.id, options.eventId));
  applyDateRange(filters, payments.paidAt, range);

  return db
    .select({
      orderId: ticketOrders.id,
      customerId: ticketOrders.userId,
      status: ticketOrders.status,
      purchasedAt: payments.paidAt,
    })
    .from(ticketOrders)
    .innerJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(ticketOrderItems, and(eq(ticketOrderItems.orderId, ticketOrders.id), eq(ticketOrderItems.status, 'Valid')))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...filters))
    .groupBy(ticketOrders.id, payments.id)
    .orderBy(desc(payments.paidAt))
    .limit(limit);
}

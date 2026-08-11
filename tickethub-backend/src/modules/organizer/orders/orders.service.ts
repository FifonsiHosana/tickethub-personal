import { db } from '@/db/client.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  tickets,
  ticketTypes,
  eventTickets,
  ticketConfigurations,
  events,
} from '@/db/schema/index.js';

import { and, desc, eq, inArray, like, sql } from 'drizzle-orm';
import { applyDateRange } from '@/utils/dateRange.js';

export interface GetOrganizerOrdersOptions {
  organizerId: number;

  page?: number;

  pageSize?: number;

  eventId?: number;

  status?: 'Pending' | 'Completed';

  from?: string;

  to?: string;

  search?: string;
}

export interface OrganizerOrderEventBreakdown {
  eventId: number;

  eventTitle: string;

  ticketType: string;

  totalTickets: number;

  checkedInCount: number;
}

function buildFilters({
  organizerId,
  eventId,
  status,
  from,
  to,
  search,
}: GetOrganizerOrdersOptions) {
  const filters = [
    sql`EXISTS (
      SELECT 1 FROM ${ticketOrderItems} toi
      INNER JOIN ${eventTickets} et ON et.id = toi.eventTicketId
      INNER JOIN ${tickets} t ON t.id = et.ticketId
      INNER JOIN ${events} e ON e.id = t.eventId
      WHERE toi.orderId = ${ticketOrders.id}
        AND e.organizerId = ${organizerId}
        ${eventId ? sql`AND e.id = ${eventId}` : sql``}
    )`,
  ];

  if (status) {
    filters.push(eq(ticketOrders.status, status));
  }

  applyDateRange(filters, ticketOrders.createdAt, { from, to });

  if (search) {
    filters.push(like(ticketOrderUserDetails.email, `%${search}%`));
  }

  return filters;
}

/**
 * All ticket orders for an organizer's events, regardless of payment status.
 *
 * Driven by TicketOrders (not Payments) so Pending orders — those with no
 * payment record yet — are included. One row per order: payment fields come
 * from a correlated subquery that picks a single payment (Completed
 * preferred), so the left join stays 1:1 and never duplicates. Amount falls
 * back to the sum of ticket configuration prices when no payment exists.
 */
export async function getOrganizerOrders(options: GetOrganizerOrdersOptions) {
  const { page = 1, pageSize = 10 } = options;

  const offset = (page - 1) * pageSize;

  const filters = buildFilters(options);

  const orderHeaders = await db
    .select({
      orderId: ticketOrders.id,

      status: ticketOrders.status,

      purchasedAt: ticketOrders.createdAt,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      phoneNumber: ticketOrderUserDetails.phoneNumber,

      quantity: ticketOrders.quantity,

      amount:
        sql<string>`COALESCE(
        ${payments.amount},
        (SELECT SUM(tc.price)
           FROM ${ticketOrderItems} toi2
           INNER JOIN ${eventTickets} et2 ON et2.id = toi2.eventTicketId
           INNER JOIN ${ticketConfigurations} tc ON tc.id = et2.ticketConfigurationId
           WHERE toi2.orderId = ${ticketOrders.id})
      )`,

      currency: payments.currency,

      provider: payments.provider,

      paymentStatus: payments.status,

      reference: payments.reference,

      paidAt: payments.paidAt,
    })
    .from(ticketOrders)
    .leftJoin(
      payments,
      eq(
        payments.id,
        sql`(SELECT p.id FROM ${payments} p
             WHERE p.orderId = ${ticketOrders.id}
             ORDER BY (p.status = 'Completed') DESC, p.id DESC
             LIMIT 1)`,
      ),
    )
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .where(and(...filters))
    .orderBy(desc(ticketOrders.createdAt))
    .limit(pageSize)
    .offset(offset);

  const orderIds = orderHeaders.map((order) => order.orderId);

  const eventBreakdown = orderIds.length
    ? await db
        .select({
          orderId: ticketOrders.id,

          eventId: events.id,

          eventTitle: events.title,

          ticketType:
            sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`,

          totalTickets: sql<number>`COUNT(${ticketOrderItems.id})`,

          checkedInCount:
            sql<number>`COUNT(CASE WHEN ${ticketOrderItems.checkedIn} = 1 THEN 1 END)`,
        })
        .from(ticketOrderItems)
        .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
        .innerJoin(
          eventTickets,
          eq(ticketOrderItems.eventTicketId, eventTickets.id),
        )
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
        .innerJoin(events, eq(tickets.eventId, events.id))
        .where(inArray(ticketOrders.id, orderIds))
        .groupBy(ticketOrders.id, events.id)
    : [];

  const eventsByOrder = new Map<number, OrganizerOrderEventBreakdown[]>();

  for (const row of eventBreakdown) {
    const existing = eventsByOrder.get(row.orderId);

    if (existing) {
      existing.push(row);
    } else {
      eventsByOrder.set(row.orderId, [row]);
    }
  }

  const data = orderHeaders.map((order) => {
    const orderEvents = eventsByOrder.get(order.orderId) ?? [];

    return {
      ...order,

      events: orderEvents,

      totalTickets: orderEvents.reduce((sum, e) => sum + e.totalTickets, 0),

      checkedInCount: orderEvents.reduce(
        (sum, e) => sum + e.checkedInCount,
        0,
      ),
    };
  });

  const total = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${ticketOrders.id})` })
    .from(ticketOrders)
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .where(and(...filters));

  return {
    data,

    pagination: {
      page,

      pageSize,

      total: Number(total[0]?.total ?? 0),

      totalPages: Math.ceil(Number(total[0]?.total ?? 0) / pageSize),
    },
  };
}
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

import { and, desc, eq, like, sql } from 'drizzle-orm';

export interface GetOrganizerOrdersOptions {
  organizerId: number;

  page?: number;

  pageSize?: number;

  eventId?: number;

  status?: 'Pending' | 'Completed';

  search?: string;
}

function buildFilters({
  organizerId,
  eventId,
  status,
  search,
}: GetOrganizerOrdersOptions) {
  const filters = [eq(events.organizerId, organizerId)];

  if (eventId) {
    filters.push(eq(events.id, eventId));
  }

  if (status) {
    filters.push(eq(ticketOrders.status, status));
  }

  if (search) {
    filters.push(like(ticketOrderUserDetails.email, `%${search}%`));
  }

  return filters;
}

/**
 * All ticket orders for an organizer's events, regardless of payment status.
 *
 * Driven by TicketOrders (not Payments) so Pending orders — those with no
 * payment record yet — are included. Amount falls back to the sum of ticket
 * configuration prices when no Completed payment exists.
 */
export async function getOrganizerOrders(options: GetOrganizerOrdersOptions) {
  const { page = 1, pageSize = 10 } = options;

  const offset = (page - 1) * pageSize;

  const filters = buildFilters(options);

  const orders = await db
    .select({
      orderId: ticketOrders.id,

      status: ticketOrders.status,

      purchasedAt: ticketOrders.createdAt,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      phoneNumber: ticketOrderUserDetails.phoneNumber,

      eventId: events.id,

      eventTitle: events.title,

      ticketType: sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`,

      quantity: ticketOrders.quantity,

      amount:
        sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Completed' THEN ${payments.amount} ELSE 0 END), SUM(${ticketConfigurations.price}))`,

      currency: sql<string | null>`MAX(${payments.currency})`,

      provider: sql<string | null>`MAX(${payments.provider})`,

      paymentStatus:
        sql<string | null>`MAX(CASE WHEN ${payments.status} = 'Completed' THEN 'Completed' ELSE ${payments.status} END)`,

      reference: sql<string | null>`MAX(${payments.reference})`,

      paidAt: sql<string | null>`MAX(${payments.paidAt})`,

      totalTickets: sql<number>`COUNT(${ticketOrderItems.id})`,

      checkedInCount:
        sql<number>`COUNT(CASE WHEN ${ticketOrderItems.checkedIn} = 1 THEN 1 END)`,
    })

    .from(ticketOrders)

    .leftJoin(payments, eq(payments.orderId, ticketOrders.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))

    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(and(...filters))

    .groupBy(ticketOrders.id, ticketOrderUserDetails.id, events.id)

    .orderBy(desc(ticketOrders.createdAt))

    .limit(pageSize)

    .offset(offset);

  const total = await db
    .select({
      total: sql<number>`COUNT(DISTINCT ${ticketOrders.id})`,
    })

    .from(ticketOrders)

    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )

    .where(and(...filters));

  return {
    data: orders,

    pagination: {
      page,

      pageSize,

      total: Number(total[0]?.total ?? 0),

      totalPages: Math.ceil(Number(total[0]?.total ?? 0) / pageSize),
    },
  };
}

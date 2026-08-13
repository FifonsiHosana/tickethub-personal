import { db } from '@/db/client.js';

import {
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  tickets,
  ticketTypes,
  eventTickets,
  events,
} from '@/db/schema/index.js';

import { and, desc, eq, inArray, like, sql } from 'drizzle-orm';
import { applyDateRange, type DateRange } from '@/utils/dateRange.js';

import {
  getSalesSummary as getSharedSalesSummary,
  getRevenueTrend,
  getTicketSalesBreakdown as getSharedTicketSalesBreakdown,
} from '../queries/index.js';

export interface GetOrganizerSalesOptions {
  organizerId: number;

  page?: number;

  pageSize?: number;

  eventId?: number;

  status?: 'Completed' | 'Failed';

  from?: string;

  to?: string;

  search?: string;
}

export interface OrganizerSaleEventBreakdown {
  eventId: number;

  eventTitle: string;

  ticketType: string;

  ticketSummary: string;

  totalTickets: number;

  checkedInCount: number;
}

export interface OrganizerSale {
  paymentId: number;

  orderId: number;

  customerFirstName: string;

  customerLastName: string;

  customerEmail: string;

  phoneNumber: string;

  quantity: number;

  amount: string;

  currency: string;

  provider: 'hubtel' | 'paystack';

  paymentStatus: 'Completed' | 'Failed';

  reference: string;

  purchasedAt: string | null;

  events: OrganizerSaleEventBreakdown[];
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function buildHeaderFilters({
  status,
  from,
  to,
  search,
}: Pick<GetOrganizerSalesOptions, 'status' | 'from' | 'to' | 'search'>) {
  const filters: any[] = [];

  if (status) {
    filters.push(eq(payments.status, status));
  }

  applyDateRange(filters, payments.paidAt, { from, to });

  if (search) {
    filters.push(like(ticketOrderUserDetails.email, `%${search}%`));
  }

  return filters;
}

function buildOrderScopeSubquery({
  organizerId,
  eventId,
}: Pick<GetOrganizerSalesOptions, 'organizerId' | 'eventId'>) {
  const scopes = [eq(events.organizerId, organizerId)];

  if (eventId) {
    scopes.push(eq(events.id, eventId));
  }

  return db
    .select({ id: ticketOrders.id })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(...scopes));
}

/* -----------------------------------------------------------------------------
 * Services
 * -------------------------------------------------------------------------- */

export async function getOrganizerSales(
  options: GetOrganizerSalesOptions,
): Promise<{
  data: OrganizerSale[];

  pagination: {
    page: number;

    pageSize: number;

    total: number;

    totalPages: number;
  };
}> {
  const { page = 1, pageSize = 10 } = options;

  const offset = (page - 1) * pageSize;

  const headerFilters = buildHeaderFilters(options);

  const orderScope = buildOrderScopeSubquery(options);

  const sales = await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      phoneNumber: ticketOrderUserDetails.phoneNumber,

      quantity: ticketOrders.quantity,

      amount: payments.amount,

      currency: payments.currency,

      provider: payments.provider,

      paymentStatus: payments.status,

      reference: payments.reference,

      purchasedAt: payments.paidAt,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .where(and(...headerFilters, inArray(ticketOrders.id, orderScope)))
    .orderBy(desc(payments.paidAt))
    .limit(pageSize)
    .offset(offset);

  const orderIds = sales.map((sale) => sale.orderId);

  const eventBreakdown = orderIds.length
    ? await db
        .select({
          orderId: ticketOrders.id,

          eventId: events.id,

          eventTitle: events.title,

          ticketType:
            sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`,

          ticketSummary:
            sql<string>`GROUP_CONCAT(DISTINCT ${tickets.name} SEPARATOR ', ')`,

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

  const eventsByOrder = new Map<number, OrganizerSaleEventBreakdown[]>();

  for (const row of eventBreakdown) {
    const existing = eventsByOrder.get(row.orderId);

    if (existing) {
      existing.push(row);
    } else {
      eventsByOrder.set(row.orderId, [row]);
    }
  }

  const data = sales.map((sale) => ({
    ...sale,

    events: eventsByOrder.get(sale.orderId) ?? [],
  }));

  const total = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${ticketOrders.id})` })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .where(and(...headerFilters, inArray(ticketOrders.id, orderScope)));

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

export async function getSaleById(organizerId: number, orderId: number) {
  const sale = await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      paymentReference: payments.reference,

      paymentProvider: payments.provider,

      paymentStatus: payments.status,

      amount: payments.amount,

      currency: payments.currency,

      paidAt: payments.paidAt,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      customerPhone: ticketOrderUserDetails.phoneNumber,

      eventId: events.id,

      eventTitle: events.title,

      eventDate: events.dateAndTime,

      ticketName: tickets.name,

      ticketIdentifier: ticketOrderItems.ticketIdentifier,

      qrCodeUrl: ticketOrderItems.qrCodeUrl,

      checkedIn: ticketOrderItems.checkedIn,

      checkedInAt: ticketOrderItems.checkedInAt,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

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

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(ticketOrders.id, orderId),

        eq(events.organizerId, organizerId),
      ),
    );

  if (!sale.length) {
    throw new Error('Sale not found.');
  }

  return sale;
}

export async function getEventSales(organizerId: number, eventId: number) {
  return await db
    .select({
      paymentId: payments.id,

      orderId: ticketOrders.id,

      customerFirstName: ticketOrderUserDetails.firstName,

      customerLastName: ticketOrderUserDetails.lastName,

      customerEmail: ticketOrderUserDetails.email,

      ticketName: tickets.name,

      quantity: ticketOrders.quantity,

      amount: payments.amount,

      paymentStatus: payments.status,

      provider: payments.provider,

      purchasedAt: payments.paidAt,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

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

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(events.id, eventId),

        eq(events.organizerId, organizerId),
      ),
    )

    .orderBy(desc(payments.paidAt));
}

/**
 * Get organizer sales summary
 *
 * Used for dashboard cards:
 * - total revenue
 * - completed orders
 * - failed payments
 * - tickets sold
 */
export async function getSalesSummary(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  return getSharedSalesSummary(organizerId, range, filters);
}

/**
 * Revenue breakdown over time — delegates to shared query
 */
export async function getRevenueBreakdown(
  organizerId: number,
  from: string,
  to: string,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  return getRevenueTrend(organizerId, { from, to }, filters);
}

/**
 * Sales by ticket type — delegates to shared query
 */
export async function getTicketSalesBreakdown(
  organizerId: number,
  range?: DateRange,
  filters?: { eventId?: number | undefined; ticketId?: number | undefined },
) {
  return getSharedTicketSalesBreakdown(organizerId, range, filters);
}

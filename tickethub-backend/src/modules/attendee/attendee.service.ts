import { db, type Executor } from '@/db/client.js';
import { and, eq, desc, count, sql, inArray, isNull } from 'drizzle-orm';
import {
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  tickets,
  ticketTypes,
  events,
  payments,
} from '@/db/schema/index.js';

export interface OrderHistoryParams {
  userId: number;
  page?: number;
  pageSize?: number;
}

export interface OrderHistoryEventBreakdown {
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  ticketSummary: string;
  ticketType: string;
  totalTickets: number;
  checkedInCount: number;
}

/**
 * A customer's own order history, driven by TicketOrders with one row per
 * order. Payment fields come from a correlated subquery that picks a single
 * payment (Completed preferred), so the left join stays 1:1 regardless of
 * how many payment attempts an order has. An order can span multiple events,
 * so the per-event ticket breakdown is fetched separately and attached as an
 * `events` array - pagination stays accurate per order.
 */
export async function getOrderHistory(params: OrderHistoryParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const orderHeaders = await db
    .select({
      orderId: ticketOrders.id,
      status: ticketOrders.status,
      quantity: ticketOrders.quantity,
      purchasedAt: ticketOrders.createdAt,
      customerFirstName: ticketOrderUserDetails.firstName,
      customerLastName: ticketOrderUserDetails.lastName,
      customerEmail: ticketOrderUserDetails.email,
      amount: payments.amount,
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
    .where(eq(ticketOrders.userId, userId))
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
          eventDate: events.dateAndTime,
          ticketSummary:
            sql<string>`GROUP_CONCAT(DISTINCT ${tickets.name} SEPARATOR ', ')`,
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

  const eventsByOrder = new Map<number, OrderHistoryEventBreakdown[]>();

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

  const [totalResult] = await db
    .select({ total: count() })
    .from(ticketOrders)
    .where(eq(ticketOrders.userId, userId));

  const total = Number(totalResult?.total ?? 0);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function linkOrdersByEmail(
  tx: Executor,
  userId: number,
  email: string,
) {
  const orders = await tx
    .select({ orderId: ticketOrderUserDetails.orderId })
    .from(ticketOrderUserDetails)
    .where(eq(ticketOrderUserDetails.email, email));

  const orderIds = orders
    .map((order) => order.orderId)
    .filter((id): id is number => id !== null);

  if (orderIds.length === 0) {
    return;
  }

  await tx
    .update(ticketOrders)
    .set({ userId })
    .where(
      and(inArray(ticketOrders.id, orderIds), isNull(ticketOrders.userId)),
    );
}

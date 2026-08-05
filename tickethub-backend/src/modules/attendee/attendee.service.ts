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

export async function getOrderHistory(params: OrderHistoryParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      orderId: ticketOrders.id,
      status: ticketOrders.status,
      quantity: ticketOrders.quantity,
      purchasedAt: ticketOrders.createdAt,
      customerFirstName: ticketOrderUserDetails.firstName,
      customerLastName: ticketOrderUserDetails.lastName,
      customerEmail: ticketOrderUserDetails.email,
      eventId: events.id,
      eventTitle: events.title,
      eventDate: events.dateAndTime,
      ticketSummary: sql<string>`GROUP_CONCAT(DISTINCT ${tickets.name} SEPARATOR ', ')`,
      ticketType: sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`,
      totalTickets: sql<number>`COUNT(${ticketOrderItems.id})`,
      checkedInCount: sql<number>`COUNT(CASE WHEN ${ticketOrderItems.checkedIn} = 1 THEN 1 END)`,
      amount: payments.amount,
      currency: payments.currency,
      provider: payments.provider,
      paymentStatus: payments.status,
      reference: payments.reference,
      paidAt: payments.paidAt,
    })
    .from(ticketOrders)
    .leftJoin(payments, eq(payments.orderId, ticketOrders.id))
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .innerJoin(
      ticketOrderItems,
      eq(ticketOrders.id, ticketOrderItems.orderId),
    )
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(eq(ticketOrders.userId, userId))
    .groupBy(ticketOrders.id, ticketOrderUserDetails.id, events.id, payments.id)
    .orderBy(desc(ticketOrders.createdAt))
    .limit(pageSize)
    .offset(offset);

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

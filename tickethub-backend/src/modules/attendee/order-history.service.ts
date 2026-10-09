import { db } from '@/db/client.js';
import { and, eq, desc, count, sql, inArray, type SQL } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
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

export type OrderHistoryPeriod = 'upcoming' | 'past';
export interface OrderHistoryParams { userId: number; page?: number; pageSize?: number; period?: OrderHistoryPeriod }

const latestPaymentId = sql`(SELECT p.id FROM ${payments} p WHERE p.orderId = ${ticketOrders.id} ORDER BY (p.status = 'Completed') DESC, p.id DESC LIMIT 1)`;
const upcomingOrderExists = sql`EXISTS (SELECT 1 FROM TicketOrderItems toi INNER JOIN EventTickets et ON toi.eventTicketId = et.id INNER JOIN Tickets t ON et.ticketId = t.id INNER JOIN Events e ON t.eventId = e.id WHERE toi.orderId = ${ticketOrders.id} AND e.dateAndTime >= CURRENT_DATE())`;

function orderFilters(userId: number, period?: OrderHistoryPeriod): SQL[] {
  const filters: SQL[] = [eq(ticketOrders.userId, userId), eq(ticketOrders.status, 'Completed')];
  if (period === 'upcoming') filters.push(upcomingOrderExists);
  if (period === 'past') filters.push(sql`NOT ${upcomingOrderExists}`);
  return filters;
}

function orderSelect() {
  return {
    orderId: ticketOrders.id,
    status: ticketOrders.status,
    quantity: ticketOrders.quantity,
    purchasedAt: ticketOrders.createdAt,
    customerFirstName: ticketOrderUserDetails.firstName,
    customerLastName: ticketOrderUserDetails.lastName,
    customerEmail: ticketOrderUserDetails.email,
    customerPhoneNumber: ticketOrderUserDetails.phoneNumber,
    amount: payments.amount,
    currency: payments.currency,
    provider: payments.provider,
    paymentStatus: payments.status,
    reference: payments.reference,
    paidAt: payments.paidAt,
  };
}

export async function getOrderHistory(params: OrderHistoryParams) {
  const { userId, page = 1, pageSize = 10, period } = params;
  const filters = orderFilters(userId, period);
  const orderHeaders = await db.select(orderSelect()).from(ticketOrders)
    .leftJoin(payments, eq(payments.id, latestPaymentId))
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .where(and(...filters))
    .orderBy(desc(sql`COALESCE(${payments.paidAt}, ${ticketOrders.createdAt})`))
    .limit(pageSize).offset((page - 1) * pageSize);

  const data = await attachEvents(orderHeaders);
  const [totalResult] = await db.select({ total: count() }).from(ticketOrders).where(and(...filters));
  const total = Number(totalResult?.total ?? 0);
  return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function getOrderHistoryDetail(userId: number, orderId: number) {
  const [order] = await db.select(orderSelect()).from(ticketOrders)
    .leftJoin(payments, eq(payments.id, latestPaymentId))
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .where(and(eq(ticketOrders.id, orderId), eq(ticketOrders.userId, userId), eq(ticketOrders.status, 'Completed')));
  if (!order) throw new AppError(404, 'Order not found.');
  const [detail] = await attachEvents([order]);
  return detail;
}

async function attachEvents<T extends { orderId: number }>(orders: T[]) {
  const eventsByOrder = await getEventsByOrder(orders.map((order) => order.orderId));
  return orders.map((order) => {
    const orderEvents = eventsByOrder.get(order.orderId) ?? [];
    return {
      ...order,
      events: orderEvents,
      totalTickets: orderEvents.reduce((sum, event) => sum + event.totalTickets, 0),
      checkedInCount: orderEvents.reduce((sum, event) => sum + event.checkedInCount, 0),
    };
  });
}

async function getEventsByOrder(orderIds: number[]) {
  const eventsByOrder = new Map<number, any[]>();
  if (orderIds.length === 0) return eventsByOrder;
  const rows = await db.select({
    orderId: ticketOrderItems.orderId,
    eventId: events.id,
    eventTitle: events.title,
    eventDate: events.dateAndTime,
    ticketId: ticketOrderItems.id,
    ticketIdentifier: ticketOrderItems.ticketIdentifier,
    qrCodeUrl: ticketOrderItems.qrCodeUrl,
    checkedIn: ticketOrderItems.checkedIn,
    checkedInAt: ticketOrderItems.checkedInAt,
    ticketName: tickets.name,
    ticketType: ticketTypes.name,
    holderFirstName: ticketOrderUserDetails.firstName,
    holderLastName: ticketOrderUserDetails.lastName,
  }).from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(inArray(ticketOrderItems.orderId, orderIds))
    .orderBy(events.dateAndTime, ticketOrderItems.id);
  for (const row of rows) addTicketRow(eventsByOrder, row);
  return eventsByOrder;
}

function addTicketRow(eventsByOrder: Map<number, any[]>, row: any) {
  const orderEvents = eventsByOrder.get(Number(row.orderId)) ?? [];
  let eventGroup = orderEvents.find((event) => event.eventId === row.eventId);
  if (!eventGroup) {
    eventGroup = { eventId: row.eventId, eventTitle: row.eventTitle, eventDate: row.eventDate, ticketSummary: '', ticketType: '', totalTickets: 0, checkedInCount: 0, tickets: [] };
    orderEvents.push(eventGroup);
    eventsByOrder.set(Number(row.orderId), orderEvents);
  }
  const label = row.ticketType ?? row.ticketName ?? 'Ticket type';
  eventGroup.tickets.push({ id: row.ticketId, ticketIdentifier: row.ticketIdentifier, qrCodeUrl: row.qrCodeUrl, ticketType: label, holderName: [row.holderFirstName, row.holderLastName].filter(Boolean).join(' '), checkedIn: row.checkedIn, checkedInAt: row.checkedInAt });
  eventGroup.totalTickets += 1;
  eventGroup.checkedInCount += row.checkedIn ? 1 : 0;
  eventGroup.ticketSummary = [...new Set(eventGroup.tickets.map((ticket: any) => ticket.ticketType).filter(Boolean))].join(', ');
  eventGroup.ticketType = eventGroup.ticketSummary;
}

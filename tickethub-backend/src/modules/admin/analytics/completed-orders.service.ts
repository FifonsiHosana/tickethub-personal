import {
  and,
  count,
  desc,
  eq,
  gte,
  like,
  lte,
  or,
  sql,
} from 'drizzle-orm';

import { db } from '@/db/client.js';
import {
  eventTickets,
  events,
  payments,
  ticketOrderItems,
  ticketOrders,
  ticketOrderUserDetails,
  tickets,
  users,
} from '@/db/schema/index.js';

type CompletedOrdersParams = {
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
};

export type CompletedOrderRow = {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  organizerName: string;
  organizerEmail: string;
  eventSummary: string;
  ticketCount: number;
  amount: number;
  feeAmount: number;
  provider: string;
  reference: string;
  currency: string;
  paidAt: string | null;
};

const latestCompletedPayment = sql`${payments.id} = (
  SELECT MAX(p2.id)
  FROM Payments p2
  WHERE p2.orderId = ${ticketOrders.id}
    AND p2.status = 'Completed'
)`;

function filters(params: CompletedOrdersParams) {
  const conditions = [eq(payments.status, 'Completed'), latestCompletedPayment];
  if (params.from) conditions.push(gte(payments.paidAt, params.from));
  if (params.to) conditions.push(lte(payments.paidAt, params.to));

  const search = params.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        like(ticketOrderUserDetails.email, pattern),
        like(ticketOrderUserDetails.firstName, pattern),
        like(ticketOrderUserDetails.lastName, pattern),
        like(ticketOrderUserDetails.phoneNumber, pattern),
        like(sql<string>`CONCAT(${ticketOrderUserDetails.firstName}, ' ', ${ticketOrderUserDetails.lastName})`, pattern),
        like(payments.reference, pattern),
        like(events.title, pattern),
        like(users.email, pattern),
        like(users.firstName, pattern),
        like(users.lastName, pattern),
        like(sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`, pattern),
        sql`${ticketOrders.id} LIKE ${pattern}`,
      )!,
    );
  }

  return conditions;
}

function baseQuery(params: CompletedOrdersParams) {
  return db
    .select({
      orderId: ticketOrders.id,
      buyerName: sql<string>`CONCAT(${ticketOrderUserDetails.firstName}, ' ', ${ticketOrderUserDetails.lastName})`,
      buyerEmail: ticketOrderUserDetails.email,
      buyerPhone: ticketOrderUserDetails.phoneNumber,
      organizerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      organizerEmail: users.email,
      eventSummary: sql<string>`GROUP_CONCAT(DISTINCT ${events.title} ORDER BY ${events.title} SEPARATOR ', ')`,
      ticketCount: sql<number>`COUNT(${ticketOrderItems.id})`,
      amount: payments.amount,
      feeAmount: payments.feeAmount,
      provider: payments.provider,
      reference: payments.reference,
      currency: payments.currency,
      paidAt: payments.paidAt,
    })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(and(...filters(params)))
    .groupBy(
      ticketOrders.id,
      ticketOrderUserDetails.firstName,
      ticketOrderUserDetails.lastName,
      ticketOrderUserDetails.email,
      ticketOrderUserDetails.phoneNumber,
      users.firstName,
      users.lastName,
      users.email,
      payments.amount,
      payments.feeAmount,
      payments.provider,
      payments.reference,
      payments.currency,
      payments.paidAt,
    )
    .orderBy(desc(payments.paidAt), desc(ticketOrders.id));
}

type CompletedOrderRecord = Awaited<ReturnType<ReturnType<typeof baseQuery>['execute']>>[number];

function toRows(rows: CompletedOrderRecord[]): CompletedOrderRow[] {
  return rows.map((row) => ({
    ...row,
    eventSummary: row.eventSummary ?? '',
    ticketCount: Number(row.ticketCount ?? 0),
    amount: Number(row.amount ?? 0),
    feeAmount: Number(row.feeAmount ?? 0),
  }));
}

export async function listCompletedOrders(params: CompletedOrdersParams) {
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 10)));
  const offset = (page - 1) * pageSize;

  const [totalResult] = await db
    .select({ count: count(sql`DISTINCT ${ticketOrders.id}`) })
    .from(payments)
    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(and(...filters(params)));

  const rows = await baseQuery(params).limit(pageSize).offset(offset);
  const total = Number(totalResult?.count ?? 0);
  return { data: toRows(rows), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function getCompletedOrdersForExport(params: CompletedOrdersParams) {
  return toRows(await baseQuery(params));
}

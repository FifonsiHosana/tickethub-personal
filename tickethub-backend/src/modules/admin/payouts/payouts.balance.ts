import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db/client.js';
import {
  eventTickets,
  events,
  payments,
  payouts,
  ticketOrderItems,
  tickets,
} from '@/db/schema/index.js';

export async function getOrganizerAvailablePayoutAmount(organizerId: number) {
  const revenueRows = await db
    .select({ id: payments.id, amount: payments.amount })
    .from(payments)
    .innerJoin(ticketOrderItems, eq(payments.orderId, ticketOrderItems.orderId))
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .where(and(eq(events.organizerId, organizerId), eq(payments.status, 'Completed')))
    .groupBy(payments.id);

  const revenueTotal = revenueRows.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const [paidOut] = await db
    .select({ total: sql<string>`COALESCE(SUM(${payouts.amount}), 0)` })
    .from(payouts)
    .where(
      and(
        eq(payouts.organizerId, organizerId),
        inArray(payouts.status, ['Pending', 'Completed']),
      ),
    );

  return Math.max(revenueTotal - Number(paidOut?.total ?? 0), 0);
}

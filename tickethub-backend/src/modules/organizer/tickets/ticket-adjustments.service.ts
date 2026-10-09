import { db } from '@/db/client.js';
import {
  events,
  eventTickets,
  payments,
  ticketConfigurations,
  ticketItemAdjustments,
  ticketOrderItems,
  ticketOrders,
  tickets,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { and, eq, sql } from 'drizzle-orm';
import { now } from '@/utils/timeDatehelpers.js';

export async function previewLegacyInvalidTickets(organizerId: number) {
  const [summary] = await db
    .select({
      affectedTickets: sql<number>`COUNT(${ticketOrderItems.id})`,
      affectedOrders: sql<number>`COUNT(DISTINCT ${ticketOrderItems.orderId})`,
    })
    .from(ticketOrderItems)
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(
      payments,
      and(
        eq(payments.orderId, ticketOrderItems.orderId),
        eq(payments.status, 'Completed'),
      ),
    )
    .where(
      and(
        eq(events.organizerId, organizerId),
        eq(ticketOrderItems.status, 'Valid'),
        sql`${payments.id} IS NULL`,
      ),
    );

  return {
    affectedTickets: Number(summary?.affectedTickets ?? 0),
    affectedOrders: Number(summary?.affectedOrders ?? 0),
  };
}

async function getTicketForOrganizer(identifier: string, organizerId: number) {
  const [ticket] = await db
    .select({
      itemId: ticketOrderItems.id,
      eventTicketId: ticketOrderItems.eventTicketId,
      orderId: ticketOrderItems.orderId,
      status: ticketOrderItems.status,
      checkedIn: ticketOrderItems.checkedIn,
      eventId: events.id,
      organizerId: events.organizerId,
      paymentId: payments.id,
    })
    .from(ticketOrderItems)
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(
      payments,
      and(
        eq(payments.orderId, ticketOrderItems.orderId),
        eq(payments.status, 'Completed'),
      ),
    )
    .where(
      and(
        eq(ticketOrderItems.ticketIdentifier, identifier),
        eq(events.organizerId, organizerId),
      ),
    )
    .limit(1);

  return ticket ?? null;
}

export async function invalidateTicketItem(params: {
  organizerId: number;
  actorId: number;
  ticketIdentifier: string;
  reason?: string | undefined;
}) {
  return db.transaction(async (tx) => {
    const ticket = await getTicketForOrganizer(
      params.ticketIdentifier,
      params.organizerId,
    );

    if (!ticket) throw new AppError(404, 'Ticket not found.');
    if (ticket.status === 'Invalidated') {
      return { message: 'Ticket is already invalidated.' };
    }

    const reason = params.reason?.trim() || 'Organizer invalidated ticket';

    await tx
      .update(ticketOrderItems)
      .set({
        status: 'Invalidated',
        invalidatedAt: now(),
        invalidatedBy: params.actorId,
        invalidationReason: reason,
      })
      .where(eq(ticketOrderItems.id, ticket.itemId));

    await tx.insert(ticketItemAdjustments).values({
      ticketOrderItemId: ticket.itemId,
      action: 'Invalidated',
      fromEventTicketId: ticket.eventTicketId,
      reason,
      actorId: params.actorId,
    });

    return { message: 'Ticket invalidated successfully.' };
  });
}

export async function swapTicketItem(params: {
  organizerId: number;
  actorId: number;
  ticketIdentifier: string;
  targetEventTicketId: number;
  reason?: string | undefined;
}) {
  return db.transaction(async (tx) => {
    const source = await getTicketForOrganizer(
      params.ticketIdentifier,
      params.organizerId,
    );

    if (!source) throw new AppError(404, 'Ticket not found.');
    if (!source.paymentId) throw new AppError(400, 'Only paid tickets can be swapped.');
    if (source.status !== 'Valid') throw new AppError(400, 'Only valid tickets can be swapped.');
    if (source.checkedIn) throw new AppError(400, 'Checked-in tickets cannot be swapped.');
    if (source.eventTicketId === params.targetEventTicketId) {
      throw new AppError(400, 'Ticket is already assigned to that ticket type.');
    }

    const [target] = await tx
      .select({
        eventTicketId: eventTickets.id,
        eventId: events.id,
        configurationId: ticketConfigurations.id,
        totalCount: ticketConfigurations.totalCount,
      })
      .from(eventTickets)
      .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
      .innerJoin(events, eq(tickets.eventId, events.id))
      .innerJoin(
        ticketConfigurations,
        eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
      )
      .where(
        and(
          eq(eventTickets.id, params.targetEventTicketId),
          eq(events.organizerId, params.organizerId),
        ),
      )
      .limit(1);

    if (!target) throw new AppError(404, 'Target ticket type not found.');
    if (target.eventId !== source.eventId) {
      throw new AppError(400, 'Tickets can only be swapped within the same event.');
    }

    const [sold] = await tx
      .select({ count: sql<number>`COUNT(${ticketOrderItems.id})` })
      .from(ticketOrderItems)
      .innerJoin(
        payments,
        and(
          eq(payments.orderId, ticketOrderItems.orderId),
          eq(payments.status, 'Completed'),
        ),
      )
      .where(
        and(
          eq(ticketOrderItems.eventTicketId, params.targetEventTicketId),
          eq(ticketOrderItems.status, 'Valid'),
        ),
      );

    if (Number(sold?.count ?? 0) >= Number(target.totalCount)) {
      throw new AppError(409, 'Target ticket type has no remaining capacity.');
    }

    const reason = params.reason?.trim() || 'Organizer swapped ticket type';

    await tx
      .update(ticketOrderItems)
      .set({ eventTicketId: params.targetEventTicketId })
      .where(eq(ticketOrderItems.id, source.itemId));

    await tx.insert(ticketItemAdjustments).values({
      ticketOrderItemId: source.itemId,
      action: 'Swapped',
      fromEventTicketId: source.eventTicketId,
      toEventTicketId: params.targetEventTicketId,
      reason,
      actorId: params.actorId,
    });

    return { message: 'Ticket swapped successfully.' };
  });
}
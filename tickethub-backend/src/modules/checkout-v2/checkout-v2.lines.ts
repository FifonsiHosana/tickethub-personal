import { inArray, eq } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import {
  eventTickets,
  ticketConfigurations,
  tickets,
  ticketTypes,
  events,
} from '@/db/schema/index.js';
import type { Executor } from '@/db/client.js';
import type { CheckoutV2Input } from './checkout-v2.schema.js';
import type { CheckoutLine } from './checkout-v2.types.js';

export async function buildCheckoutLines(
  payload: CheckoutV2Input,
  dbLike: Executor,
): Promise<CheckoutLine[]> {
  const ids = payload.items.map((item) => item.eventTicketId);
  const rows = await dbLike
    .select({
      eventTicketId: eventTickets.id,
      configId: ticketConfigurations.id,
      price: ticketConfigurations.price,
      remaining: ticketConfigurations.totalRemaining,
      salesStart: ticketConfigurations.salesStartDate,
      salesEnd: ticketConfigurations.salesEndDate,
      eventName: events.title,
      ticketName: ticketTypes.name,
    })
    .from(eventTickets)
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(inArray(eventTickets.id, ids));

  if (rows.length !== new Set(ids).size) {
    throw new AppError(400, 'One or more tickets are unavailable.');
  }

  return payload.items.map((item) => {
    const row = rows.find((ticket) => ticket.eventTicketId === item.eventTicketId);
    if (!row) throw new AppError(404, 'Ticket not found.');

    const now = new Date();
    if (now < new Date(row.salesStart)) {
      throw new AppError(400, `${row.ticketName} sales have not started.`);
    }
    if (now > new Date(row.salesEnd)) {
      throw new AppError(400, `${row.ticketName} sales have ended.`);
    }
    if (Number(row.remaining) < item.quantity) {
      throw new AppError(400, `Not enough ${row.ticketName} tickets available.`);
    }

    return {
      eventTicketId: item.eventTicketId,
      quantity: item.quantity,
      unitPrice: Number(row.price),
      eventName: row.eventName,
      ticketName: row.ticketName,
      configId: row.configId,
    };
  });
}

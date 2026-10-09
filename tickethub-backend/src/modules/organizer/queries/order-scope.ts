import { sql } from 'drizzle-orm';
import {
  events,
  eventTickets,
  ticketOrderIntents,
  ticketOrderItems,
  ticketOrders,
  tickets,
} from '@/db/schema/index.js';

export function organizerOrderScopeSql(params: {
  organizerId: number;
  eventId?: number;
}) {
  const eventFilter = params.eventId
    ? sql`AND scoped_events.id = ${params.eventId}`
    : sql``;

  return sql`(
    EXISTS (
      SELECT 1
      FROM ${ticketOrderItems} scoped_items
      INNER JOIN ${eventTickets} scoped_event_tickets
        ON scoped_event_tickets.id = scoped_items.eventTicketId
      INNER JOIN ${tickets} scoped_tickets
        ON scoped_tickets.id = scoped_event_tickets.ticketId
      INNER JOIN ${events} scoped_events
        ON scoped_events.id = scoped_tickets.eventId
      WHERE scoped_items.orderId = ${ticketOrders.id}
        AND scoped_events.organizerId = ${params.organizerId}
        ${eventFilter}
    )
    OR EXISTS (
      SELECT 1
      FROM ${ticketOrderIntents} scoped_intents
      INNER JOIN ${eventTickets} scoped_event_tickets
        ON scoped_event_tickets.id = scoped_intents.eventTicketId
      INNER JOIN ${tickets} scoped_tickets
        ON scoped_tickets.id = scoped_event_tickets.ticketId
      INNER JOIN ${events} scoped_events
        ON scoped_events.id = scoped_tickets.eventId
      WHERE scoped_intents.orderId = ${ticketOrders.id}
        AND scoped_events.organizerId = ${params.organizerId}
        ${eventFilter}
    )
  )`;
}

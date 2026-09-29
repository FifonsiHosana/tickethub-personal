/* eslint-disable no-console */
import 'dotenv/config';
import { db } from '@/db/client.js';
import {
  tickets,
  eventTickets,
  ticketConfigurations,
  ticketTypes,
  events,
} from '@/db/schema/index.js';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select({
      eventTicketId: eventTickets.id,
      eventTitle: events.title,
      ticketName: tickets.name,
      ticketTypeId: eventTickets.ticketTypeId,
      ticketTypeName: ticketTypes.name,
      salesEnd: ticketConfigurations.salesEndDate,
    })
    .from(eventTickets)
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(sql`${eventTickets.id} IN (6, 25)`);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

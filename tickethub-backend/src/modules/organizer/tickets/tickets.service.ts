import { db } from '@/db/client.js';
import {
  tickets,
  ticketTypes,
  ticketConfigurations,
  eventTickets,
  events,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { and, eq } from 'drizzle-orm';
import type {
  CreateTicketType,
  UpdateTicketType,
} from './tickets.schema.js';

/**
 * Get all tickets belonging to an event
 */
export async function getOrganizerEventTickets(
  organizerId: number,
  eventId: number,
) {
  // Ensure organizer owns event

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  return db
    .select({
      id: tickets.id,
      name: tickets.name,
      ticketType: ticketTypes.name,
      description: ticketTypes.description,
      price: ticketConfigurations.price,
      totalCount: ticketConfigurations.totalCount,
      totalSold: ticketConfigurations.totalSold,
      remaining: ticketConfigurations.totalRemaining,
      salesStartDate: ticketConfigurations.salesStartDate,
      salesEndDate: ticketConfigurations.salesEndDate,
      benefits: ticketConfigurations.benefits,
    })
    .from(tickets)
    .leftJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
    .leftJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .leftJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(eq(tickets.eventId, eventId));
}

/**
 * Create ticket for event
 */
export async function createOrganizerTicket(
  organizerId: number,
  eventId: number,
  data: CreateTicketType,
) {
  return db.transaction(async (tx) => {
    // 1. Verify event ownership

    const [event] = await tx
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

    if (!event) {
      throw new Error('Event not found');
    }

    // 2. Create Ticket Type

    const [ticketType] = await tx
      .insert(ticketTypes)
      .values({
        name: data.ticketTypeName,
        description: data.ticketTypeDescription,
      })
      .$returningId();

    if (!ticketType) {
      throw new AppError(400, 'Ticket type creation failed');
    }

    // 3. Create Ticket

    const [ticket] = await tx
      .insert(tickets)
      .values({
        name: data.name,
        eventId,
      })
      .$returningId();

    if (!ticket) {
      throw new AppError(400, 'Ticket creation failed');
    }

    // 4. Create Configuration

    const [configuration] = await tx
      .insert(ticketConfigurations)
      .values({
        price: data.price.toString(),
        totalCount: data.totalCount,
        totalSold: 0,
        totalRemaining: data.totalCount,
        salesStartDate: data.salesStartDate,
        salesEndDate: data.salesEndDate,
        benefits: data.benefits,
      })
      .$returningId();

    if (!configuration) {
      throw new AppError(400, 'Ticket configuration creation failed');
    }

    // 5. Create Event Ticket mapping

    await tx.insert(eventTickets).values({
      ticketId: ticket.id,
      ticketTypeId: ticketType.id,
      ticketConfigurationId: configuration.id,
    });

    return {
      ticketId: ticket.id,
      ticketConfigurationId: configuration.id,
    };
  });
}

/**
 * Update ticket configuration
 */
export async function updateOrganizerTicket(
  organizerId: number,
  ticketId: number,
  data: UpdateTicketType,
) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId));

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  const [event] = await db
    .select()
    .from(events)
    .where(
      and(eq(events.id, ticket.eventId!), eq(events.organizerId, organizerId)),
    );

  if (!event) {
    throw new AppError(401, 'Unauthorized');
  }

  // We only update configuration values

  const [mapping] = await db
    .select()
    .from(eventTickets)
    .where(eq(eventTickets.ticketId, ticketId));
  await db
    .update(ticketConfigurations)
    .set({
      price: data.price?.toString(),
      salesStartDate: data.salesStartDate,
      salesEndDate: data.salesEndDate,
      benefits: data.benefits,
    })

    .where(eq(ticketConfigurations.id, mapping!.ticketConfigurationId!));

  return {
    message: 'Ticket updated successfully',
  };
}

/**
 * Delete ticket
 */
export async function deleteOrganizerTicket(
  organizerId: number,
  ticketId: number,
) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId));

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  const [event] = await db
    .select()
    .from(events)
    .where(
      and(eq(events.id, ticket.eventId!), eq(events.organizerId, organizerId)),
    );

  if (!event) {
    throw new AppError(401, 'Unauthorized');
  }

  const [mapping] = await db
    .select()
    .from(eventTickets)
    .where(eq(eventTickets.ticketId, ticketId));

  const [configuration] = await db
    .select()
    .from(ticketConfigurations)
    .where(eq(ticketConfigurations.id, mapping!.ticketConfigurationId!));

  if (Number(configuration?.totalSold ?? 0) > 0) {
    throw new AppError(
      500,
      'Ticket cannot be deleted after sales have started',
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(eventTickets).where(eq(eventTickets.ticketId, ticketId));
    await tx
      .delete(ticketConfigurations)
      .where(eq(ticketConfigurations.id, mapping!.ticketConfigurationId!));
    await tx.delete(tickets).where(eq(tickets.id, ticketId));
  });

  return {
    message: 'Ticket deleted successfully',
  };
}

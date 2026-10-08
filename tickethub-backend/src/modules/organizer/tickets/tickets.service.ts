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
  CreateTicketTypeType,
} from './tickets.schema.js';
import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';

/**
 * Get all ticket types
 */
export async function getTicketTypes() {
  return db.select().from(ticketTypes).orderBy(ticketTypes.name);
}

/**
 * Create a new ticket type
 */
export async function createTicketType(data: CreateTicketTypeType) {
  const [type] = await db
    .insert(ticketTypes)
    .values({
      name: data.name,
      description: data.description,
    })
    .$returningId();

  if (!type) {
    throw new AppError(400, 'Ticket type creation failed');
  }

  const [result] = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.id, type.id));

  return result!;
}

/**
 * Get all tickets belonging to an event
 */
export async function getOrganizerEventTickets(
  organizerId: number,
  eventId: string | number,
) {
  const idIsNumber =
    typeof eventId === 'number' || /^\d+$/.test(eventId.trim());
  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        idIsNumber
          ? eq(events.id, eventId as number)
          : eq(events.slug, eventId),
        eq(events.organizerId, organizerId),
      ),
    );

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  return db
    .select({
      id: tickets.id,
      name: tickets.name,
      ticketType: ticketTypes.name,
      ticketTypeId: eventTickets.ticketTypeId,
      description: ticketTypes.description,
      price: ticketConfigurations.price,
      totalCount: ticketConfigurations.totalCount,
      totalSold: ticketConfigurations.totalSold,
      remaining: ticketConfigurations.totalRemaining,
      salesStartDate: ticketConfigurations.salesStartDate,
      salesEndDate: ticketConfigurations.salesEndDate,
      benefits: ticketConfigurations.benefits,
      isVisible: ticketConfigurations.isVisible,
    })
    .from(tickets)
    .leftJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
    .leftJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .leftJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(eq(tickets.eventId, event.id));
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
    // 1. Verify event ownership and get event details

    const [event] = await tx
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

    if (!event) {
      throw new Error('Event not found');
    }

    // 2. Resolve ticket type (use existing or create new)

    let ticketTypeId: number;
    let ticketTypeName: string;

    if (data.ticketTypeId) {
      const [type] = await tx
        .select({ id: ticketTypes.id, name: ticketTypes.name })
        .from(ticketTypes)
        .where(eq(ticketTypes.id, data.ticketTypeId))
        .limit(1);

      if (!type) {
        throw new AppError(400, 'Ticket type not found');
      }

      ticketTypeId = type.id;
      ticketTypeName = type.name;
    } else if (data.ticketTypeName) {
      const [type] = await tx
        .insert(ticketTypes)
        .values({ name: data.ticketTypeName })
        .$returningId();

      if (!type) {
        throw new AppError(400, 'Ticket type creation failed');
      }

      ticketTypeId = type.id;
      ticketTypeName = data.ticketTypeName;
    } else {
      throw new AppError(
        400,
        'Either ticketTypeId or ticketTypeName is required',
      );
    }

    // 3. Create Ticket

    const [ticket] = await tx
      .insert(tickets)
      .values({
        name: data.name ?? ticketTypeName,
        eventId,
      })
      .$returningId();
    if (!ticket) {
      throw new AppError(400, 'Ticket creation failed');
    }

    // 4. Create Configuration

    const totalCount = data.totalCount ?? event.capacity;
    const now = new Date().toISOString();

    const [configuration] = await tx
      .insert(ticketConfigurations)
      .values({
        price: data.price.toString(),
        totalCount,
        totalSold: 0,
        totalRemaining: totalCount,
        salesStartDate:
          formatDateForMySQL(new Date(data.salesStartDate as string)) ??
          event.dateAndTime,
        salesEndDate:
          formatDateForMySQL(new Date(data.salesEndDate as string)) ??
          event.dateAndTime,
        benefits: data.benefits,
        isVisible: data.isVisible ?? true,
      })
      .$returningId();

    if (!configuration) {
      throw new AppError(400, 'Ticket configuration creation failed');
    }

    // 5. Create Event Ticket mapping

    await tx.insert(eventTickets).values({
      ticketId: ticket.id,
      ticketTypeId,
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

  const [mapping] = await db
    .select()
    .from(eventTickets)
    .where(eq(eventTickets.ticketId, ticketId));

  const updateValues: Record<string, unknown> = {};

  if (!mapping || !mapping.ticketTypeId || !mapping.ticketConfigurationId) {
    throw new AppError(404, 'Ticket mapping not found');
  }

  const ticketTypeId = Number(mapping.ticketTypeId);
  const ticketConfigurationId = Number(mapping.ticketConfigurationId);

  if (data.ticketTypeName !== undefined) {
    const typeName = data.ticketTypeName.trim();
    await db.transaction(async (tx) => {
      await tx
        .update(ticketTypes)
        .set({ name: typeName })
        .where(eq(ticketTypes.id, ticketTypeId));
      await tx
        .update(tickets)
        .set({ name: typeName })
        .where(eq(tickets.id, ticketId));
    });
  }

  if (data.price !== undefined) {
    updateValues.price = data.price.toString();
  }

  if (data.totalCount !== undefined) {
    const [config] = await db
      .select()
      .from(ticketConfigurations)
      .where(eq(ticketConfigurations.id, ticketConfigurationId));

    const totalSold = Number(config?.totalSold ?? 0);
    updateValues.totalCount = data.totalCount;
    updateValues.totalRemaining = data.totalCount - totalSold;
  }

  if (data.salesStartDate !== undefined) {
    updateValues.salesStartDate = formatDateForMySQL(
      new Date(data.salesStartDate),
    );
  }

  if (data.salesEndDate !== undefined) {
    updateValues.salesEndDate = formatDateForMySQL(new Date(data.salesEndDate));
  }

  if (data.benefits !== undefined) {
    updateValues.benefits = data.benefits;
  }

  if (data.isVisible !== undefined) {
    updateValues.isVisible = data.isVisible;
  }

  if (Object.keys(updateValues).length > 0) {
    await db
      .update(ticketConfigurations)
      .set(updateValues)
      .where(eq(ticketConfigurations.id, ticketConfigurationId));
  }

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

  if (!mapping || !mapping.ticketConfigurationId) {
    throw new AppError(404, 'Ticket mapping not found');
  }

  const ticketConfigurationId = Number(mapping.ticketConfigurationId);

  const [configuration] = await db
    .select()
    .from(ticketConfigurations)
    .where(eq(ticketConfigurations.id, ticketConfigurationId));

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
      .where(eq(ticketConfigurations.id, ticketConfigurationId));
    await tx.delete(tickets).where(eq(tickets.id, ticketId));
  });

  return {
    message: 'Ticket deleted successfully',
  };
}





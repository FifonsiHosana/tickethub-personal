import { db } from '@/db/client.js';

import {
  events,
  eventsVenues,
  eventImages,
  tickets,
  eventTickets,
  ticketConfigurations,
  ticketTypes,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';

import { and, eq, like, desc, count } from 'drizzle-orm';

import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';
import logger from '@/utils/logger/index.js';

interface GetOrganizerEventsParams {
  organizerId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'Draft' | 'Published' | 'Completed' | 'Cancelled';
}

/**
 * Get all events created by organizer
 */
export async function getOrganizerEvents(params: GetOrganizerEventsParams) {
  const { organizerId, page = 1, pageSize = 10, search, status } = params;
  const offset = (page - 1) * pageSize;
  const filters = [eq(events.organizerId, organizerId)];

  if (search) {
    filters.push(like(events.title, `%${search}%`));
  }

  if (status) {
    filters.push(eq(events.status, status));
  }

  const data = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      status: events.status,
      dateAndTime: events.dateAndTime,
      approvalStatus: events.approvalStatus,
      capacity: events.capacity,
      venue: eventsVenues.venue_name,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
    .where(and(...filters))
    .orderBy(desc(events.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({
      count: count(),
    })
    .from(events)
    .where(and(...filters));

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: totalResult[0]?.count ?? 0,
      totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / pageSize),
    },
  };
}

/**
 * Get single organizer event
 */
export async function getOrganizerEventById(
  organizerId: number,
  eventId: number,
) {
  const [result] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!result) {
    throw new Error('Event not found');
  }

  const media = await db
    .select()
    .from(eventImages)
    .where(eq(eventImages.eventId, eventId));

  const eventTicketsData = await db
    .select({
      id: tickets.id,
      name: tickets.name,
      ticketType: ticketTypes.name,
      price: ticketConfigurations.price,
      totalCount: ticketConfigurations.totalCount,
      totalSold: ticketConfigurations.totalSold,
      remaining: ticketConfigurations.totalRemaining,
    })
    .from(tickets)
    .leftJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
    .leftJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .leftJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(eq(tickets.eventId, eventId));

  return {
    ...result,
    media,
    tickets: eventTicketsData,
  };
}

/**
 * Get single organizer event
 */
// export async function getOrganizerEventById(
//   organizerId: number,
//   eventId: number,
//   executor: Executor = db, // defaults to the pool, but a tx can be passed in
// ) {
//   const [result] = await executor
//     .select()
//     .from(events)
//     .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
//     .limit(1);

//   if (!result) {
//     throw new Error('Event not found');
//   }

//   const media = await executor
//     .select()
//     .from(eventImages)
//     .where(eq(eventImages.eventId, eventId));

//   const eventTicketsData = await executor
//     .select({/* ... */})
//     .from(tickets)
//     // ...
//     .where(eq(tickets.eventId, eventId));

//   return {
//     ...result,
//     media,
//     tickets: eventTicketsData,
//   };

/**
 * Create organizer event
 */
export async function createOrganizerEvent(organizerId: number, data: any) {
  return await db.transaction(async (tx) => {
    const [event] = await tx
      .insert(events)
      .values({
        title: data.title,
        description: data.description,
        eventVenueId: data.eventVenueId,
        organizerId,
        capacity: data.capacity,
        dateAndTime: formatDateForMySQL(new Date(data.dateAndTime)),
        status: 'Draft',
        approvalStatus: 'Pending',
        termsAndConditions: data.termsAndConditions,
      })

      .$returningId();

    if (!event) {
      throw new AppError(400, 'Event creation failed');
    }

    logger.info(`Event created with id: ${JSON.stringify(event)}`);

    const eventId = event.id;

    if (data.media && data.media.length) {
      await tx.insert(eventImages).values(
        data.media.map((media: any) => ({
          eventId,

          imageUrl: media.imageUrl,

          type: media.type,
        })),
      );
    }

    logger.info(
      `This is the organizer id within the service: ${JSON.stringify(organizerId)}`,
    );

    return {
      id: eventId,
      message: 'Event created successfully',
    };
  });
}

/**
 * Update organizer event
 */
export async function updateOrganizerEvent(
  eventId: number,
  organizerId: number,
  data: any,
) {
  return await db.transaction(async (tx) => {
    await tx
      .update(events)
      .set({
        title: data.title,
        description: data.description,
        capacity: data.capacity,
        dateAndTime: data.dateAndTime,
        updatedAt: now(),
      })

      .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

    if (data.media) {
      await tx
        .delete(eventImages)

        .where(eq(eventImages.eventId, eventId));

      await tx.insert(eventImages).values(
        data.media.map((media: any) => ({
          eventId,

          imageUrl: media.imageUrl,

          type: media.type,
        })),
      );
    }

    return {
      message: 'Event updated successfully',
    };
  });
}
/**
 * Cancel organizer event
 */
export async function cancelOrganizerEvent(
  organizerId: number,
  eventId: number,
) {
  await db
    .update(events)
    .set({
      status: 'Cancelled',
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

  return {
    message: 'Event cancelled successfully',
  };
}

/*Delete Organizer Event*/
export async function deleteOrganizerEvent(eventId: number) {
  return await db.transaction(async (tx) => {
    await tx
      .delete(eventImages)

      .where(eq(eventImages.eventId, eventId));

    await tx
      .delete(events)

      .where(eq(events.id, eventId));

    return {
      message: 'Event deleted',
    };
  });
}

import { db } from '@/db/client.js';

import {
  events,
  eventsVenues,
  eventImages,
  tickets,
  eventTickets,
  ticketConfigurations,
  ticketTypes,
  eventStaff,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';

import { and, eq, like, desc, count } from 'drizzle-orm';

import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';
import logger from '@/utils/logger/index.js';

interface GetOrganizerEventsParams {
  organizerId: number;
  staffUserId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'Draft' | 'Published' | 'Completed' | 'Cancelled';
}

/**
 * Get all event venues
 */
export async function getAllEventVenues() {
  const data = await db.select().from(eventsVenues);

  return data;
}

/**
 * Create a new event venue
 */
export async function createEventVenue(data: {
  venue_name: string;
  address?: string;
  city_or_town: string;
  country: string;
  googleMapLink?: string;
}) {
  const [venue] = await db.insert(eventsVenues).values(data).$returningId();

  if (!venue) {
    throw new AppError(400, 'Venue creation failed');
  }

  const [created] = await db
    .select()
    .from(eventsVenues)
    .where(eq(eventsVenues.id, venue.id))
    .limit(1);

  return created;
}

/**
 * Get all events created by organizer
 */
export async function getOrganizerEvents(params: GetOrganizerEventsParams) {
  const { organizerId, staffUserId, page = 1, pageSize = 10, search, status } = params;
  const offset = (page - 1) * pageSize;

  let dataQuery = db
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
    .$dynamic();

  const filters: any[] = [];

  if (staffUserId) {
    dataQuery = dataQuery.innerJoin(eventStaff, eq(events.id, eventStaff.event_id));
    filters.push(eq(eventStaff.staff_id, staffUserId));
  } else {
    filters.push(eq(events.organizerId, organizerId));
  }

  if (search) {
    filters.push(like(events.title, `%${search}%`));
  }

  if (status) {
    filters.push(eq(events.status, status));
  }

  const data = await dataQuery
    .where(and(...filters))
    .orderBy(desc(events.createdAt))
    .limit(pageSize)
    .offset(offset);

  let countQuery = db
    .select({ count: count() })
    .from(events)
    .$dynamic();

  if (staffUserId) {
    countQuery = countQuery.innerJoin(eventStaff, eq(events.id, eventStaff.event_id));
  }

  const totalResult = await countQuery.where(and(...filters));

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
 * Create organizer event with tickets in a single transaction
 */
export async function createOrganizerEventWithTickets(
  organizerId: number,
  data: {
    title: string;
    description?: string;
    eventVenueId: number;
    media?: { imageUrl: string; type: 'Banner' | 'Gallery' | 'Sponsor' }[];
    dateAndTime: string;
    capacity: number;
    termsAndConditions?: string;
    tickets: {
      name: string;
      ticketTypeId?: number;
      ticketTypeName?: string;
      ticketTypeDescription?: string;
      price: number;
      totalCount?: number;
      salesStartDate?: string;
      salesEndDate?: string;
      benefits?: string;
    }[];
  },
) {
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

    const eventId = event.id;

    if (data.media && data.media.length) {
      await tx.insert(eventImages).values(
        data.media.map((m) => ({
          eventId,
          imageUrl: m.imageUrl,
          type: m.type,
        })),
      );
    }

    const createdTickets: { ticketId: number; ticketConfigurationId: number }[] =
      [];

    for (const ticketData of data.tickets) {
      let ticketTypeId: number;

      if (ticketData.ticketTypeId) {
        ticketTypeId = ticketData.ticketTypeId;
      } else if (ticketData.ticketTypeName) {
        const [type] = await tx
          .insert(ticketTypes)
          .values({
            name: ticketData.ticketTypeName,
            description: ticketData.ticketTypeDescription,
          })
          .$returningId();

        if (!type) {
          throw new AppError(400, 'Ticket type creation failed');
        }

        ticketTypeId = type.id;
      } else {
        throw new AppError(
          400,
          'Either ticketTypeId or ticketTypeName is required for each ticket',
        );
      }

      const [ticket] = await tx
        .insert(tickets)
        .values({
          name: ticketData.name,
          eventId,
        })
        .$returningId();

      if (!ticket) {
        throw new AppError(400, 'Ticket creation failed');
      }

      const totalCount = ticketData.totalCount ?? data.capacity;
      const configSalesStart = formatDateForMySQL(
        new Date(ticketData.salesStartDate ?? data.dateAndTime),
      );
      const configSalesEnd = formatDateForMySQL(
        new Date(ticketData.salesEndDate ?? data.dateAndTime),
      );

      const [configuration] = await tx
        .insert(ticketConfigurations)
        .values({
          price: ticketData.price.toString(),
          totalCount,
          totalSold: 0,
          totalRemaining: totalCount,
          salesStartDate: configSalesStart,
          salesEndDate: configSalesEnd,
          benefits: ticketData.benefits,
        })
        .$returningId();

      if (!configuration) {
        throw new AppError(400, 'Ticket configuration creation failed');
      }

      await tx.insert(eventTickets).values({
        ticketId: ticket.id,
        ticketTypeId,
        ticketConfigurationId: configuration.id,
      });

      createdTickets.push({
        ticketId: ticket.id,
        ticketConfigurationId: configuration.id,
      });
    }

    return {
      id: eventId,
      tickets: createdTickets,
      message: 'Event and tickets created successfully',
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
export async function deleteOrganizerEvent(
  organizerId: number,
  eventId: number,
) {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!event) {
    throw new AppError(404, 'Event not found or unauthorized');
  }

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

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
  category,
  categorizedEvents,
  platformSettings,
  ticketOrderItems,
  payments,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { normalizeGoogleMapLink } from '@/utils/googleMapLink.js';
import { now } from '@/utils/timeDatehelpers.js';

import { and, eq, like, desc, count, inArray, sql } from 'drizzle-orm';

import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';
import logger from '@/utils/logger/index.js';
import { createUniqueEventSlug } from '@/modules/events/event-slug.service.js';
function formatEventDateForMySQL(value: string): string {
  const trimmed = value.trim();
  const localMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/,
  );

  if (localMatch) {
    return `${localMatch[1]} ${localMatch[2]}:${localMatch[3] ?? '00'}.000`;
  }

  return formatDateForMySQL(new Date(trimmed));
}

interface GetOrganizerEventsParams {

  organizerId: number;
  staffUserId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'Draft' | 'Published' | 'Completed' | 'Cancelled';
}

function eventIdentifierFilter(identifier: string | number) {
  const value = String(identifier).trim();
  return /^\d+$/.test(value)
    ? eq(events.id, Number(value))
    : eq(events.slug, value);
}

/**
 * Whether platform settings currently auto-approve new events.
 */
export async function isAutoApproveEnabled(): Promise<boolean> {
  const [row] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, 'auto_approve_events'))
    .limit(1);

  return row?.value === 'true';
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
  const [venue] = await db
    .insert(eventsVenues)
    .values({
      ...data,
      googleMapLink: normalizeGoogleMapLink(data.googleMapLink),
    })
    .$returningId();

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
  const {
    organizerId,
    staffUserId,
    page = 1,
    pageSize = 10,
    search,
    status,
  } = params;
  const offset = (page - 1) * pageSize;

  let dataQuery = db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      description: events.description,
      status: events.status,
      dateAndTime: events.dateAndTime,
      dateAndTimeEnd: events.dateAndTimeEnd,
      approvalStatus: events.approvalStatus,
      capacity: events.capacity,
      venue: eventsVenues.venue_name,
      banner: eventImages.imageUrl,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
    .leftJoin(
      eventImages,
      and(eq(eventImages.eventId, events.id), eq(eventImages.type, 'Banner')),
    )
    .$dynamic();

  const filters: any[] = [];

  if (staffUserId) {
    dataQuery = dataQuery.innerJoin(
      eventStaff,
      eq(events.id, eventStaff.event_id),
    );
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

  let countQuery = db.select({ count: count() }).from(events).$dynamic();

  if (staffUserId) {
    countQuery = countQuery.innerJoin(
      eventStaff,
      eq(events.id, eventStaff.event_id),
    );
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
  eventIdentifier: string | number,
) {
  const [result] = await db
    .select()
    .from(events)
    .where(and(eventIdentifierFilter(eventIdentifier), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!result) {
    throw new Error('Event not found');
  }

  const eventId = result.id;

  const media = await db
    .select()
    .from(eventImages)
    .where(eq(eventImages.eventId, eventId));

  const [venue] = await db
    .select()
    .from(eventsVenues)
    .where(eq(eventsVenues.id, result.eventVenueId as number))
    .limit(1);

  const categoryRows = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(categorizedEvents)
    .innerJoin(category, eq(categorizedEvents.category_id, category.id))
    .where(eq(categorizedEvents.event_id, eventId));

  const eventTicketsData = await db
    .select({
      id: tickets.id,
      name: tickets.name,
      ticketType: ticketTypes.name,
      ticketTypeId: eventTickets.ticketTypeId,
      price: ticketConfigurations.price,
      totalCount: ticketConfigurations.totalCount,
      totalSold: sql<number>`(
        SELECT COUNT(toi.id)
        FROM TicketOrderItems toi
        INNER JOIN Payments p
          ON p.orderId = toi.orderId
         AND p.status = 'Completed'
        WHERE toi.status = 'Valid' AND toi.eventTicketId = ${eventTickets.id}
      )`,
      remaining: sql<number>`GREATEST(${ticketConfigurations.totalCount} - (
        SELECT COUNT(toi.id)
        FROM TicketOrderItems toi
        INNER JOIN Payments p
          ON p.orderId = toi.orderId
         AND p.status = 'Completed'
        WHERE toi.status = 'Valid' AND toi.eventTicketId = ${eventTickets.id}
      ), 0)`,
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
    .where(eq(tickets.eventId, result.id));

  return {
    ...result,
    media,
    venue: venue ?? null,
    categoryIds: categoryRows.map((c) => c.id),
    categoryNames: categoryRows.map((c) => c.name),
    tickets: eventTicketsData,
  };
}

/**
 * Create organizer event
 */
export async function createOrganizerEvent(organizerId: number, data: any) {
  const autoApprove = await isAutoApproveEnabled();

  return await db.transaction(async (tx) => {
    const slug = await createUniqueEventSlug(tx as any, data.title);
    let eventVenueId = data.eventVenueId;

    if (!eventVenueId && data.venue) {
      const [venue] = await tx
        .insert(eventsVenues)
        .values({
          venue_name: data.venue.venue_name,
          address: data.venue.address,
          city_or_town: data.venue.city_or_town,
          country: data.venue.country,
          googleMapLink: normalizeGoogleMapLink(data.venue.googleMapLink),
        })
        .$returningId();

      if (!venue) {
        throw new AppError(400, 'Venue creation failed');
      }

      eventVenueId = venue.id;
    }

    const [event] = await tx
      .insert(events)
      .values({
        title: data.title,
        description: data.description,
        slug,
        eventVenueId,
        organizerId,
        capacity: data.capacity,
        dateAndTime: formatEventDateForMySQL(data.dateAndTime),
        dateAndTimeEnd: data.dateAndTimeEnd
          ? formatEventDateForMySQL(data.dateAndTimeEnd)
          : undefined,
        status: autoApprove ? 'Published' : 'Draft',
        approvalStatus: autoApprove ? 'Approved' : 'Pending',
        approvedAt: autoApprove ? now() : undefined,
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
      status: autoApprove ? 'Published' : 'Draft',
      approvalStatus: autoApprove ? 'Approved' : 'Pending',
      message: autoApprove
        ? 'Event created and published'
        : 'Event created successfully',
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
    eventVenueId?: number;
    venue?: {
      venue_name: string;
      address?: string;
      city_or_town: string;
      country: string;
      googleMapLink?: string;
    };
    media?: { imageUrl: string; type: 'Banner' | 'Gallery' | 'Sponsor' }[];
    dateAndTime: string;
    dateAndTimeEnd?: string;
    capacity: number;
    termsAndConditions?: string;
    categoryIds?: number[];
    tickets: {
      name?: string;
      ticketTypeId?: number;
      ticketTypeName?: string;
      price: number;
      totalCount?: number;
      salesStartDate?: string;
      salesEndDate?: string;
      benefits?: string;
      isVisible?: boolean;
    }[];
  },
) {
  const autoApprove = await isAutoApproveEnabled();

  const totalAllocated = data.tickets.reduce(
    (sum, t) => sum + (t.totalCount ?? data.capacity),
    0,
  );

  if (totalAllocated > data.capacity) {
    throw new AppError(
      400,
      `Total ticket quantity (${totalAllocated}) exceeds event capacity (${data.capacity})`,
    );
  }

  return await db.transaction(async (tx) => {
    const slug = await createUniqueEventSlug(tx as any, data.title);

    let eventVenueId = data.eventVenueId;

    if (!eventVenueId && data.venue) {
      const [venue] = await tx
        .insert(eventsVenues)
        .values({
          venue_name: data.venue.venue_name,
          address: data.venue.address,
          city_or_town: data.venue.city_or_town,
          country: data.venue.country,
          googleMapLink: normalizeGoogleMapLink(data.venue.googleMapLink),
        })
        .$returningId();

      if (!venue) {
        throw new AppError(400, 'Venue creation failed');
      }

      eventVenueId = venue.id;
    }

    if (!eventVenueId) {
      throw new AppError(400, 'Either eventVenueId or venue is required');
    }

    const [event] = await tx
      .insert(events)
      .values({
        title: data.title,
        description: data.description,
        slug,
        eventVenueId,
        organizerId,
        capacity: data.capacity,
        dateAndTime: formatEventDateForMySQL(data.dateAndTime),
        dateAndTimeEnd: data.dateAndTimeEnd
          ? formatEventDateForMySQL(data.dateAndTimeEnd)
          : undefined,
        status: autoApprove ? 'Published' : 'Draft',
        approvalStatus: autoApprove ? 'Approved' : 'Pending',
        approvedAt: autoApprove ? now() : undefined,
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

    const categoryIds = [...new Set(data.categoryIds ?? [])];

    if (categoryIds.length) {
      const existingCategories = await tx
        .select({ id: category.id })
        .from(category)
        .where(inArray(category.id, categoryIds));

      if (existingCategories.length !== categoryIds.length) {
        throw new AppError(400, 'One or more categories are invalid.');
      }

      await tx.insert(categorizedEvents).values(
        categoryIds.map((categoryId) => ({
          event_id: eventId,
          category_id: categoryId,
        })),
      );
    }

    const createdTickets: {
      ticketId: number;
      ticketConfigurationId: number;
    }[] = [];

    for (const [index, ticketData] of data.tickets.entries()) {
      let ticketTypeId: number;
      let ticketTypeLabel: string;

      if (ticketData.ticketTypeId) {
        const [type] = await tx
          .select({ id: ticketTypes.id, name: ticketTypes.name })
          .from(ticketTypes)
          .where(eq(ticketTypes.id, ticketData.ticketTypeId))
          .limit(1);

        if (!type) {
          throw new AppError(400, 'Ticket type not found');
        }

        ticketTypeId = type.id;
        ticketTypeLabel = type.name;
      } else if (ticketData.ticketTypeName) {
        const [type] = await tx
          .insert(ticketTypes)
          .values({ name: ticketData.ticketTypeName })
          .$returningId();

        if (!type) {
          throw new AppError(400, 'Ticket type creation failed');
        }

        ticketTypeId = type.id;
        ticketTypeLabel = ticketData.ticketTypeName;
      } else {
        throw new AppError(
          400,
          'Either ticketTypeId or ticketTypeName is required for each ticket',
        );
      }

      const [ticket] = await tx
        .insert(tickets)
        .values({
          name: ticketData.name ?? (ticketTypeLabel || `Ticket type ${index + 1}`),
          eventId,
        })
        .$returningId();
      if (!ticket) {
        throw new AppError(400, 'Ticket creation failed');
      }

      const totalCount = ticketData.totalCount ?? data.capacity;
      const configSalesStart = formatEventDateForMySQL(
        ticketData.salesStartDate ?? data.dateAndTime,
      );
      const configSalesEnd = formatEventDateForMySQL(
        ticketData.salesEndDate ?? data.dateAndTimeEnd ?? data.dateAndTime,
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
          isVisible: ticketData.isVisible ?? true,
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
      status: autoApprove ? 'Published' : 'Draft',
      approvalStatus: autoApprove ? 'Approved' : 'Pending',
      message: autoApprove
        ? 'Event created and published'
        : 'Event and tickets created successfully',
    };
  });
}

/**
 * Update organizer event
 */
export async function updateOrganizerEvent(
  eventIdentifier: string | number,
  organizerId: number,
  data: any,
) {
  let updatedEventId = 0;

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: events.id,
        eventVenueId: events.eventVenueId,
        capacity: events.capacity,
        dateAndTime: events.dateAndTime,
        dateAndTimeEnd: events.dateAndTimeEnd,
      })
      .from(events)
      .where(and(eventIdentifierFilter(eventIdentifier), eq(events.organizerId, organizerId)))
      .limit(1);

    if (!existing) {
      throw new AppError(404, 'Event not found or unauthorized');
    }

    const eventId = existing.id;
    updatedEventId = eventId;

    if (data.venue && !data.eventVenueId) {
      const venueValues = {
        venue_name: data.venue.venue_name,
        address: data.venue.address?.trim() ? data.venue.address : null,
        city_or_town: data.venue.city_or_town,
        country: data.venue.country,
        googleMapLink: normalizeGoogleMapLink(data.venue.googleMapLink) ?? null,
      };

      if (existing.eventVenueId) {
        await tx
          .update(eventsVenues)
          .set(venueValues)
          .where(eq(eventsVenues.id, existing.eventVenueId));
      } else {
        const [venue] = await tx
          .insert(eventsVenues)
          .values(venueValues)
          .$returningId();

        if (!venue) {
          throw new AppError(400, 'Venue creation failed');
        }

        data.eventVenueId = venue.id;
      }
    }

    const eventValues: any = {
      updatedAt: now(),
    };

    if (data.title !== undefined) {
      eventValues.title = data.title;
    }

    if (data.description !== undefined) {
      eventValues.description = data.description?.trim()
        ? data.description
        : null;
    }

    if (data.capacity !== undefined) {
      eventValues.capacity = data.capacity;
    }

    if (data.dateAndTime !== undefined) {
      eventValues.dateAndTime = formatEventDateForMySQL(data.dateAndTime);
    }

    if (data.dateAndTimeEnd !== undefined) {
      eventValues.dateAndTimeEnd = data.dateAndTimeEnd
        ? formatEventDateForMySQL(data.dateAndTimeEnd)
        : null;
    }

    if (data.eventVenueId !== undefined) {
      eventValues.eventVenueId = data.eventVenueId;
    }

    if (data.termsAndConditions !== undefined) {
      eventValues.termsAndConditions = data.termsAndConditions?.trim()
        ? data.termsAndConditions
        : null;
    }

    await tx
      .update(events)
      .set(eventValues)

      .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

    if (data.categoryIds !== undefined) {
      const categoryIds = [...new Set(data.categoryIds as number[])];

      if (categoryIds.length) {
        const valid = await tx
          .select({ id: category.id })
          .from(category)
          .where(inArray(category.id, categoryIds));

        if (valid.length !== categoryIds.length) {
          throw new AppError(400, 'One or more categories are invalid.');
        }
      }

      await tx
        .delete(categorizedEvents)
        .where(eq(categorizedEvents.event_id, eventId));

      if (categoryIds.length) {
        await tx.insert(categorizedEvents).values(
          categoryIds.map((categoryId) => ({
            event_id: eventId,
            category_id: categoryId,
          })),
        );
      }
    }

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

    if (data.tickets) {
      const deleteIds = [...new Set((data.tickets.deleteIds ?? []) as number[])];

      if (deleteIds.length) {
        const rows = await tx
          .select({ ticketId: tickets.id, totalSold: ticketConfigurations.totalSold })
          .from(tickets)
          .innerJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
          .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
          .where(and(eq(tickets.eventId, eventId), inArray(tickets.id, deleteIds)));

        if (rows.length !== deleteIds.length) {
          throw new AppError(400, 'One or more tickets do not belong to this event.');
        }

        if (rows.some((row) => Number(row.totalSold ?? 0) > 0)) {
          throw new AppError(400, 'Ticket types with sales cannot be deleted. Hide them instead.');
        }

        const eventTicketRows = await tx
          .select({ configId: eventTickets.ticketConfigurationId })
          .from(eventTickets)
          .where(inArray(eventTickets.ticketId, deleteIds));

        await tx.delete(eventTickets).where(inArray(eventTickets.ticketId, deleteIds));
        await tx.delete(tickets).where(inArray(tickets.id, deleteIds));

        const configIds = eventTicketRows
          .map((row) => row.configId)
          .filter((id): id is number => id !== null);
        if (configIds.length) {
          await tx.delete(ticketConfigurations).where(inArray(ticketConfigurations.id, configIds));
        }
      }

      const upsertTickets = (data.tickets.upsert ?? []) as {
        id?: number;
        ticketTypeName: string;
        price: number;
        totalCount?: number;
        salesStartDate?: string;
        salesEndDate?: string;
        benefits?: string;
        isVisible?: boolean;
      }[];

      for (const [index, ticketData] of upsertTickets.entries()) {
        const label = ticketData.ticketTypeName.trim();
        const totalCount = ticketData.totalCount ?? data.capacity ?? existing.capacity;
        const salesStartDate = formatEventDateForMySQL(
          ticketData.salesStartDate ?? data.dateAndTime ?? existing.dateAndTime,
        );
        const salesEndDate = formatEventDateForMySQL(
          ticketData.salesEndDate ?? data.dateAndTimeEnd ?? existing.dateAndTimeEnd ?? data.dateAndTime ?? existing.dateAndTime,
        );

        if (ticketData.id) {
          const [current] = await tx
            .select({
              ticketId: tickets.id,
              ticketTypeId: eventTickets.ticketTypeId,
              configId: eventTickets.ticketConfigurationId,
              totalSold: ticketConfigurations.totalSold,
            })
            .from(tickets)
            .innerJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
            .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
            .where(and(eq(tickets.id, ticketData.id), eq(tickets.eventId, eventId)))
            .limit(1);

          if (!current?.configId || !current.ticketTypeId) {
            throw new AppError(400, 'Ticket type not found for this event.');
          }

          const totalSold = Number(current.totalSold ?? 0);
          if (totalCount < totalSold) {
            throw new AppError(400, 'Ticket quantity cannot be lower than tickets already sold.');
          }

          await tx.update(ticketTypes).set({ name: label }).where(eq(ticketTypes.id, current.ticketTypeId));
          await tx.update(tickets).set({ name: label }).where(eq(tickets.id, ticketData.id));
          await tx
            .update(ticketConfigurations)
            .set({
              price: ticketData.price.toString(),
              totalCount,
              totalRemaining: totalCount - totalSold,
              salesStartDate,
              salesEndDate,
              benefits: ticketData.benefits?.trim() || null,
              isVisible: ticketData.isVisible ?? true,
            })
            .where(eq(ticketConfigurations.id, current.configId));
        } else {
          const [type] = await tx.insert(ticketTypes).values({ name: label }).$returningId();
          if (!type) throw new AppError(400, 'Ticket type creation failed');

          const [ticket] = await tx
            .insert(tickets)
            .values({ name: label || `Ticket type ${index + 1}`, eventId })
            .$returningId();
          if (!ticket) throw new AppError(400, 'Ticket creation failed');

          const [configuration] = await tx
            .insert(ticketConfigurations)
            .values({
              price: ticketData.price.toString(),
              totalCount,
              totalSold: 0,
              totalRemaining: totalCount,
              salesStartDate,
              salesEndDate,
              benefits: ticketData.benefits?.trim() || null,
              isVisible: ticketData.isVisible ?? true,
            })
            .$returningId();
          if (!configuration) throw new AppError(400, 'Ticket configuration creation failed');

          await tx.insert(eventTickets).values({
            ticketId: ticket.id,
            ticketTypeId: type.id,
            ticketConfigurationId: configuration.id,
          });
        }
      }

      const allocationRows = await tx
        .select({ totalCount: ticketConfigurations.totalCount })
        .from(tickets)
        .innerJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
        .where(eq(tickets.eventId, eventId));
      const totalAllocated = allocationRows.reduce((sum, row) => sum + Number(row.totalCount ?? 0), 0);
      const capacity = data.capacity ?? existing.capacity;
      if (totalAllocated > capacity) {
        throw new AppError(400, `Total ticket quantity (${totalAllocated}) exceeds event capacity (${capacity})`);
      }
    }
  });

  return {
    message: 'Event updated successfully',
    event: await getOrganizerEventById(organizerId, updatedEventId),
  };
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
      updatedAt: now(),
    })
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

  return {
    message: 'Event cancelled successfully',
  };
}

export async function publishOrganizerEvent(
  organizerId: number,
  eventId: number,
) {
  const [event] = await db
    .select({
      id: events.id,
      status: events.status,
      approvalStatus: events.approvalStatus,
    })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!event) {
    throw new AppError(404, 'Event not found or unauthorized');
  }

  if (event.status !== 'Cancelled') {
    throw new AppError(400, 'Only cancelled events can be published');
  }

  if (event.approvalStatus !== 'Approved') {
    throw new AppError(400, 'Only approved events can be published');
  }

  await db
    .update(events)
    .set({
      status: 'Published',
      updatedAt: now(),
    })
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));

  return {
    message: 'Event published successfully',
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












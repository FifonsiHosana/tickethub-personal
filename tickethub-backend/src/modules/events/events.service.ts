import { db } from '@/db/client.js';
import {
  events,
  eventsVenues,
  eventImages,
  eventTickets,
  tickets,
  ticketTypes,
  ticketConfigurations,
  category,
  categorizedEvents,
} from '@/db/schema/index.js';

import { users } from '@/db/schema/index.js';

import {
  and,
  asc,
  desc,
  eq,
  gt,
  lte,
  gte,
  inArray,
  count,
  sql,
} from 'drizzle-orm';
import type { GetPublishedEventsQuery } from './events.schema.js';
import type { PublishedEventResponse, PaginationMeta } from './events.types.js';

class EventsService {
  async getPublishedEvents(params: GetPublishedEventsQuery): Promise<{
    data: PublishedEventResponse[];
    pagination: PaginationMeta;
  }> {
    const { page, pageSize, search, categoryId, sortBy, sortOrder } = params;
    const offset = (page - 1) * pageSize;

    const conditions: ReturnType<typeof and>[] = [
      eq(events.status, 'Published'),
      eq(events.approvalStatus, 'Approved'),
    ];

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        sql`(${events.title} LIKE ${pattern} OR ${eventsVenues.venue_name} LIKE ${pattern} OR ${eventsVenues.city_or_town} LIKE ${pattern})`,
      );
    }

    if (categoryId) {
      const eventIdsWithCategory = await db
        .select({ eventId: categorizedEvents.event_id })
        .from(categorizedEvents)
        .where(eq(categorizedEvents.category_id, categoryId));

      const validEventIds = eventIdsWithCategory
        .map((r) => r.eventId)
        .filter((id): id is number => id !== null);

      if (validEventIds.length === 0) {
        return {
          data: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
        };
      }

      conditions.push(inArray(events.id, validEventIds));
    }

    const whereClause = and(...conditions);

    // Total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .where(whereClause);

    const total = Number(totalResult?.count ?? 0);

    if (total === 0) {
      return {
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 },
      };
    }

    // Order
    const orderColumn = sortBy === 'title' ? events.title : events.dateAndTime;
    const orderDirection =
      sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn);

    // Get paginated IDs (avoids join multiplication)
    const eventRows = await db
      .select({ id: events.id })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(pageSize)
      .offset(offset);

    const eventIds = eventRows.map((r) => r.id);

    if (eventIds.length === 0) {
      return {
        data: [],
        pagination: { page, pageSize, total, totalPages: 1 },
      };
    }

    // Full data for these IDs
    const data = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        dateAndTime: events.dateAndTime,
        capacity: events.capacity,
        venueName: eventsVenues.venue_name,
        city: eventsVenues.city_or_town,
        country: eventsVenues.country,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        banner: eventImages.imageUrl,
      })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(
        eventImages,
        and(eq(eventImages.eventId, events.id), eq(eventImages.type, 'Banner')),
      )
      .where(inArray(events.id, eventIds));

    // Categories for these events
    const categoryRows = await db
      .select({
        eventId: categorizedEvents.event_id,
        categoryId: category.id,
        categoryName: category.name,
      })
      .from(categorizedEvents)
      .innerJoin(category, eq(categorizedEvents.category_id, category.id))
      .where(inArray(categorizedEvents.event_id, eventIds));

    const categoryMap = new Map<number, { ids: number[]; names: string[] }>();
    for (const row of categoryRows) {
      if (!row.eventId) continue;
      if (!categoryMap.has(row.eventId)) {
        categoryMap.set(row.eventId, { ids: [], names: [] });
      }
      const entry = categoryMap.get(row.eventId)!;
      entry.ids.push(row.categoryId);
      entry.names.push(row.categoryName);
    }

    // Preserve paginated order
    const eventOrderMap = new Map(eventIds.map((id, idx) => [id, idx]));
    const sortedData = data
      .sort(
        (a, b) =>
          (eventOrderMap.get(a.id) ?? 0) - (eventOrderMap.get(b.id) ?? 0),
      )
      .map((event) => {
        const cats = categoryMap.get(event.id);
        return {
          ...event,
          categoryIds: cats?.ids ?? [],
          categoryNames: cats?.names ?? [],
        };
      });

    return {
      data: sortedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getEventById(eventId: number) {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        dateAndTime: events.dateAndTime,
        capacity: events.capacity,
        status: events.status,
        termsAndConditions: events.termsAndConditions,
        venueName: eventsVenues.venue_name,
        address: eventsVenues.address,
        city: eventsVenues.city_or_town,
        country: eventsVenues.country,
        googleMapLink: eventsVenues.googleMapLink,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
      })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(
        and(
          eq(events.id, eventId),
          eq(events.status, 'Published'),
          eq(events.approvalStatus, 'Approved'),
        ),
      )
      .limit(1);

    if (!event) return null;

    const images = await db
      .select({
        imageUrl: eventImages.imageUrl,
        type: eventImages.type,
      })
      .from(eventImages)
      .where(eq(eventImages.eventId, eventId));

    // Categories for this event
    const categoryRows = await db
      .select({
        id: category.id,
        name: category.name,
      })
      .from(categorizedEvents)
      .innerJoin(category, eq(categorizedEvents.category_id, category.id))
      .where(eq(categorizedEvents.event_id, eventId));

    return {
      ...event,
      images,
      categoryIds: categoryRows.map((c) => c.id),
      categoryNames: categoryRows.map((c) => c.name),
    };
  }

  async getEventTickets(eventId: number) {
    return await db
      .select({
        eventTicketId: eventTickets.id,
        ticketId: tickets.id,
        ticketName: tickets.name,
        ticketType: ticketTypes.name,
        description: ticketTypes.description,
        price: ticketConfigurations.price,
        totalRemaining: ticketConfigurations.totalRemaining,
        salesStart: ticketConfigurations.salesStartDate,
        salesEnd: ticketConfigurations.salesEndDate,
        benefits: ticketConfigurations.benefits,
      })
      .from(eventTickets)
      .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
      .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
      .innerJoin(
        ticketConfigurations,
        eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
      )
      .where(
        and(
          eq(tickets.eventId, eventId),
          gt(ticketConfigurations.totalRemaining, 0),
          lte(ticketConfigurations.salesStartDate, sql`NOW()`),
          gte(ticketConfigurations.salesEndDate, sql`NOW()`),
        ),
      );
  }
}

export default new EventsService();

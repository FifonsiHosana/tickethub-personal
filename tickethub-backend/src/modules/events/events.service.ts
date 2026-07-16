import { db } from '@/db/client.js';
import {
  events,
  eventsVenues,
  eventImages,
  eventTickets,
  tickets,
  ticketTypes,
  ticketConfigurations,
} from '@/db/schema/index.js';

import { users } from '@/db/schema/index.js';

import { and, asc, eq, gt, lte, gte, sql } from 'drizzle-orm';

class EventsService {
  async getPublishedEvents() {
    const result = await db
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
      .where(
        and(
          eq(events.status, 'Published'),
          eq(events.approvalStatus, 'Approved'),
        ),
      )
      .orderBy(asc(events.dateAndTime));

    return result;
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

    const images = await db
      .select({
        imageUrl: eventImages.imageUrl,
        type: eventImages.type,
      })
      .from(eventImages)
      .where(eq(eventImages.eventId, eventId));

    return {
      ...event,
      images,
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

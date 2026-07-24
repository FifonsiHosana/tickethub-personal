import { db } from '@/db/client.js';

import {
  tickets,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  ticketConfigurations,
  events,
  eventsVenues,
  ticketTypes,
} from '@/db/schema/index.js';

import { eq, inArray } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import type { PurchaseTicketType } from './tickets.schema.js';
import { generateTicketIdentifier } from './tickets.utils.js';
import config from '@/config/config.js';

class TicketsService {
  async purchaseTickets(payload: PurchaseTicketType) {
    return await db.transaction(async (tx) => {
      const ticketIds = payload.items.map((item) => item.eventTicketId);

      const availableTickets = await tx
        .select({
          id: eventTickets.id,
          ticketId: eventTickets.ticketId,
          configurationId: eventTickets.ticketConfigurationId,
          ticketName: tickets.name,
          eventName: events.title,
          price: ticketConfigurations.price,
          totalSold: ticketConfigurations.totalSold,
          remaining: ticketConfigurations.totalRemaining,
          salesStart: ticketConfigurations.salesStartDate,
          salesEnd: ticketConfigurations.salesEndDate,
        })
        .from(eventTickets)
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(events, eq(tickets.eventId, events.id))
        .innerJoin(
          ticketConfigurations,
          eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
        )
        .where(inArray(eventTickets.id, ticketIds));

      if (availableTickets.length !== payload.items.length) {
        throw new AppError(400, 'One or more tickets are unavailable.');
      }

      for (const item of payload.items) {
        const ticket = availableTickets.find(
          (t) => t.id === item.eventTicketId,
        );

        if (!ticket) {
          throw new AppError(404, 'Ticket not found.');
        }

        const now = new Date();

        if (now < new Date(ticket.salesStart)) {
          throw new AppError(
            400,
            `${ticket.ticketName} sales have not started.`,
          );
        }

        if (now > new Date(ticket.salesEnd)) {
          throw new AppError(400, `${ticket.ticketName} sales have ended.`);
        }

        if (ticket.remaining < item.quantity) {
          throw new AppError(
            400,
            `Not enough ${ticket.ticketName} tickets available.`,
          );
        }
      }

      const totalQuantity = payload.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const userId = payload.userId ? payload.userId : null;

      const [order] = await tx
        .insert(ticketOrders)
        .values({
          userId,
          status: 'Pending',
          quantity: totalQuantity,
        })
        .$returningId();

      await tx.insert(ticketOrderUserDetails).values({
        orderId: order?.id,
        firstName: payload.attendee.firstName,
        lastName: payload.attendee.lastName,
        email: payload.attendee.email,
        phoneNumber: payload.attendee.phoneNumber,
      });

      const generatedTickets: {
        orderId: number;
        eventTicketId: number;
        ticketIdentifier: string;
        qrCodeUrl: string;
      }[] = [];

      for (const item of payload.items) {
        const ticket = availableTickets.find(
          (t) => t.id === item.eventTicketId,
        );

        if (!ticket) continue;

        for (let i = 0; i < item.quantity; i++) {
          const identifier = `${generateTicketIdentifier(ticket.eventName)}`;

          generatedTickets.push({
            orderId: order!.id,
            eventTicketId: item.eventTicketId,
            ticketIdentifier: identifier,
            qrCodeUrl: `${config.appUrl}/t/${identifier}`,
          });
        }
      }

      await tx.insert(ticketOrderItems).values(generatedTickets);
      return {
        orderId: order?.id,
        tickets: generatedTickets,
        quantity: totalQuantity,
      };
    });
  }

  async getTicketByIdentifier(identifier: string) {
    const [ticket] = await db
      .select({
        id: ticketOrderItems.id,
        ticketIdentifier: ticketOrderItems.ticketIdentifier,
        qrCodeUrl: ticketOrderItems.qrCodeUrl,
        checkedIn: ticketOrderItems.checkedIn,
        checkedInAt: ticketOrderItems.checkedInAt,
        ticketName: tickets.name,
        ticketType: ticketTypes.name,
        price: ticketConfigurations.price,
        eventName: events.title,
        eventDate: events.dateAndTime,
        venueName: eventsVenues.venue_name,
        venueCity: eventsVenues.city_or_town,
        venueCountry: eventsVenues.country,
        orderStatus: ticketOrders.status,
        purchaserFirstName: ticketOrderUserDetails.firstName,
        purchaserLastName: ticketOrderUserDetails.lastName,
        purchaserEmail: ticketOrderUserDetails.email,
      })
      .from(ticketOrderItems)
      .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
      .innerJoin(
        ticketOrderUserDetails,
        eq(ticketOrders.id, ticketOrderUserDetails.orderId),
      )
      .innerJoin(
        eventTickets,
        eq(ticketOrderItems.eventTicketId, eventTickets.id),
      )
      .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
      .innerJoin(events, eq(tickets.eventId, events.id))
      .innerJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
      .innerJoin(
        ticketConfigurations,
        eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
      )
      .where(eq(ticketOrderItems.ticketIdentifier, identifier))
      .limit(1);

    return ticket ?? null;
  }

  async checkInTicket(ticketIdentifier: string, checkedInBy: number) {
    const [ticket] = await db
      .select()
      .from(ticketOrderItems)
      .where(eq(ticketOrderItems.ticketIdentifier, ticketIdentifier))
      .limit(1);

    if (!ticket) {
      throw new AppError(404, 'Ticket not found.');
    }

    if (ticket.checkedIn) {
      throw new AppError(400, 'Ticket has already been checked in.');
    }

    await db
      .update(ticketOrderItems)
      .set({
        checkedIn: true,
        checkedInAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        checkedInBy,
      })
      .where(eq(ticketOrderItems.id, ticket.id));

    return {
      message: 'Ticket checked in successfully.',
      ticketIdentifier: ticket.ticketIdentifier,
    };
  }
}

export default new TicketsService();

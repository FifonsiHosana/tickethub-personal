import { randomUUID } from 'crypto';

import { db } from '@/db/client.js';

import {
  tickets,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  ticketConfigurations,
  ticketTypes,
  events,
} from '@/db/schema/index.js';

import { eq, inArray } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import type { PurchaseTicketType } from './tickets.schema.js';

class TicketsService {
  async purchaseTickets(payload: PurchaseTicketType) {
    return await db.transaction(async (tx) => {
      /**
       * Collect ticket IDs
       */
      const ticketIds = payload.items.map((item) => item.eventTicketId);

      /**
       * Fetch requested tickets
       */
      const availableTickets = await tx
        .select({
          id: eventTickets.id,
          ticketId: eventTickets.ticketId,
          configurationId: eventTickets.ticketConfigurationId,
          ticketName: tickets.name,
          price: ticketConfigurations.price,
          totalSold: ticketConfigurations.totalSold,
          remaining: ticketConfigurations.totalRemaining,
          salesStart: ticketConfigurations.salesStartDate,
          salesEnd: ticketConfigurations.salesEndDate,
        })
        .from(eventTickets)
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(
          ticketConfigurations,
          eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
        )
        .where(inArray(eventTickets.id, ticketIds));

      if (availableTickets.length !== payload.items.length) {
        throw new AppError(400, 'One or more tickets are unavailable.');
      }

      /**
       * Validate inventory
       */
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

      /**
       * Calculate total quantity
       */
      const totalQuantity = payload.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const userId = payload.userId ? payload.userId : null;

      /**

      /**
       * Create order
       */
      const [order] = await tx
        .insert(ticketOrders)
        .values({
          userId,
          status: 'Pending',
          quantity: totalQuantity,
        })
        .$returningId();

      /**
       * Save purchaser details
       */
      await tx.insert(ticketOrderUserDetails).values({
        orderId: order?.id,
        firstName: payload.attendee.firstName,
        lastName: payload.attendee.lastName,
        email: payload.attendee.email,
        phoneNumber: payload.attendee.phoneNumber,
      });

      const generatedTickets = [];

      /**
       * Generate individual tickets
       */
      for (const item of payload.items) {
        const ticket = availableTickets.find(
          (t) => t.id === item.eventTicketId,
        );

        if (!ticket) continue;

        for (let i = 0; i < item.quantity; i++) {
          const identifier = `TKT-${randomUUID()}`;

          generatedTickets.push({
            orderId: order?.id,

            eventTicketId: item.eventTicketId,

            ticketIdentifier: identifier,

            qrCodeUrl: identifier,
          });
        }

        /**
         * Update inventory
         */
        await tx
          .update(ticketConfigurations)
          .set({
            totalSold: ticket.totalSold + item.quantity,
            totalRemaining: ticket.remaining - item.quantity,
          })
          .where(eq(ticketConfigurations.id, ticket.configurationId!));
      }

      /**
       * Insert generated tickets
       */
      await tx.insert(ticketOrderItems).values(generatedTickets);
      return {
        orderId: order?.id,
        tickets: generatedTickets,
        quantity: totalQuantity,
      };
    });
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

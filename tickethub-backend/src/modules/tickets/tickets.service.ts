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
  eventStaff,
  payments,
} from '@/db/schema/index.js';

import { eq, and, inArray, sql, asc, desc } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import type { PurchaseTicketType } from './tickets.schema.js';
import { generateTicketIdentifier } from './tickets.utils.js';
import config from '@/config/config.js';
import { buildPurchaseConfirmationEmail } from '../emails/templates/ticketPurchase.template.js';
import { getOrderForResend, type ResendTicketItem } from './tickets.query.js';
import { sendMail } from '../emails/emails.service.js';
import { randomBytes } from 'crypto';
import { sendTicket } from '../ussd-payment/ussd-payment.utils.js';

function buildResendTicketSms(params: {
  attendeeName: string;
  orderId: number;
  tickets: ResendTicketItem[];
}) {
  const ticketLines = params.tickets
    .map(
      (ticket, index) =>
        `${index + 1}. ${ticket.eventName}\n` +
        `Ticket: ${ticket.ticketName}\n` +
        `Type: ${ticket.ticketType}\n` +
        `Code: ${ticket.ticketIdentifier}\n` +
        `Link: ${ticket.qrCodeUrl}`,
    )
    .join('\n\n');

  return (
    `Hi ${params.attendeeName || 'there'}, your TicketHub tickets for order #${params.orderId}:\n\n` +
    ticketLines
  );
}

class TicketsService {
  async purchaseTickets(payload: PurchaseTicketType, userId: number | null) {
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
      const orderReference = `${randomBytes(8).toString('hex')}`;
      const [order] = await tx
        .insert(ticketOrders)
        .values({
          userId,
          status: 'Pending',
          quantity: totalQuantity,
          reference: orderReference,
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
        reference: orderReference,
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
      .select({
        id: ticketOrderItems.id,
        checkedIn: ticketOrderItems.checkedIn,
        checkedInAt: ticketOrderItems.checkedInAt,
        ticketIdentifier: ticketOrderItems.ticketIdentifier,
        firstName: ticketOrderUserDetails.firstName,
        lastName: ticketOrderUserDetails.lastName,
        ticketType: ticketTypes.name,
        eventId: events.id,
        organizerId: events.organizerId,
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
      .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
      .where(eq(ticketOrderItems.ticketIdentifier, ticketIdentifier))
      .limit(1);

    if (!ticket) {
      throw new AppError(404, 'Ticket not found.');
    }

    if (ticket.organizerId !== checkedInBy) {
      const [staff] = await db
        .select()
        .from(eventStaff)
        .where(
          and(
            eq(eventStaff.event_id, ticket.eventId),
            eq(eventStaff.staff_id, checkedInBy),
          ),
        )
        .limit(1);

      if (!staff) {
        throw new AppError(
          403,
          'You are not authorized to check in this ticket.',
        );
      }
    }

    const attendeeName = [ticket.firstName, ticket.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (ticket.checkedIn) {
      return {
        status: 'already_used' as const,
        message: 'Ticket has already been checked in.',
        ticketIdentifier: ticket.ticketIdentifier,
        attendeeName,
        ticketType: ticket.ticketType,
        checkedInAt: ticket.checkedInAt,
      };
    }

    const checkedInAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db
      .update(ticketOrderItems)
      .set({
        checkedIn: true,
        checkedInAt,
        checkedInBy,
      })
      .where(eq(ticketOrderItems.id, ticket.id));

    return {
      status: 'valid' as const,
      message: 'Ticket checked in successfully.',
      ticketIdentifier: ticket.ticketIdentifier,
      attendeeName,
      ticketType: ticket.ticketType,
      checkedInAt,
    };
  }

  async resendEmail(orderId: number) {
    const {
      orderId: id,
      orderItems,
      amount,
      customerEmail,
      customerPhoneNumber,
      attendeeName,
      accountCreated,
    } = await getOrderForResend(orderId);

    const sendEmail = async () => {
      const { html: emailHtml, attachments } =
        await buildPurchaseConfirmationEmail({
          orderId: id,
          items: orderItems,
          total: Number(amount),
          accountCreated,
          email: customerEmail,
        });

      await sendMail(
        customerEmail,
        'Your TicketHub Tickets',
        'Your ticket purchase has been confirmed',
        emailHtml,
        undefined,
        attachments,
      );
    };

    const sendSms = () =>
      sendTicket(
        customerPhoneNumber,
        buildResendTicketSms({
          attendeeName,
          orderId: id,
          tickets: orderItems,
        }),
      );

    const [emailResult, smsResult] = await Promise.allSettled([
      sendEmail(),
      sendSms(),
    ]);

    return {
      orderId: id,
      totalTickets: orderItems.length,
      emailSent: emailResult.status === 'fulfilled',
      smsSent: smsResult.status === 'fulfilled' && smsResult.value === true,
    };
  }
  async getAttendeePhoneNumbersByEvent(
    eventId: number,
    selectedGroupIds: number[] = [],
  ): Promise<string[]> {
    const filters = [eq(tickets.eventId, eventId)];

    if (selectedGroupIds.length > 0) {
      const normalizedGroupIds = [
        ...new Set(
          selectedGroupIds.filter((id) => Number.isFinite(id) && id > 0),
        ),
      ];
      if (normalizedGroupIds.length > 0) {
        const ticketTypeFilter = sql`EXISTS (
          SELECT 1
          FROM ${eventTickets}
          WHERE ${eventTickets.id} = ${ticketOrderItems.eventTicketId}
            AND (${eventTickets.ticketTypeId} IN (${normalizedGroupIds.join(',')}) OR ${eventTickets.id} IN (${normalizedGroupIds.join(',')}))
        )`;
        filters.push(ticketTypeFilter);
      }
    }

    const results = await db
      .select({
        phoneNumber: ticketOrderUserDetails.phoneNumber,
      })
      .from(ticketOrderUserDetails)
      .innerJoin(
        ticketOrderItems,
        eq(ticketOrderUserDetails.orderId, ticketOrderItems.orderId),
      )
      .innerJoin(
        eventTickets,
        eq(ticketOrderItems.eventTicketId, eventTickets.id),
      )
      .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
      .where(and(...filters));

    const phoneNumbers = results.map((row) => row.phoneNumber);
    return [...new Set(phoneNumbers)];
  }

  async generateTickets(payload: { orderId: number }) {
    const { orderId } = payload;

    // Everything that touches the DB happens in one transaction.
    const result = await db.transaction(async (tx) => {
      // 1. Order
      const [order] = await tx
        .select({
          id: ticketOrders.id,
          status: ticketOrders.status,
          quantity: ticketOrders.quantity,
        })
        .from(ticketOrders)
        .where(eq(ticketOrders.id, orderId));

      if (!order) throw new AppError(404, 'Order not found.');

      // 2. Who to send to
      const [attendee] = await tx
        .select({
          firstName: ticketOrderUserDetails.firstName,
          lastName: ticketOrderUserDetails.lastName,
          email: ticketOrderUserDetails.email,
          phoneNumber: ticketOrderUserDetails.phoneNumber,
        })
        .from(ticketOrderUserDetails)
        .where(eq(ticketOrderUserDetails.orderId, orderId));

      if (!attendee) {
        throw new AppError(404, 'Order attendee details not found.');
      }

      // 3. Tickets that already exist on this order
      const existing = await tx
        .select({ eventTicketId: ticketOrderItems.eventTicketId })
        .from(ticketOrderItems)
        .where(eq(ticketOrderItems.orderId, orderId));

      // 4. Fill the gap, only if we can tell which ticket type is missing
      const missing = order.quantity - existing.length;

      if (missing > 0) {
        const typeIds = [
          ...new Set(
            existing
              .map((i) => i.eventTicketId)
              .filter((id): id is number => id !== null),
          ),
        ];

        if (typeIds.length !== 1) {
          throw new AppError(
            409,
            'Cannot tell which ticket type is missing on this order. Add it manually.',
          );
        }

        const eventTicketId = typeIds[0]!;

        const [info] = await tx
          .select({ eventName: events.title })
          .from(eventTickets)
          .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
          .innerJoin(events, eq(tickets.eventId, events.id))
          .where(eq(eventTickets.id, eventTicketId));

        if (!info) throw new AppError(404, 'Ticket not found.');

        const newTickets = Array.from({ length: missing }, () => {
          const identifier = generateTicketIdentifier(info.eventName);
          return {
            orderId,
            eventTicketId,
            ticketIdentifier: identifier,
            qrCodeUrl: `${config.appUrl}/t/${identifier}`,
          };
        });

        await tx.insert(ticketOrderItems).values(newTickets);
      }

      // 5. Load the full, final ticket list (old + new)
      const allTickets = await tx
        .select({
          ticketIdentifier: ticketOrderItems.ticketIdentifier,
          qrCodeUrl: ticketOrderItems.qrCodeUrl,
          ticketName: tickets.name,
          ticketType: ticketTypes.name,
          price: ticketConfigurations.price,
          eventName: events.title,
          eventDate: events.dateAndTime,
          venueName: eventsVenues.venue_name, // <-- confirm this column name
        })
        .from(ticketOrderItems)
        .innerJoin(
          eventTickets,
          eq(ticketOrderItems.eventTicketId, eventTickets.id),
        )
        .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
        .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
        .innerJoin(
          ticketConfigurations,
          eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
        )
        .innerJoin(events, eq(tickets.eventId, events.id))
        .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
        .where(eq(ticketOrderItems.orderId, orderId))
        .orderBy(asc(ticketOrderItems.id));

      if (allTickets.length === 0) {
        throw new AppError(409, 'This order has no tickets to send.');
      }

      // Total: completed payment if there is one, otherwise list price
      const [payment] = await tx
        .select({ amount: payments.amount })
        .from(payments)
        .where(
          and(eq(payments.orderId, orderId), eq(payments.status, 'Completed')),
        )
        .orderBy(desc(payments.id))
        .limit(1);

      const total = payment
        ? Number(payment.amount)
        : allTickets.reduce((sum, t) => sum + Number(t.price), 0);

      return {
        orderId: order.id,
        attendee,
        tickets: allTickets,
        total,
        generated: Math.max(missing, 0),
      };
    });

    // 6. Notify AFTER the transaction commits, so a failed email/SMS
    //    never rolls back tickets that were legitimately created.
    const { attendee, tickets: finalTickets, total } = result;
    const first = finalTickets[0]!;

    const sendEmail = async () => {
      const { html, attachments } = await buildPurchaseConfirmationEmail({
        orderId,
        total,
        items: finalTickets,
        accountCreated: false, // this is a resend, not a new signup
        email: attendee.email,
      });

      await sendMail(
        attendee.email,
        'Your TicketHub Tickets',
        'Your ticket purchase has been confirmed',
        html,
        undefined,
        attachments,
      );
    };

    const sendSms = () =>
      sendTicket(
        attendee.phoneNumber,
        `${first.eventName}\n\n` +
          `Ticket ID: ${first.ticketIdentifier}\n` +
          `Ticket Type: ${first.ticketName}\n` +
          `Quantity: ${finalTickets.length}\n\n` +
          `View Tickets: ${first.qrCodeUrl}`,
      );

    // No `await` inside the array: both run in parallel, and one failing
    // can't stop the other.
    const [emailResult, smsResult] = await Promise.allSettled([
      sendEmail(),
      sendSms(),
    ]);

    await db
      .update(ticketOrders)
      .set({ status: 'Completed' })
      .where(eq(ticketOrders.id, orderId));

    return {
      orderId: result.orderId,
      generated: result.generated,
      totalTickets: finalTickets.length,
      tickets: finalTickets,
      emailSent: emailResult.status === 'fulfilled',
      // sendTicket resolves false on failure instead of throwing
      smsSent: smsResult.status === 'fulfilled' && smsResult.value === true,
    };
  }
}

export default new TicketsService();

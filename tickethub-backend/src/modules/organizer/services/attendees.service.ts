import { db } from '@/db/client.js';
import { and, eq, desc, count } from 'drizzle-orm';
import {
  tickets,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  ticketTypes,
  ticketConfigurations,
} from '@/db/schema/index.js';

interface GetAttendeesParams {
  eventId: number;
  page: number;
  pageSize: number;
}

export async function getEventAttendees(params: GetAttendeesParams) {
  const { eventId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      firstName: ticketOrderUserDetails.firstName,
      lastName: ticketOrderUserDetails.lastName,
      email: ticketOrderUserDetails.email,
      phoneNumber: ticketOrderUserDetails.phoneNumber,
      ticketType: ticketTypes.name,
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      checkedIn: ticketOrderItems.checkedIn,
      checkedInAt: ticketOrderItems.checkedInAt,
      price: ticketConfigurations.price,
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
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(
      and(
        eq(tickets.eventId, eventId),
        eq(ticketOrders.status, 'Completed'),
      ),
    )
    .orderBy(desc(ticketOrders.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countResult] = await db
    .select({ total: count() })
    .from(ticketOrderItems)
    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .where(
      and(
        eq(tickets.eventId, eventId),
        eq(ticketOrders.status, 'Completed'),
      ),
    );

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: Number(countResult?.total ?? 0),
      totalPages: Math.ceil(Number(countResult?.total ?? 0) / pageSize),
    },
  };
}

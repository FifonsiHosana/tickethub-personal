import { db } from '@/db/client.js';
import { and, eq, desc, count, like, or, sql } from 'drizzle-orm';
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
  search: string;
}

export async function getEventAttendees(params: GetAttendeesParams) {
  const { eventId, page = 1, pageSize = 10, search } = params;
  const offset = (page - 1) * pageSize;

  const filters: any[] = [];

  if (search) {
    filters.push(
      or(
        like(ticketOrderUserDetails.firstName, `%${search}%`),
        like(ticketOrderUserDetails.lastName, `%${search}%`),
        like(ticketOrderUserDetails.email, `%${search}%`),
        like(
          sql`CONCAT(${ticketOrderUserDetails.firstName}, ' ', ${ticketOrderUserDetails.lastName})`,
          `%${search}%`,
        ),
        like(
          sql`CONCAT(${ticketOrderUserDetails.lastName}, ' ', ${ticketOrderUserDetails.firstName})`,
          `%${search}%`,
        ),
      ),
    );
  }

  const data = await db
    .select({
      orderId: ticketOrders.id,
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
        ...filters,
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
      and(eq(tickets.eventId, eventId), eq(ticketOrders.status, 'Completed')),
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

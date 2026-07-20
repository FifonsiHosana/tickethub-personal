import { db } from '@/db/client.js';
import {
  events,
  tickets,
  eventTickets,
  ticketOrders,
  ticketOrderItems,
  payments,
} from '@/db/schema/index.js';

import { and, eq, sql, desc, gte } from 'drizzle-orm';

/**
 * Main organizer dashboard service
 */
export async function getOrganizerDashboard(organizerId: number) {
  const [statistics, upcomingEvents, recentSales, topSellingEvents] =
    await Promise.all([
      getOrganizerStatistics(organizerId),

      getUpcomingEvents(organizerId),

      getRecentSales(organizerId),

      getTopSellingEvents(organizerId),
    ]);

  return {
    statistics,
    upcomingEvents,
    recentSales,
    topSellingEvents,
  };
}

/**
 * Dashboard statistic cards
 */
async function getOrganizerStatistics(organizerId: number) {
  const eventStats = await db
    .select({
      totalEvents: sql<number>`COUNT(*)`,
      publishedEvents: sql<number>`
      SUM(
        CASE
          WHEN ${events.status} = 'Published' THEN 1
          ELSE 0
        END
      )
    `,
      draftEvents: sql<number>`
      SUM(
        CASE
          WHEN ${events.status} = 'Draft' THEN 1
          ELSE 0
        END
      )
    `,
      completedEvents: sql<number>`
      SUM(
        CASE
          WHEN ${events.status} = 'Completed' THEN 1
          ELSE 0
        END
      )
    `,
    })
    .from(events)
    .where(eq(events.organizerId, organizerId));

  const ticketStats = await db
    .select({
      ticketsSold: sql<number>`
            COUNT(${ticketOrderItems.id})
          `,

      orders: sql<number>`
            COUNT(DISTINCT ${ticketOrders.id})
          `,
    })
    .from(ticketOrderItems)

    .innerJoin(ticketOrders, eq(ticketOrderItems.orderId, ticketOrders.id))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(events.organizerId, organizerId),

        eq(ticketOrders.status, 'Completed'),
      ),
    );

  const revenue = await db
    .select({
      totalRevenue: sql<string>`
            COALESCE(
              SUM(${payments.amount}),
              0
            )
          `,
    })

    .from(payments)

    .innerJoin(ticketOrders, eq(payments.orderId, ticketOrders.id))

    .innerJoin(ticketOrderItems, eq(ticketOrderItems.orderId, ticketOrders.id))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(
      and(
        eq(events.organizerId, organizerId),

        eq(payments.status, 'Completed'),
      ),
    );

  return {
    totalEvents: Number(eventStats[0]?.totalEvents ?? 0),

    publishedEvents: Number(eventStats[0]?.publishedEvents ?? 0),

    draftEvents: Number(eventStats[0]?.draftEvents ?? 0),

    completedEvents: Number(eventStats[0]?.completedEvents ?? 0),

    totalTicketsSold: Number(ticketStats[0]?.ticketsSold ?? 0),

    totalOrders: Number(ticketStats[0]?.orders ?? 0),

    totalRevenue: Number(revenue[0]?.totalRevenue ?? 0),
  };
}

/**
 * Upcoming organizer events
 */
async function getUpcomingEvents(organizerId: number) {
  return db
    .select()
    .from(events)

    .where(
      and(
        eq(events.organizerId, organizerId),

        gte(events.dateAndTime, new Date().toISOString()),
      ),
    )

    .orderBy(events.dateAndTime)

    .limit(5);
}

/**
 * Latest ticket purchases
 */
async function getRecentSales(organizerId: number) {
  return db
    .select({
      orderId: ticketOrders.id,

      customerId: ticketOrders.userId,

      status: ticketOrders.status,

      purchasedAt: ticketOrders.createdAt,
    })

    .from(ticketOrders)

    .innerJoin(ticketOrderItems, eq(ticketOrderItems.orderId, ticketOrders.id))

    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(events, eq(tickets.eventId, events.id))

    .where(eq(events.organizerId, organizerId))

    .groupBy(ticketOrders.id)

    .orderBy(desc(ticketOrders.createdAt))

    .limit(5);
}

/**
 * Top selling events
 */
async function getTopSellingEvents(organizerId: number) {
  return db

    .select({
      eventId: events.id,

      eventTitle: events.title,

      ticketsSold: sql<number>`
          COUNT(
            ${ticketOrderItems.id}
          )
        `,
    })

    .from(events)

    .innerJoin(tickets, eq(tickets.eventId, events.id))

    .innerJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))

    .innerJoin(
      ticketOrderItems,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )

    .where(eq(events.organizerId, organizerId))

    .groupBy(events.id)

    .orderBy(
      desc(
        sql`
          COUNT(
            ${ticketOrderItems.id}
          )
        `,
      ),
    )

    .limit(5);
}
